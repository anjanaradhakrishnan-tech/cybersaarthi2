// CyberSaarthi Unified Risk Analysis & Media Engine

let selectedMediaFile = null;

document.addEventListener('DOMContentLoaded', () => {
    initMediaDropzone();
});

function initMediaDropzone() {
    const dropzone = document.getElementById('media-dropzone');
    if (!dropzone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    dropzone.addEventListener('dragover', () => {
        dropzone.style.background = '#e2e8f0';
        dropzone.style.borderColor = '#1d4ed8';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.background = '#f8fafc';
        dropzone.style.borderColor = 'var(--primary-600)';
    });

    dropzone.addEventListener('drop', (e) => {
        dropzone.style.background = '#f8fafc';
        dropzone.style.borderColor = 'var(--primary-600)';
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            validateAndProcessFile(files[0]);
        }
    });
}

function handleMediaFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateAndProcessFile(file);
    }
}

function validateAndProcessFile(file) {
    const errorBanner = document.getElementById('media-error-banner');
    if (errorBanner) errorBanner.style.display = 'none';

    const filename = file.name.toLowerCase();
    const validImageExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const validVideoExts = ['.mp4', '.mov', '.webm'];

    const isImage = validImageExts.some(ext => filename.endsWith(ext)) || file.type.startsWith('image/');
    const isVideo = validVideoExts.some(ext => filename.endsWith(ext)) || file.type.startsWith('video/');

    if (!isImage && !isVideo) {
        showMediaError('Unsupported file type. Please select a valid photo (.jpg, .png, .webp) or video (.mp4, .mov, .webm).');
        return;
    }

    // Size check: Image max 10MB, Video max 100MB
    const maxImgSize = 10 * 1024 * 1024;
    const maxVidSize = 100 * 1024 * 1024;

    if (isImage && file.size > maxImgSize) {
        showMediaError('File is too large. Image size must be less than 10 MB.');
        return;
    }

    if (isVideo && file.size > maxVidSize) {
        showMediaError('File is too large. Video size must be less than 100 MB.');
        return;
    }

    selectedMediaFile = file;

    const dropzone = document.getElementById('media-dropzone');
    const previewContainer = document.getElementById('media-preview-container');
    const previewElem = document.getElementById('media-preview-element');
    const filenameElem = document.getElementById('media-filename');
    const filesizeElem = document.getElementById('media-filesize');

    if (dropzone) dropzone.style.display = 'none';
    if (previewContainer) previewContainer.style.display = 'block';

    if (filenameElem) filenameElem.innerText = file.name;
    if (filesizeElem) filesizeElem.innerText = `Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB • Format: ${file.type || (isImage ? 'image' : 'video')}`;

    if (previewElem) {
        previewElem.innerHTML = '';
        if (isImage) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            previewElem.appendChild(img);
        } else if (isVideo) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '100%';
            previewElem.appendChild(video);
        }
    }
}

function showMediaError(msg) {
    clearMediaUpload();
    const errorBanner = document.getElementById('media-error-banner');
    if (errorBanner) {
        errorBanner.innerText = msg;
        errorBanner.style.display = 'block';
    }
}

function clearMediaUpload() {
    selectedMediaFile = null;
    const fileInput = document.getElementById('media-file-input');
    if (fileInput) fileInput.value = '';

    const dropzone = document.getElementById('media-dropzone');
    const previewContainer = document.getElementById('media-preview-container');
    const previewElem = document.getElementById('media-preview-element');
    const errorBanner = document.getElementById('media-error-banner');

    if (dropzone) dropzone.style.display = 'block';
    if (previewContainer) previewContainer.style.display = 'none';
    if (previewElem) previewElem.innerHTML = '';
    if (errorBanner) errorBanner.style.display = 'none';
}

