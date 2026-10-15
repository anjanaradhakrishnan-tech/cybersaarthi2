// CyberSaarthi Family Safety Module

function showFamilyGuide(profile) {
    const title = document.getElementById('family-modal-title');
    const body = document.getElementById('family-modal-body');
    const modal = document.getElementById('family-modal');

    if (profile === 'grandparent') {
        title.innerText = '👴 Grandparent / Elder Cyber Protection';
        body.innerHTML = `
            <div style="font-size:1.05rem; line-height:1.7;">
                <p style="margin-bottom:12px;"><strong>Key Guidelines for Elderly Family Members:</strong></p>
                <ul>
                    <li>Turn on <strong>Elder Mode</strong> on their CyberSaarthi app for high contrast & large text.</li>
                    <li>Teach them that banks NEVER call to ask for OTPs or pension verification PINs.</li>
                    <li>Warn them about 'Digital Arrest' calls claiming to be Police/CBI/TRAI over WhatsApp video calls.</li>
                    <li>Put CyberSaarthi Helpline (1800-CYBER-HELP) on speed dial on their phone.</li>
                </ul>
            </div>
        `;
    } else if (profile === 'parent') {
        title.innerText = '👩‍💼 Parent Cyber Safety';
        body.innerHTML = `
            <div style="font-size:1.05rem; line-height:1.7;">
                <p style="margin-bottom:12px;"><strong>Protecting Working Parents & Householders:</strong></p>
                <ul>
                    <li>Beware of fake utility bill disconnection threats (Electricity / Gas cut-off SMS).</li>
                    <li>Check all online shopping URLs before entering credit card or UPI details.</li>
                    <li>Never scan UPI QR codes to receive money. Scanning a QR code ALWAYS deducts money.</li>
                </ul>
            </div>
        `;
    } else if (profile === 'child') {
        title.innerText = '👦 Child & Student Digital Protection';
        body.innerHTML = `
            <div style="font-size:1.05rem; line-height:1.7;">
                <p style="margin-bottom:12px;"><strong>Protecting Children & Students:</strong></p>
                <ul>
                    <li>Warn against fake online gaming currency / free gift card links.</li>
                    <li>Teach them never to accept video calls from unknown social media accounts.</li>
                    <li>Educate them on AI deepfakes and cyberbullying reporting.</li>
                </ul>
            </div>
        `;
    }

    modal.classList.add('active');
}

function closeFamilyModal() {
    document.getElementById('family-modal').classList.remove('active');
}
