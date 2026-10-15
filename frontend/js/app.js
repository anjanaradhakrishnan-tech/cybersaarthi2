// CyberSaarthi Main Application Controller

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    refreshAdminDashboard();
    calculateSafetyScore();
}

function switchTab(tabId) {
    document.querySelectorAll('.page-section').forEach(sec => sec.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

    const targetSection = document.getElementById(tabId);
    if (targetSection) targetSection.classList.add('active');

    const activeNav = document.querySelector(`.nav-links a[onclick*="${tabId}"]`);
    if (activeNav) activeNav.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchCheckerTab(category) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

    const activeBtn = document.querySelector(`.tab-btn[onclick*="${category}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const activePanel = document.getElementById(`panel-${category}`);
    if (activePanel) activePanel.classList.add('active');
}

function toggleElderMode(forceState = null) {
    const isElder = forceState !== null ? forceState : !document.body.classList.contains('elder-mode');
    if (isElder) {
        document.body.classList.add('elder-mode');
        document.getElementById('elder-mode-toggle').classList.add('active');
        speakText('Elderly Friendly Mode is now enabled. Fonts and buttons are now larger.');
    } else {
        document.body.classList.remove('elder-mode');
        document.getElementById('elder-mode-toggle').classList.remove('active');
    }
}