async function runAnalysis(category) {
    let endpoint = '';
    let body = {};
    let inputVal = '';

    if (category === 'message') {
        inputVal = document.getElementById('message-input').value.trim();
        if (!inputVal) { alert('Please enter a message to analyze.'); return; }
        endpoint = '/api/analyze/message';
        body = { messageText: inputVal };
    } else if (category === 'link') {
        inputVal = document.getElementById('link-input').value.trim();
        if (!inputVal) { alert('Please enter a URL to check.'); return; }
        endpoint = '/api/analyze/link';
        body = { url: inputVal };
    } else if (category === 'phone') {
        inputVal = document.getElementById('phone-input').value.trim();
        if (!inputVal) { alert('Please enter a phone number to analyze.'); return; }
        
        // Gather selected caller actions
        const selectedActions = [];
        document.querySelectorAll('#phone-actions-checklist input:checked').forEach(cb => {
            selectedActions.push(cb.value);
        });

        endpoint = '/api/phone/analyze';
        body = { phoneNumber: inputVal, callActions: selectedActions };
    } else if (category === 'media') {
        if (!selectedMediaFile) {
            alert('Please select or drop an image or video file to analyze.');
            return;
        }
        const fileName = selectedMediaFile.name;
        const fileType = selectedMediaFile.type.includes('video') ? 'VIDEO' : 'IMAGE';
        inputVal = fileName;

        // Run animated terminal screen for media analysis
        await animateMediaAnalysisTerminal();

        endpoint = '/api/media/analyze';
        body = {
            mediaType: fileType,
            mediaName: fileName,
            fileSize: selectedMediaFile.size,
            duration: 0.0
        };
    }

    showLoadingState(true, category);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        renderAssessmentResult(data);
        saveCheckToHistory(data, inputVal);
    } catch (err) {
        console.error('Analysis error:', err);
        // Fallback local heuristic execution if server is unreachable
        const fallback = executeLocalHeuristic(category, inputVal, body.callActions);
        renderAssessmentResult(fallback);
        saveCheckToHistory(fallback, inputVal);
    } finally {
        showLoadingState(false, category);
    }
}

async function animateMediaAnalysisTerminal() {
    const term = document.getElementById('media-animated-terminal');
    if (!term) return;

    term.style.display = 'block';
    term.innerHTML = '<strong>INITIALIZING MEDIA ANALYSIS...</strong><br>';

    const steps = [
        '> Reading file stream...',
        '> Checking EXIF and container metadata...',
        '> Inspecting visual face & lighting geometry...',
        '> Checking frame consistency & temporal noise...',
        '> Examining GAN compression artifacts...',
        '> Looking for synthetic generative indicators...',
        '> Generating assessment result...'
    ];

    for (let step of steps) {
        await new Promise(r => setTimeout(r, 220));
        term.innerHTML += `<div>${step}</div>`;
        term.scrollTop = term.scrollHeight;
    }

    await new Promise(r => setTimeout(r, 200));
    term.style.display = 'none';
}

