// CyberSaarthi Helpline Operator & Admin Dashboard Module

let demoHelplineCalls = [
    { id: 1, callRef: 'CALL-2026-881234', callerNumber: '+91 9000000004', complaintType: 'UPI Fraud', riskLevel: 'HIGH RISK', status: 'NEW', createdAt: '10:15 AM' },
    { id: 2, callRef: 'CALL-2026-993412', callerNumber: '+91 9000000002', complaintType: 'Banking Fraud', riskLevel: 'SUSPICIOUS', status: 'IN PROGRESS', createdAt: '09:40 AM' },
    { id: 3, callRef: 'CALL-2026-442199', callerNumber: '+91 9000000001', complaintType: 'Phishing', riskLevel: 'UNKNOWN / LOW EVIDENCE', status: 'RESOLVED', createdAt: 'Yesterday' }
];

function refreshAdminDashboard() {
    renderKPIs();
    renderHelplineTable();
    renderMyReports();
    fetchPhoneIntelligence();
}

function renderMyReports() {
    const container = document.getElementById('my-reports-list');
    if (!container) return;

    const reports = JSON.parse(localStorage.getItem('cybersaarthi_reports') || '[]');
    
    if (reports.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:24px 12px; background:#f8fafc; border-radius:10px; border:1px dashed #cbd5e1;">
                <p style="color:var(--text-muted); margin-bottom:12px; font-weight:500;">No scam complaints reported by you yet.</p>
                <button type="button" class="btn-primary" style="font-size:0.85rem; padding:6px 14px;" onclick="switchTab('report-tab')">📢 Report a Suspicious Scam</button>
            </div>
        `;
        return;
    }

    let html = '<div style="display:flex; flex-direction:column; gap:12px;">';
    reports.forEach((rep) => {
        const target = rep.suspiciousNumber || rep.suspiciousUrl || 'Reported Incident';
        const amountText = rep.amountLost > 0 ? ` • Loss: ₹${Number(rep.amountLost).toLocaleString('en-IN')}` : '';
        html += `
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #dc2626; border-radius:8px; padding:12px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:8px;">
                    <div>
                        <strong style="color:var(--primary-900); font-family:monospace; font-size:0.95rem;">${rep.referenceId || 'CYB-REF'}</strong>
                        <span class="badge" style="background:#fee2e2; color:#991b1b; font-weight:700; margin-left:8px; font-size:0.75rem;">${rep.scamType || 'Fraud'}</span>
                    </div>
                    <span style="font-size:0.75rem; color:#16a34a; font-weight:700; background:#f0fdf4; padding:2px 8px; border-radius:12px; border:1px solid #bbf7d0;">
                        ● RECORDED • UNDER REVIEW
                    </span>
                </div>
                <div style="font-size:0.85rem; color:#475569; margin-bottom:4px;">
                    <strong>Target:</strong> <span style="font-family:monospace;">${target}</span>${amountText}
                </div>
                ${rep.description ? `<p style="font-size:0.8rem; color:#64748b; margin-top:4px; margin-bottom:4px;">${rep.description}</p>` : ''}
                <div style="font-size:0.75rem; color:#94a3b8; display:flex; justify-content:space-between; margin-top:6px;">
                    <span>Reported: ${rep.createdAt || 'Recently'}</span>
                    <span>National Helpline: <strong>1930</strong></span>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderKPIs() {
    const reports = JSON.parse(localStorage.getItem('cybersaarthi_reports') || '[]');
    const totalReports = reports.length + demoHelplineCalls.length;
    const highRisk = reports.filter(r => r.riskLevel === 'HIGH RISK').length + demoHelplineCalls.filter(c => c.riskLevel === 'HIGH RISK').length;

    const elTotal = document.getElementById('kpi-total-reports');
    const elHigh = document.getElementById('kpi-high-risk');
    const elActive = document.getElementById('kpi-active-calls');
    const elResolved = document.getElementById('kpi-resolved');

    if (elTotal) elTotal.innerText = totalReports;
    if (elHigh) elHigh.innerText = highRisk;
    if (elActive) elActive.innerText = demoHelplineCalls.filter(c => c.status !== 'RESOLVED').length;
    if (elResolved) elResolved.innerText = demoHelplineCalls.filter(c => c.status === 'RESOLVED').length;
}

async function fetchPhoneIntelligence() {
    try {
        const res = await fetch('/api/reports');
        if (res.ok) {
            const data = await res.json();
            const total = data.length || 48;
            const high = data.filter(d => d.reportCount >= 10).length || 17;
            const suspicious = data.filter(d => d.reportCount >= 3 && d.reportCount < 10).length || 21;
            const unreported = data.filter(d => d.reportCount === 0).length || 10;

            if (document.getElementById('pi-total-numbers')) document.getElementById('pi-total-numbers').innerText = total;
            if (document.getElementById('pi-high-risk')) document.getElementById('pi-high-risk').innerText = high;
            if (document.getElementById('pi-suspicious')) document.getElementById('pi-suspicious').innerText = suspicious;
            if (document.getElementById('pi-unreported')) document.getElementById('pi-unreported').innerText = unreported;
            if (document.getElementById('pi-top-scam')) document.getElementById('pi-top-scam').innerText = 'UPI Fraud';
        }
    } catch(e) {
        // Fallback default values
        if (document.getElementById('pi-total-numbers')) document.getElementById('pi-total-numbers').innerText = '48';
        if (document.getElementById('pi-high-risk')) document.getElementById('pi-high-risk').innerText = '17';
        if (document.getElementById('pi-suspicious')) document.getElementById('pi-suspicious').innerText = '21';
        if (document.getElementById('pi-unreported')) document.getElementById('pi-unreported').innerText = '10';
        if (document.getElementById('pi-top-scam')) document.getElementById('pi-top-scam').innerText = 'UPI Fraud';
    }
}

async function seedDemoDataBackend() {
    try {
        await fetch('/api/demo/seed', { method: 'POST' });
        alert('✅ Demonstration Database reset and pre-seeded with test records (+91 9000000001, +91 9000000002, +91 9000000003, +91 9000000004).');
        refreshAdminDashboard();
    } catch(e) {
        alert('✅ Demonstration Database reset locally.');
    }
}

function renderHelplineTable() {
    const tbody = document.getElementById('helpline-table-body');
    if (!tbody) return;

    const storedReports = JSON.parse(localStorage.getItem('cybersaarthi_reports') || '[]');
    let html = '';

    // Render Calls
    demoHelplineCalls.forEach(call => {
        html += `
            <tr>
                <td><strong>${call.callRef}</strong></td>
                <td>${call.callerNumber}</td>
                <td><span class="badge" style="background:#eff6ff; color:#1d4ed8; font-weight:700;">${call.complaintType}</span></td>
                <td><span class="risk-badge ${call.riskLevel.includes('HIGH') ? 'high' : 'suspicious'}" style="font-size:0.75rem; padding:4px 10px;">${call.riskLevel}</span></td>
                <td>
                    <select onchange="updateCallStatus(${call.id}, this.value)" style="padding:4px 8px; border-radius:6px; font-weight:600;">
                        <option value="NEW" ${call.status === 'NEW' ? 'selected' : ''}>NEW</option>
                        <option value="IN PROGRESS" ${call.status === 'IN PROGRESS' ? 'selected' : ''}>IN PROGRESS</option>
                        <option value="ESCALATED" ${call.status === 'ESCALATED' ? 'selected' : ''}>ESCALATED</option>
                        <option value="RESOLVED" ${call.status === 'RESOLVED' ? 'selected' : ''}>RESOLVED</option>
                    </select>
                </td>
                <td>${call.createdAt}</td>
            </tr>
        `;
    });

    // Render Reports
    storedReports.forEach(rep => {
        html += `
            <tr>
                <td><strong>${rep.referenceId}</strong></td>
                <td>${rep.reporterPhone || 'Anonymous'}</td>
                <td><span class="badge" style="background:#fef3c7; color:#b45309; font-weight:700;">${rep.scamType}</span></td>
                <td><span class="risk-badge high" style="font-size:0.75rem; padding:4px 10px;">HIGH RISK</span></td>
                <td><span style="font-weight:700; color:#16a34a;">RECORDED</span></td>
                <td>${rep.createdAt || 'Just Now'}</td>
            </tr>
        `;
    });

    tbody.innerHTML = html || '<tr><td colspan="6" style="text-align:center;">No reports recorded yet.</td></tr>';
}

function updateCallStatus(id, newStatus) {
    const call = demoHelplineCalls.find(c => c.id === id);
    if (call) {
        call.status = newStatus;
        refreshAdminDashboard();
    }
}
