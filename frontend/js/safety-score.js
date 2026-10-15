// CyberSaarthi Safety Score Calculation Module

function calculateSafetyScore() {
    const q1 = document.getElementById('score-q1').checked ? 20 : 0;
    const q2 = document.getElementById('score-q2').checked ? 20 : 0;
    const q3 = document.getElementById('score-q3').checked ? 15 : 0;
    const q4 = document.getElementById('score-q4').checked ? 15 : 0;
    const q5 = document.getElementById('score-q5').checked ? 15 : 0;
    const q6 = document.getElementById('score-q6').checked ? 15 : 0;

    const total = q1 + q2 + q3 + q4 + q5 + q6;
    
    const display = document.getElementById('safety-score-value');
    const badge = document.getElementById('safety-score-label');
    const recList = document.getElementById('safety-score-recs');

    display.innerText = `${total}/100`;

    let label = 'EXCELLENT SAFETY POSTURE';
    let color = '#16a34a';

    if (total < 50) {
        label = 'HIGH VULNERABILITY — ACTION REQUIRED';
        color = '#dc2626';
    } else if (total < 80) {
        label = 'MODERATE SAFETY — CAUTION ADVISED';
        color = '#d97706';
    }

    badge.innerText = label;
    badge.style.color = color;

    let recs = [];
    if (!q1) recs.push('Enable Two-Factor Authentication (2FA) on WhatsApp, Gmail, and banking apps.');
    if (!q2) recs.push('Never share OTPs with anyone claiming to be bank or police officials.');
    if (!q3) recs.push('Always check suspicious links with CyberSaarthi before clicking.');
    if (!q4) recs.push('Use strong unique passwords for online financial accounts.');
    if (!q5) recs.push('Keep mobile OS and apps updated to patch security vulnerabilities.');

    recList.innerHTML = recs.map(r => `<li style="margin-bottom:6px;">💡 ${r}</li>`).join('') || '<li>🎉 Great job! You are following all core cybersecurity safety practices.</li>';
}