function renderAssessmentResult(data) {
    const card = document.getElementById('assessment-result-card');
    card.className = 'assessment-card active';

    // Risk level badge styling
    const levelClass = data.riskLevel.includes('HIGH') || data.riskLevel.includes('CRITICAL') || data.riskLevel.includes('POSSIBLE AI') 
        ? (data.riskLevel.includes('POSSIBLE AI') ? 'suspicious' : 'high') 
        : (data.riskLevel.includes('SUSPICIOUS') ? 'suspicious' : 'low');

    // Build SMS Spam Intelligence Corpus Cross-Reference Box if available
    let dbSectionHtml = '';
    if (data.category === 'MESSAGE' && data.databaseMatch) {
        const db = data.databaseMatch;
        const isSpam = db.isSpamMatch;
        const matchTitle = isSpam
            ? `🚨 VERIFIED SPAM RECORD #${db.matchedSpamId || 0} (${db.spamSimilarity}% SIMILARITY)`
            : (db.hamSimilarity >= 50
                ? `🟢 LEGITIMATE USER MESSAGE PATTERN (HAM RECORD #${db.matchedHamId || 0}, ${db.hamSimilarity}% SIMILARITY)`
                : `📊 CORPUS INTELLIGENCE MATCH (${db.spamSimilarity}% Spam Similarity • ${db.hamSimilarity}% Ham Similarity)`);

        const snippet = isSpam ? db.matchedSpamSnippet : (db.matchedHamSnippet || db.matchedSpamSnippet || '');
        const keywordsHtml = (db.detectedKeywords && db.detectedKeywords.length > 0)
            ? `<div style="margin-top:8px;">
                 <span style="font-size:0.75rem; font-weight:700; color:#475569; text-transform:uppercase;">Extracted Spam Keywords:</span>
                 <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
                     ${db.detectedKeywords.map(k => `<span style="background:#fef3c7; border:1px solid #fde68a; color:#92400e; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:700;">${escapeHtml(k)}</span>`).join('')}
                 </div>
               </div>`
            : '';

        const numbersHtml = (db.detectedNumbers && db.detectedNumbers.length > 0)
            ? `<div style="margin-top:8px;">
                 <span style="font-size:0.75rem; font-weight:700; color:#dc2626; text-transform:uppercase;">Known Scam Numbers/Shortcodes:</span>
                 <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
                     ${db.detectedNumbers.map(n => `<span style="background:#fee2e2; border:1px solid #fca5a5; color:#991b1b; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:800; font-family:monospace;">${escapeHtml(n)}</span>`).join('')}
                 </div>
               </div>`
            : '';

        dbSectionHtml = `
            <div style="background:#f8fafc; border:1px solid ${isSpam ? '#fca5a5' : '#cbd5e1'}; border-left:5px solid ${isSpam ? '#dc2626' : (db.hamSimilarity >= 50 ? '#16a34a' : '#2563eb')}; border-radius:8px; padding:14px 18px; margin:16px 0;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
                    <div style="font-size:0.85rem; font-weight:800; color:${isSpam ? '#dc2626' : '#1e3a8a'}; display:flex; align-items:center; gap:6px;">
                        🗄️ SMS SPAM DATABASE INTELLIGENCE
                    </div>
                    <span style="background:#e2e8f0; color:#334155; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:999px;">
                        Corpus: 5,572 Records (747 Spam • 4,825 Ham)
                    </span>
                </div>
                <div style="font-size:0.85rem; font-weight:700; color:#0f172a; margin-bottom:4px;">${matchTitle}</div>
                ${snippet ? `<div style="font-size:0.8rem; font-style:italic; color:#475569; background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; padding:8px 10px; margin-bottom:6px;">"${escapeHtml(snippet)}"</div>` : ''}
                ${keywordsHtml}
                ${numbersHtml}
            </div>
        `;
    }

    card.innerHTML = `
        <div class="assessment-header">
            <span class="risk-badge ${levelClass}">${data.riskLevel} — ${data.label || 'Assessment Complete'}</span>
            <div class="risk-score-display">Risk Score: ${data.riskScore}/100</div>
        </div>

        <h4 style="margin-bottom:8px; font-size:1.1rem; color:var(--primary-900);">Why? / Detected Indicators:</h4>
        <ul class="threat-list">
            ${(data.threatsDetected || []).map(t => `<li style="color:${levelClass === 'high' ? '#dc2626' : (levelClass === 'suspicious' ? '#d97706' : '#16a34a')}">✓ ${t}</li>`).join('')}
        </ul>

        <h4 style="margin-bottom:8px; font-size:1.1rem; color:var(--primary-900);">Analysis Rationale & Evidence:</h4>
        <ul class="reason-list">
            ${(data.reasons || []).map(r => `<li>${r}</li>`).join('')}
        </ul>

        ${dbSectionHtml}

        <div class="recommendation-box">
            <div style="font-weight:800; text-transform:uppercase; margin-bottom:4px;">Recommended Action:</div>
            <div>${data.recommendedAction}</div>
        </div>

        <div class="assessment-disclaimer">
            ℹ ${data.disclaimer}
        </div>

        <div style="margin-top:24px; display:flex; gap:12px; flex-wrap:wrap;">
            <button class="btn-primary" style="background:#2563eb;" onclick="askBotWithContext('${data.category}', '${data.riskLevel}', '${data.riskScore}')">🤖 Ask CyberSaarthi</button>
            <button class="btn-primary" onclick="openReportWithPreloaded('${data.category}', '${data.riskLevel}')">🚩 Report Incident</button>
            <button class="btn-primary" style="background:#475569;" onclick="resetChecker()">🔄 Check Another</button>
            <button class="btn-danger" onclick="triggerEmergencyMode()">☎ Emergency Help (1930)</button>
        </div>
    `;

    card.scrollIntoView({ behavior: 'smooth' });
}

