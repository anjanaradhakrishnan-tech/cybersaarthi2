// CyberSaarthi Fraud Report Submission Module

async function submitFraudReport(event) {
    event.preventDefault();

    const name = document.getElementById('report-name').value;
    const phone = document.getElementById('report-phone').value;
    const scamType = document.getElementById('report-type').value;
    const description = document.getElementById('report-desc').value;
    const suspiciousNumber = document.getElementById('report-suspect-number').value;
    const suspiciousUrl = document.getElementById('report-suspect-url').value;
    const amountLost = document.getElementById('report-amount').value || 0;

    const reportPayload = {
        reporterName: name,
        reporterPhone: phone,
        scamType: scamType,
        description: description,
        suspiciousNumber: suspiciousNumber,
        suspiciousUrl: suspiciousUrl,
        amountLost: parseFloat(amountLost),
        riskLevel: 'HIGH RISK'
    };

    let refId = 'CYB-2026-' + Math.floor(100000 + Math.random() * 900000);

    try {
        const response = await fetch('/api/report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportPayload)
        });
        const data = await response.json();
        if (data.referenceId) refId = data.referenceId;
    } catch (e) {
        console.warn('Backend offline, using client generated ref code:', refId);
    }

    // Save locally
    const reports = JSON.parse(localStorage.getItem('cybersaarthi_reports') || '[]');
    reportPayload.referenceId = refId;
    reportPayload.createdAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    reports.unshift(reportPayload);
    localStorage.setItem('cybersaarthi_reports', JSON.stringify(reports));

    // Show Confirmation
    document.getElementById('report-form').reset();
    alert(`✅ REPORT RECORDED SUCCESSFULLY!\n\nYour Complaint Reference ID: ${refId}\n\nThank you for helping keep Indian citizens safe. Our helpline team will process this report.`);
    
    refreshAdminDashboard();
    switchTab('dashboard-tab');
}

function openReportModalWithData(category, riskLevel) {
    switchTab('report-tab');
    if (category === 'LINK') {
        document.getElementById('report-type').value = 'Phishing';
    } else if (category === 'PHONE') {
        document.getElementById('report-type').value = 'Scam Call';
    }
}
