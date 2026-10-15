// CyberSaarthi Emergency Response & Helpline Module

const HELPLINE_NUMBER = "1800-CYBER-HELP";
const NATIONAL_CYBER_LINE = "1930";

function triggerEmergencyMode() {
    const modal = document.getElementById('emergency-modal');
    modal.classList.add('active');
}

function closeEmergencyModal() {
    const modal = document.getElementById('emergency-modal');
    modal.classList.remove('active');
}

async function openHelplineCallSimulator() {
    closeEmergencyModal();
    const callerNum = prompt('Enter your phone number to request an immediate CyberSaarthi Helpline Callback:', '+91 98765 43210');
    if (!callerNum) return;

    try {
        const res = await fetch('/api/helpline/call', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callerNumber: callerNum,
                complaintType: 'EMERGENCY SCAM',
                riskLevel: 'HIGH RISK',
                description: 'User initiated emergency call trigger from CyberSaarthi platform.'
            })
        });
        const callData = await res.json();
        alert(`☎ CALL REGISTERED SUCCESSFULLY!\n\nCall Ticket Reference: ${callData.callRef || 'CALL-2026-984321'}\n\nA CyberSaarthi Helpline Officer is dialing ${callerNum} right now.\n\nNational Cyber Crime Hotline: 1930`);
        refreshAdminDashboard();
    } catch (e) {
        alert(`☎ HELPLINE CALL SIMULATED!\n\nDialing CyberSaarthi Hotline: ${HELPLINE_NUMBER}\nNational Cyber Crime Hotline: ${NATIONAL_CYBER_LINE}`);
    }
}
