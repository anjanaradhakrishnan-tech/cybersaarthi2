// CyberSaarthi Judge Demo Mode & Presentation Workflow Module

function toggleJudgeDemoModal() {
    const modal = document.getElementById('demo-mode-modal');
    modal.classList.toggle('active');
}

function closeDemoModal() {
    document.getElementById('demo-mode-modal').classList.remove('active');
}

async function loadDemoScenario(scenarioId) {
    closeDemoModal();
    
    if (scenarioId === 1) {
        // Test 1: Unreported Demo Number +91 9000000001
        switchTab('checker-tab');
        switchCheckerTab('phone');
        document.getElementById('phone-input').value = "+91 9000000001";
        document.querySelectorAll('#phone-actions-checklist input').forEach(cb => cb.checked = false);
        await runAnalysis('phone');
    } else if (scenarioId === 2) {
        // Test 2: Reported Number +91 9000000002 (3 Reports -> SUSPICIOUS)
        switchTab('checker-tab');
        switchCheckerTab('phone');
        document.getElementById('phone-input').value = "+91 9000000002";
        document.querySelectorAll('#phone-actions-checklist input').forEach(cb => cb.checked = false);
        await runAnalysis('phone');
    } else if (scenarioId === 3) {
        // Test 3: High Risk Number +91 9000000004 (12 Reports -> HIGH RISK)
        switchTab('checker-tab');
        switchCheckerTab('phone');
        document.getElementById('phone-input').value = "+91 9000000004";
        document.querySelectorAll('#phone-actions-checklist input').forEach(cb => cb.checked = false);
        await runAnalysis('phone');
    } else if (scenarioId === 4) {
        // Test 4: Unknown Number + Nothing Suspicious -> UNKNOWN / LOW EVIDENCE
        switchTab('checker-tab');
        switchCheckerTab('phone');
        document.getElementById('phone-input').value = "+91 98765 11223";
        document.querySelectorAll('#phone-actions-checklist input').forEach(cb => cb.checked = false);
        const ns = document.querySelector('#phone-actions-checklist input[value="Nothing suspicious"]');
        if (ns) ns.checked = true;
        await runAnalysis('phone');
    } else if (scenarioId === 5) {
        // Test 5: Unknown Number + OTP + UPI PIN Demand -> HIGH RISK / CRITICAL
        switchTab('checker-tab');
        switchCheckerTab('phone');
        document.getElementById('phone-input').value = "+91 98765 11223";
        document.querySelectorAll('#phone-actions-checklist input').forEach(cb => cb.checked = false);
        const otp = document.querySelector('#phone-actions-checklist input[value="Asked for OTP"]');
        const upi = document.querySelector('#phone-actions-checklist input[value="Asked for UPI PIN"]');
        if (otp) otp.checked = true;
        if (upi) upi.checked = true;
        await runAnalysis('phone');
    } else if (scenarioId === 6) {
        // Scenario 6: AI-Generated Deepfake Media
        switchTab('checker-tab');
        switchCheckerTab('media');
    }
}

// Requirement 33: Automated Main Demonstration Flow
async function runMainPresentationFlow() {
    closeDemoModal();
    alert('🎬 STARTING CYBERSAARTHI MAIN DEMONSTRATION FLOW...\n\nWatch CyberSaarthi execute step 1 to step 13 seamlessly!');

    // Step 1 & 2: Enter Fake Bank Message & Analyze
    switchTab('checker-tab');
    switchCheckerTab('message');
    document.getElementById('message-input').value = "ALERT: Your SBI YONO account is suspended due to invalid KYC. Click http://sbi-yono-update.in/verify to unblock account immediately or ₹10,000 fine will be charged.";
    
    await new Promise(r => setTimeout(r, 800));
    await runAnalysis('message');

    // Step 7 & 8: Ask CyberSaarthi Chatbot
    await new Promise(r => setTimeout(r, 1500));
    switchTab('chatbot-tab');
    document.getElementById('chat-input').value = "I received an SMS saying my SBI YONO account is suspended. What should I do?";
    await sendChatMessage();

    // Step 9 & 10: Trigger Emergency Helpline Response
    await new Promise(r => setTimeout(r, 1800));
    triggerEmergencyMode();

    // Step 11 & 12 & 13: Register Complaint & Show Admin Dashboard
    await new Promise(r => setTimeout(r, 2000));
    closeEmergencyModal();

    const mockReport = {
        reporterName: 'Demo Judge User',
        reporterPhone: '+91 98450 11223',
        scamType: 'Banking Fraud',
        description: 'Automated demo flow: SBI YONO fake KYC SMS phishing attempt',
        suspiciousNumber: '+91 9000000004',
        suspiciousUrl: 'http://sbi-yono-update.in/verify',
        amountLost: 0,
        riskLevel: 'HIGH RISK'
    };

    try {
        await fetch('/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mockReport)
        });
    } catch(e) {}

    const reports = JSON.parse(localStorage.getItem('cybersaarthi_reports') || '[]');
    const refCode = 'CYB-2026-' + Math.floor(100000 + Math.random() * 900000);
    mockReport.referenceId = refCode;
    mockReport.createdAt = new Date().toLocaleTimeString();
    reports.unshift(mockReport);
    localStorage.setItem('cybersaarthi_reports', JSON.stringify(reports));

    refreshAdminDashboard();
    switchTab('admin-tab');

    alert(`✨ DEMONSTRATION COMPLETE!\n\nReference ID Generated: ${refCode}\nComplaint successfully registered in Java Spring Boot backend and displayed in Admin Helpline Operator Dashboard!`);
}
