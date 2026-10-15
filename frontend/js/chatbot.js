// CyberSaarthi Assistant Chatbot & Voice Support Module

let speechRecognition = null;
let isListening = false;
let ttsEnabled = true;

document.addEventListener('DOMContentLoaded', () => {
    initSpeechRecognition();
});

function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        speechRecognition = new SpeechRecognition();
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;
        speechRecognition.lang = 'en-IN';

        speechRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chat-input').value = transcript;
            sendChatMessage();
        };

        speechRecognition.onend = () => {
            isListening = false;
            updateMicIcon();
        };
    }
}

function toggleVoiceInput() {
    if (!speechRecognition) {
        alert('Voice support is not available in this browser. Please type your message.');
        return;
    }

    if (isListening) {
        speechRecognition.stop();
        isListening = false;
    } else {
        speechRecognition.start();
        isListening = true;
    }
    updateMicIcon();
}

function updateMicIcon() {
    const micBtn = document.getElementById('mic-toggle-btn');
    if (micBtn) {
        micBtn.innerHTML = isListening ? '🔴 Listening...' : '🎙 Voice Input';
        micBtn.style.background = isListening ? '#dc2626' : '#2563eb';
    }
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    appendChatMessage(msg, 'user');
    input.value = '';

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userMessage: msg, language: currentLang })
        });
        const data = await response.json();
        appendChatMessage(data.botReply, 'bot', data.riskLevel);
        if (ttsEnabled) speakText(data.botReply);
    } catch (err) {
        // Fallback local chatbot responses
        const botReply = getLocalBotReply(msg);
        appendChatMessage(botReply, 'bot', 'INFO');
        if (ttsEnabled) speakText(botReply);
    }
}

function appendChatMessage(text, sender, riskLevel = 'INFO') {
    const container = document.getElementById('chat-messages-container');
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${sender}`;

    if (sender === 'bot') {
        let riskHeader = '';
        if (riskLevel === 'HIGH RISK') riskHeader = '<div style="color:#dc2626; font-weight:800; margin-bottom:4px;">⚠ HIGH RISK ALERT</div>';
        bubble.innerHTML = `${riskHeader}<div>${text}</div>`;
    } else {
        bubble.innerText = text;
    }

    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function sendQuickAction(actionText) {
    if (actionText === 'Check Message' || actionText === 'Check Link') {
        switchTab('checker-tab');
    } else if (actionText === 'Emergency Help') {
        triggerEmergencyMode();
    } else if (actionText === 'Talk to Helpline') {
        openHelplineCallSimulator();
    } else {
        document.getElementById('chat-input').value = actionText;
        sendChatMessage();
    }
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // stop previous audio
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    }
}

function askBotAboutAnalysis(riskLevel) {
    switchTab('chatbot-tab');
    document.getElementById('chat-input').value = `I just analyzed a item and got ${riskLevel}. What should I do next?`;
    sendChatMessage();
}

function getLocalBotReply(msg) {
    const text = msg.toLowerCase();
    if (text.includes('bank') || text.includes('block') || text.includes('kyc')) {
        return "Do not click any link in the message. Banks generally do not ask you to share OTP, PIN or passwords. You can paste the message in the Checker section to verify it.";
    } else if (text.includes('otp')) {
        return "Never share your OTP with anyone! Banks and official customer care will NEVER ask for your OTP over a call or SMS.";
    } else if (text.includes('link')) {
        return "If you clicked a suspicious link, immediately disconnect your mobile data/Wi-Fi and change your internet banking passwords.";
    }
    return "CyberSaarthi Assistant is here to protect you. Paste any suspicious text, link, or phone number to analyze it.";
}