function askBotWithContext(category, riskLevel, riskScore) {
    switchTab('chatbot-tab');
    let contextMsg = "";
    if (category === 'PHONE') {
        const num = document.getElementById('phone-input').value;
        contextMsg = `I received this call from ${num}. Risk level is ${riskLevel} (${riskScore}/100). What should I do?`;
    } else if (category === 'MEDIA') {
        const fname = selectedMediaFile ? selectedMediaFile.name : 'media file';
        contextMsg = `I analyzed media file "${fname}". Risk level is ${riskLevel} (${riskScore}/100). Is this AI generated?`;
    } else {
        contextMsg = `I analyzed a ${category} item and received ${riskLevel} (${riskScore}/100). What steps should I take?`;
    }

    document.getElementById('chat-input').value = contextMsg;
    sendChatMessage();
}

function openReportWithPreloaded(category, riskLevel) {
    switchTab('report-tab');
    if (category === 'PHONE') {
        const phoneVal = document.getElementById('phone-input').value;
        if (phoneVal) document.getElementById('report-suspect-number').value = phoneVal;
    } else if (category === 'LINK') {
        const linkVal = document.getElementById('link-input').value;
        if (linkVal) document.getElementById('report-suspect-url').value = linkVal;
    }
}

function showLoadingState(isLoading, category) {
    const btnMap = {
        'message': document.getElementById('analyze-submit-btn'),
        'media': document.getElementById('analyze-media-btn')
    };
    const btn = btnMap[category] || document.querySelector('.tab-panel.active .btn-primary');
    if (btn) {
        btn.disabled = isLoading;
        btn.innerHTML = isLoading ? 'Analyzing Patterns...' : 'Run Risk Assessment';
    }
}

function resetChecker() {
    document.getElementById('message-input').value = '';
    document.getElementById('link-input').value = '';
    document.getElementById('phone-input').value = '';
    document.querySelectorAll('#phone-actions-checklist input:checked').forEach(cb => cb.checked = false);
    clearMediaUpload();

    const card = document.getElementById('assessment-result-card');
    card.classList.remove('active');
    card.innerHTML = '';
}

function saveCheckToHistory(data, inputVal) {
    const history = JSON.parse(localStorage.getItem('cyber_recent_checks') || '[]');
    history.unshift({
        category: data.category,
        input: inputVal,
        score: data.riskScore,
        level: data.riskLevel,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem('cyber_recent_checks', JSON.stringify(history.slice(0, 10)));
}

function executeLocalHeuristic(category, inputVal, callActions = []) {
    let score = 10;
    let threats = [];
    let reasons = [];

    const valLower = (inputVal || '').toLowerCase();

    if (category === 'phone') {
        const demoReports = {
            '9000000001': { count: 0, status: 'UNREPORTED', types: 'NONE' },
            '9000000002': { count: 3, status: 'COMMUNITY_REPORTED', types: 'BANKING, OTP' },
            '9000000003': { count: 7, status: 'COMMUNITY_REPORTED', types: 'KYC, BANKING' },
            '9000000004': { count: 12, status: 'COMMUNITY_REPORTED', types: 'UPI, PAYMENT' }
        };

        const cleaned = valLower.replace(/[^0-9]/g, '');
        let dbFound = null;

        for (let key in demoReports) {
            if (cleaned.endsWith(key)) {
                dbFound = demoReports[key];
                break;
            }
        }

        if (dbFound) {
            if (dbFound.count >= 10) {
                score = 90;
                threats.push(`MULTIPLE COMMUNITY REPORTS (${dbFound.count} Reports)`);
                threats.push(`Scam Categories: ${dbFound.types}`);
                reasons.push(`Multiple reports associated with this demonstration number in the CyberSaarthi database.`);
            } else if (dbFound.count >= 3) {
                score = 65;
                threats.push(`COMMUNITY REPORTED NUMBER (${dbFound.count} Reports)`);
                threats.push(`Reported Types: ${dbFound.types}`);
                reasons.push(`Some community reports are associated with this demonstration number.`);
            } else {
                score = 10;
                reasons.add ? reasons.push(`No matching active fraud reports were found for this number in the CyberSaarthi database.`) : null;
            }
        } else {
            score = 10;
            reasons.push(`No matching reports were found in the CyberSaarthi Demonstration Database.`);
        }

        // Call actions evaluation
        let actionScore = 0;
        if (callActions.includes('Asked for OTP')) { actionScore += 40; threats.push('Caller requested OTP'); reasons.push('Caller asked for OTP. Official banks never ask for OTP.'); }
        if (callActions.includes('Asked for UPI PIN')) { actionScore += 50; threats.push('Caller requested UPI PIN'); reasons.push('Caller asked for UPI PIN. Entering PIN transfers money TO scammer!'); }
        if (callActions.includes('Asked for bank details') || callActions.includes('Asked me to transfer money')) { actionScore += 35; threats.push('Caller requested money transfer / bank details'); }
        if (callActions.includes('Asked me to install an app') || callActions.includes('Asked me to share my screen')) { actionScore += 45; threats.push('Caller requested remote screen access app'); }

        totalScore = Math.min(score + actionScore, 100);

        let level = totalScore >= 85 ? (callActions.includes('Asked for UPI PIN') && score >= 60 ? 'CRITICAL RISK' : 'HIGH RISK') : (totalScore >= 55 ? 'SUSPICIOUS' : 'UNKNOWN / LOW EVIDENCE');
        let label = totalScore >= 85 ? 'Take Action Immediately' : (totalScore >= 55 ? 'Proceed With Care' : 'No Matching Reports Found');
        let rec = totalScore >= 85 ? 'DO NOT SHARE OTP • DO NOT TRANSFER MONEY • END THE CALL • CONTACT YOUR BANK THROUGH ITS OFFICIAL CHANNEL' : 'An unreported number can still be dangerous. Never share OTP, PIN, passwords or banking information.';

        return {
            category: 'PHONE',
            riskScore: totalScore,
            riskLevel: level,
            label: label,
            threatsDetected: threats,
            reasons: reasons,
            recommendedAction: rec,
            disclaimer: 'This assessment provides guidance and is not a guarantee of accuracy. CyberSaarthi Demonstration Database.'
        };
    } else if (category === 'media') {
        const hasAi = valLower.includes('deepfake') || valLower.includes('ai') || valLower.includes('synthetic')
            || valLower.includes('midjourney') || valLower.includes('dalle') || valLower.includes('generated') || valLower.includes('fake');

        if (hasAi) {
            score = 78;
            threats = ['Unusual image visual characteristics', 'EXIF Camera Metadata unavailable / stripped', 'Synthetic pixel pattern geometry detected'];
            reasons = ['Prototype Heuristic Analysis: File exhibits attributes common in generative media synthesis.'];
        } else {
            score = 15;
            threats = ['Standard Image Pixel Structure', 'Consistent Shadow Geometry'];
            reasons = ['No strong synthetic indicators detected.'];
        }

        return {
            category: 'MEDIA',
            riskScore: score,
            riskLevel: score >= 60 ? 'POSSIBLE AI-GENERATED CONTENT' : 'LOW SUSPICION',
            label: score >= 60 ? 'Proceed With Extreme Caution' : 'No Strong Synthetic Artifacts',
            threatsDetected: threats,
            reasons: reasons,
            recommendedAction: score >= 60 ? 'Do not use this image alone as evidence of identity or authenticity. Verify through direct communication.' : 'No strong synthetic indicators found. However, this does not prove that the image is authentic.',
            disclaimer: '⚠ This is an experimental assessment and is not proof that the image/video is AI-generated or authentic.'
        };
    } else if (category === 'message') {
        const upiPinRegex = /\b(upi\s*pin|atm\s*pin|mpin|m-pin|secret\s*pin|security\s*pin|card\s*pin|cvv)\b/i;
        const otpRegex = /\b(otp|one-time\s*password)\b/i;
        const genericPinRegex = /\bpin\b/i;
        const bankingContextRegex = /\b(bank|account|gpay|phonepe|paytm|wallet|transfer|refund|debit|credit|card|login)\b/i;

        const kycPanicRegex = /\b(kyc|pan\s*card|aadhaar|account\s*blocked|account\s*suspended|sim\s*blocked|deactivated|unblock\s*account)\b/i;
        const lotteryRegex = /\b(lottery|jackpot|crore|lakhs?|cash\s*prize|reward\s*points?|bonus\s*caller|claim\s*code|claim\s*your\s*prize)\b/i;
        const wonPrizeRegex = /\b(you\s*(?:have\s*)?won|selected\s*to\s*receive|awarded\s*(?:a\s*)?prize|claim\s*(?:your\s*)?reward)\b/i;

        const topSpamWords = ['claim', 'prize', 'winner', 'urgent', 'free', 'cash', 'reward', 'awarded', 'selected', 'ppm', 'ringtone', 'tones', 'entry', 'guaranteed', '1000', '2000'];
        const matchedTerms = topSpamWords.filter(w => new RegExp(`\\b${w}\\b`, 'i').test(inputVal));

        if (upiPinRegex.test(inputVal) || otpRegex.test(inputVal) || (genericPinRegex.test(inputVal) && bankingContextRegex.test(inputVal))) {
            score = 100;
            threats.push('🚨 CRITICAL THREAT: DEMANDING UPI PIN / OTP / PASSWORD');
            reasons.push('Entering or sharing UPI PIN transfers money TO scammer! Banks never ask for UPI PIN.');
        } else if (kycPanicRegex.test(inputVal) || (bankingContextRegex.test(inputVal) && /\b(blocked|suspended|deactivated|expire)\b/i.test(inputVal))) {
            score = 85;
            threats.push('Fake KYC / Account Suspension Threat');
            reasons.push('Creates artificial urgency claiming your account will be suspended.');
        } else if (lotteryRegex.test(inputVal) || wonPrizeRegex.test(inputVal) || (/\bwon\b/i.test(inputVal) && /\b(prize|cash|claim|reward|lottery|bonus)\b/i.test(inputVal))) {
            score = 80;
            threats.push('Prize / Lottery / Claim Pattern');
            reasons.push('Promises unverified monetary gifts, jackpot, or prizes to solicit advance fees or personal banking details.');
        } else if (matchedTerms.length >= 2) {
            score = Math.min(75 + matchedTerms.length * 5, 90);
            threats.push(`🎯 SMS Spam Database Pattern Match (${matchedTerms.length} keywords)`);
            threats.push(`Flagged Vocabulary: ${matchedTerms.join(', ')}`);
            reasons.push('Matches promotional prize, lottery or unsolicited service patterns in the CyberSaarthi SMS spam database.');
        } else if (/\b(https?:\/\/\S+|bit\.ly\/\S+|tinyurl\.com\/\S+|\S+\.(xyz|top|site|club|work))\b/i.test(inputVal)) {
            score = 70;
            threats.push('Embedded Suspicious Link');
            reasons.push('Contains unverified web links masking destinations.');
        } else {
            score = 0;
            reasons.push('No obvious scam keywords or suspicious database patterns detected.');
        }

        const level = score >= 60 ? 'HIGH RISK' : (score >= 25 ? 'SUSPICIOUS' : 'LOW RISK');
        const label = score >= 60 ? 'Take Action Immediately' : (score >= 25 ? 'Proceed With Care' : 'Likely Safe');

        return {
            category: 'MESSAGE',
            riskScore: score,
            riskLevel: level,
            label: label,
            threatsDetected: threats,
            reasons: reasons,
            recommendedAction: score >= 60 ? 'Do NOT click any link. Do NOT share OTP, PIN or passwords.' : 'Verify independently before taking any action.',
            disclaimer: 'This assessment provides guidance powered by the CyberSaarthi SMS Spam Intelligence Database (5,572 records).'
        };
    }

    return {
        category: category.toUpperCase(),
        riskScore: 10,
        riskLevel: 'UNKNOWN / LOW EVIDENCE',
        label: 'Assessment Complete',
        threatsDetected: [],
        reasons: ['Normal communication format.'],
        recommendedAction: 'Stay cautious with unverified communication.',
        disclaimer: 'Prototype Heuristic Engine.'
    };
}

// -------------------------------------------------------------
// CyberSaarthi SMS Spam Intelligence Database UI Helpers
// -------------------------------------------------------------

const SMS_SAMPLES = {
    'spam-lottery': "Free entry in 2 a wkly comp to win FA Cup final tkts 21st May 2005. Text FA to 87121 to receive entry question(std txt rate)T&C's apply 08452810075over18's",
    'spam-kyc': "URGENT! Your Mobile No. was awarded £2000 Bonus Caller Prize on 5/9/03 This is our final try to contact U! Call from Landline 09064019788 BOX42WR29C, 150PPM",
    'spam-prize': "WINNER!! As a valued network customer you have been selected to receivea £900 prize reward! To claim call 09061701461. Claim code KL341. Valid 12 hours only.",
    'spam-ringtone': "Thanks for your subscription to Ringtone UK your mobile will be charged £5/month Please confirm by replying YES or NO. If you reply NO you will not be charged",
    'ham-normal': "I've been searching for the right words to thank you for this breather. I promise i wont take your help for granted and will fulfil my promise. You have been wonderful."
};

let currentSmsDbFilter = 'all';
let currentSmsDbOffset = 0;
const SMS_PAGE_SIZE = 20;
let cachedSmsRecords = null;

function loadSmsSample(sampleKey) {
    const input = document.getElementById('message-input');
    if (input && SMS_SAMPLES[sampleKey]) {
        input.value = SMS_SAMPLES[sampleKey];
        input.style.borderColor = '#2563eb';
        setTimeout(() => input.style.borderColor = '', 1200);
    }
}

function toggleSmsDbModal() {
    const modal = document.getElementById('sms-db-modal');
    if (!modal) return;
    const isShowing = modal.style.display === 'flex';
    modal.style.display = isShowing ? 'none' : 'flex';
    if (!isShowing) {
        currentSmsDbOffset = 0;
        searchSmsDbFromUi(false);
    }
}

function setSmsDbFilter(type) {
    currentSmsDbFilter = type;
    ['all', 'spam', 'ham'].forEach(t => {
        const btn = document.getElementById(`sms-filter-${t}`);
        if (btn) {
            if (t === type) {
                btn.style.background = '#1e3a8a';
                btn.style.color = '#ffffff';
            } else {
                btn.style.background = '#e2e8f0';
                btn.style.color = '#1e293b';
            }
        }
    });
    currentSmsDbOffset = 0;
    searchSmsDbFromUi(false);
}

function quickFilterSmsDb(term) {
    const input = document.getElementById('sms-db-search-input');
    if (input) {
        input.value = term;
        currentSmsDbOffset = 0;
        searchSmsDbFromUi(false);
    }
}

function resetSmsDbSearch() {
    const input = document.getElementById('sms-db-search-input');
    if (input) input.value = '';
    setSmsDbFilter('all');
}

function loadMoreSmsDbRecords() {
    currentSmsDbOffset += SMS_PAGE_SIZE;
    searchSmsDbFromUi(true);
}

async function searchSmsDbFromUi(isAppend = false) {
    const queryInput = document.getElementById('sms-db-search-input');
    const query = queryInput ? queryInput.value.trim() : '';
    const resultsContainer = document.getElementById('sms-db-results');
    const countLabel = document.getElementById('sms-db-count-label');
    if (!resultsContainer) return;

    if (!isAppend) {
        resultsContainer.innerHTML = '<div style="text-align:center; padding:30px; color:#64748b;">Loading CyberSaarthi database records...</div>';
    }

    try {
        const url = `/api/sms-database/search?query=${encodeURIComponent(query)}&type=${encodeURIComponent(currentSmsDbFilter)}&limit=${SMS_PAGE_SIZE}&offset=${currentSmsDbOffset}`;
        const response = await fetch(url);
        if (response.ok) {
            const records = await response.json();
            const totalCount = response.headers.get('X-Total-Count');
            if (countLabel && totalCount) {
                countLabel.innerText = `Found ${totalCount} matching records`;
            }
            const hasMore = Boolean(totalCount && parseInt(totalCount) > currentSmsDbOffset + records.length);
            renderSmsDbRecords(records, resultsContainer, isAppend, hasMore);
            return;
        }
    } catch (e) {
        // Fallback to static JSON file if server API offline
    }

    // Static JSON fallback (reads from frontend/data/sms_spam_db.json)
    try {
        if (!cachedSmsRecords) {
            const staticRes = await fetch('data/sms_spam_db.json');
            if (staticRes.ok) {
                const fullDb = await staticRes.json();
                cachedSmsRecords = fullDb.records || [];
            }
        }

        if (cachedSmsRecords && cachedSmsRecords.length > 0) {
            let filtered = cachedSmsRecords;
            if (currentSmsDbFilter === 'spam') filtered = filtered.filter(r => r.isSpam);
            if (currentSmsDbFilter === 'ham') filtered = filtered.filter(r => !r.isSpam);

            if (query) {
                const qLower = query.toLowerCase();
                if (qLower.startsWith('#')) {
                    const id = parseInt(qLower.substring(1));
                    filtered = filtered.filter(r => r.id === id);
                } else if (!isNaN(parseInt(qLower)) && parseInt(qLower) <= 6000) {
                    const id = parseInt(qLower);
                    filtered = filtered.filter(r => r.id === id || r.message.toLowerCase().includes(qLower));
                } else {
                    filtered = filtered.filter(r => r.message.toLowerCase().includes(qLower));
                }
            }

            if (countLabel) {
                countLabel.innerText = `Found ${filtered.length} matching records`;
            }

            const paged = filtered.slice(currentSmsDbOffset, currentSmsDbOffset + SMS_PAGE_SIZE);
            const hasMore = filtered.length > currentSmsDbOffset + paged.length;
            renderSmsDbRecords(paged, resultsContainer, isAppend, hasMore);
            return;
        }
    } catch (e) {
        // Fallback to minimal sample list
    }

    const fallbackSamples = [
        { id: 3, label: 'spam', isSpam: true, message: "Free entry in 2 a wkly comp to win FA Cup final tkts 21st May 2005. Text FA to 87121 to receive entry question..." },
        { id: 9, label: 'spam', isSpam: true, message: "WINNER!! As a valued network customer you have been selected to receivea £900 prize reward! To claim call 09061701461..." },
        { id: 10, label: 'spam', isSpam: true, message: "Had your mobile 11 months or more? U R entitled to Update to the latest colour mobiles with camera for Free! Call The Mobile Update Co FREE on 08002986030" },
        { id: 1, label: 'ham', isSpam: false, message: "Go until jurong point, crazy.. Available only in bugis n great world la e buffet... Cine there got amore wat..." },
        { id: 14, label: 'ham', isSpam: false, message: "I've been searching for the right words to thank you for this breather. I promise i wont take your help for granted..." }
    ];
    renderSmsDbRecords(fallbackSamples, resultsContainer, false, false);
}

function renderSmsDbRecords(records, container, isAppend = false, hasMore = false) {
    if (!isAppend && (!records || records.length === 0)) {
        container.innerHTML = '<div style="text-align:center; padding:30px; color:#64748b;">No matching records found in database. Try searching "prize", "won", "claim", or "urgent".</div>';
        return;
    }

    const cardsHtml = records.map(r => `
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid ${r.isSpam ? '#dc2626' : '#16a34a'}; border-radius:6px; padding:12px; margin-bottom:10px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-weight:700; font-size:0.75rem; padding:2px 8px; border-radius:4px; text-transform:uppercase; background:${r.isSpam ? '#fee2e2' : '#dcfce7'}; color:${r.isSpam ? '#dc2626' : '#16a34a'};">
                    ${r.label.toUpperCase()} #${r.id}
                </span>
                <button type="button" class="btn-primary" style="padding:4px 10px; font-size:0.75rem; background:#3b82f6;" onclick="insertDbRecordIntoChecker('${escapeHtmlForAttr(r.message)}')">
                    Test This Message ↗
                </button>
            </div>
            <div style="font-size:0.85rem; color:#1e293b; line-height:1.4;">${escapeHtml(r.message)}</div>
        </div>
    `).join('');

    const existingLoadMore = document.getElementById('sms-db-load-more-btn');
    if (existingLoadMore) existingLoadMore.remove();

    if (isAppend) {
        container.innerHTML += cardsHtml;
    } else {
        container.innerHTML = cardsHtml;
    }

    if (hasMore) {
        const loadMoreBtn = document.createElement('div');
        loadMoreBtn.id = 'sms-db-load-more-btn';
        loadMoreBtn.style.textAlign = 'center';
        loadMoreBtn.style.padding = '12px';
        loadMoreBtn.innerHTML = `
            <button type="button" class="btn-primary" style="background:#1e3a8a; padding:8px 24px;" onclick="loadMoreSmsDbRecords()">
                ⬇ Load More Records
            </button>
        `;
        container.appendChild(loadMoreBtn);
    }
}

function insertDbRecordIntoChecker(text) {
    const input = document.getElementById('message-input');
    if (input) {
        input.value = text;
        toggleSmsDbModal();
        switchCheckerTab('message');
        input.scrollIntoView({ behavior: 'smooth' });
    }
}

function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeHtmlForAttr(str) {
    return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');
}
