const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

const JAVA_BACKEND_URL = process.env.JAVA_BACKEND_URL || 'http://localhost:8085';

// Proxy middleware to Java Spring Boot REST backend with fallback
app.use('/api', async (req, res, next) => {
    try {
        const targetUrl = JAVA_BACKEND_URL + '/api' + req.url;
        const options = {
            method: req.method,
            headers: { 'Content-Type': req.headers['content-type'] || 'application/json' }
        };
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            options.body = JSON.stringify(req.body);
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        options.signal = controller.signal;

        const backendRes = await fetch(targetUrl, options);
        clearTimeout(timeoutId);

        if (backendRes.ok) {
            const data = await backendRes.json();
            return res.status(backendRes.status).json(data);
        }
    } catch (e) {
        // If Java backend is unreachable or times out, proceed to Express fallback route
    }
    next();
});

// Simulated mock API endpoints matching Java Spring Boot REST specifications
// (Used as fallback when Java backend is offline)

// Load CyberSaarthi SMS Spam Intelligence Database (5,572 verified records)
let smsSpamDb = null;
try {
    const dbPath = path.join(__dirname, 'data', 'sms_spam_db.json');
    if (require('fs').existsSync(dbPath)) {
        smsSpamDb = JSON.parse(require('fs').readFileSync(dbPath, 'utf8'));
        console.log(`[CyberSaarthi] Loaded SMS Spam Database: ${smsSpamDb.metadata.totalRecords} records (${smsSpamDb.metadata.spamCount} spam, ${smsSpamDb.metadata.hamCount} ham).`);
    }
} catch (err) {
    console.error('[CyberSaarthi] Could not load sms_spam_db.json:', err.message);
}

// Tokenizer & Jaccard similarity helpers
function tokenizeText(text) {
    return new Set((text || '').toLowerCase().match(/[a-z0-9£$€]+/g) || []);
}

function calculateJaccard(tokensA, tokensB) {
    if (!tokensA.size || !tokensB.size) return 0;
    let intersect = 0;
    tokensA.forEach(t => { if (tokensB.has(t)) intersect++; });
    const union = tokensA.size + tokensB.size - intersect;
    return union > 0 ? (intersect / union) : 0;
}

function matchSmsDatabase(messageText) {
    if (!smsSpamDb || !smsSpamDb.records) {
        return { isMatch: false, bestMatch: null, bestSpamMatch: null, maxSpamSim: 0, bestHamMatch: null, maxHamSim: 0, similarity: 0, detectedKeywords: [], detectedNumbers: [], spamProbability: 0 };
    }

    const inputLower = (messageText || '').toLowerCase();
    const inputTokens = tokenizeText(messageText);

    // 1. Search for extracted scam phone numbers / shortcodes
    const detectedNumbers = [];
    if (smsSpamDb.knownSpamNumbers) {
        for (const num of smsSpamDb.knownSpamNumbers) {
            if (num.length >= 5 && inputLower.includes(num.toLowerCase())) {
                detectedNumbers.push(num);
            }
        }
    }

    // 2. Search for high-frequency spam keywords
    const detectedKeywords = [];
    let keywordRiskSum = 0;
    if (smsSpamDb.topSpamKeywords) {
        for (const item of smsSpamDb.topSpamKeywords) {
            if (inputTokens.has(item.keyword.toLowerCase())) {
                detectedKeywords.push(item.keyword);
                keywordRiskSum += (item.riskWeight || 10);
            }
        }
    }

    // 3. Find closest matching Spam AND closest matching Ham records
    let bestSpamMatch = null;
    let maxSpamSim = 0;
    let bestHamMatch = null;
    let maxHamSim = 0;

    for (const record of smsSpamDb.records) {
        const recordTokens = tokenizeText(record.message);
        const sim = calculateJaccard(inputTokens, recordTokens);
        if (record.isSpam) {
            if (sim > maxSpamSim) {
                maxSpamSim = sim;
                bestSpamMatch = record;
            }
        } else {
            if (sim > maxHamSim) {
                maxHamSim = sim;
                bestHamMatch = record;
            }
        }
    }

    // 4. Calculate statistically grounded spam probability
    let spamScore = 0;
    if (detectedNumbers.length > 0) spamScore += 50;
    if (detectedKeywords.length > 0) {
        spamScore += Math.min(detectedKeywords.length * 15 + Math.round(keywordRiskSum / 10), 50);
    }
    if (maxSpamSim >= 0.40) {
        spamScore = Math.max(spamScore, Math.round(maxSpamSim * 100));
    }
    // High legitimate match discount if no critical scam numbers
    if (maxHamSim >= 0.70 && maxSpamSim < 0.30 && detectedNumbers.length === 0 && detectedKeywords.length <= 1) {
        spamScore = Math.min(spamScore, 15);
    }

    const overallSim = Math.max(maxSpamSim, maxHamSim);
    const overallBest = maxSpamSim >= maxHamSim ? bestSpamMatch : bestHamMatch;

    return {
        isMatch: maxSpamSim >= 0.35 || maxHamSim >= 0.55 || detectedKeywords.length >= 2 || detectedNumbers.length > 0,
        bestMatch: overallBest,
        bestSpamMatch: bestSpamMatch,
        maxSpamSim: maxSpamSim,
        bestHamMatch: bestHamMatch,
        maxHamSim: maxHamSim,
        similarity: overallSim,
        detectedKeywords: detectedKeywords.slice(0, 8),
        detectedNumbers: detectedNumbers,
        spamProbability: Math.min(Math.max(spamScore, 0), 100)
    };
}

// Dedicated SMS Database endpoints
app.get('/api/sms-database/stats', (req, res) => {
    if (smsSpamDb && smsSpamDb.metadata) {
        return res.json(smsSpamDb.metadata);
    }
    res.json({ totalRecords: 0, status: 'Database not initialized' });
});

app.get('/api/sms-database/samples', (req, res) => {
    const count = parseInt(req.query.count) || 10;
    if (smsSpamDb && smsSpamDb.records) {
        const spams = smsSpamDb.records.filter(r => r.isSpam).slice(0, Math.floor(count / 2));
        const hams = smsSpamDb.records.filter(r => !r.isSpam).slice(0, Math.ceil(count / 2));
        return res.json([...spams, ...hams]);
    }
    res.json([]);
});

app.get('/api/sms-database/search', (req, res) => {
    const q = (req.query.query || '').toLowerCase().trim();
    const type = (req.query.type || 'all').toLowerCase().trim(); // 'all', 'spam', 'ham'
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    if (!smsSpamDb || !smsSpamDb.records) return res.json([]);

    let filtered = smsSpamDb.records;

    if (type === 'spam') {
        filtered = filtered.filter(r => r.isSpam);
    } else if (type === 'ham') {
        filtered = filtered.filter(r => !r.isSpam);
    }

    if (q) {
        if (q.startsWith('#') && !isNaN(parseInt(q.substring(1)))) {
            const targetId = parseInt(q.substring(1));
            filtered = filtered.filter(r => r.id === targetId);
        } else if (!isNaN(parseInt(q)) && parseInt(q) > 0 && parseInt(q) <= 6000) {
            const targetId = parseInt(q);
            filtered = filtered.filter(r => r.id === targetId || r.message.toLowerCase().includes(q));
        } else {
            filtered = filtered.filter(r => r.message.toLowerCase().includes(q));
        }
    }

    const total = filtered.length;
    const pagedRecords = filtered.slice(offset, offset + limit);

    res.setHeader('X-Total-Count', total);
    res.json(pagedRecords);
});

app.post('/api/sms-database/check', (req, res) => {
    const rawText = req.body.messageText || '';
    const match = matchSmsDatabase(rawText);
    res.json(match);
});

app.post('/api/analyze/message', (req, res) => {
    const rawText = req.body.messageText || '';
    const text = rawText.toLowerCase();
    let score = 0;
    const threats = [];
    const reasons = [];

    // 1. Cross-reference with CyberSaarthi SMS Spam Database (5,572 records)
    const dbMatch = matchSmsDatabase(rawText);

    if (dbMatch.isMatch) {
        // Direct match with known spam record
        if (dbMatch.bestSpamMatch && dbMatch.maxSpamSim >= 0.40) {
            const simPercent = Math.round(dbMatch.maxSpamSim * 100);
            score = Math.max(score, simPercent);

            threats.push(`🎯 SMS SPAM DATABASE MATCH: ${simPercent}% match with known spam record #${dbMatch.bestSpamMatch.id}`);
            let snippet = dbMatch.bestSpamMatch.message;
            if (snippet.length > 95) snippet = snippet.substring(0, 92) + '...';
            reasons.push(`Matches verified Spam Record #${dbMatch.bestSpamMatch.id} in database: "${snippet}"`);
        }

        // Detected high-frequency promotional/fraud keywords from DB
        if (dbMatch.detectedKeywords.length >= 2) {
            score = Math.max(score, Math.min(dbMatch.spamProbability, 85));
            threats.push(`Spam Vocabulary Indicators: ${dbMatch.detectedKeywords.join(', ')}`);
            reasons.push(`Detected high-frequency promotional/scam vocabulary extracted from the SMS spam database.`);
        } else if (dbMatch.detectedKeywords.length === 1 && dbMatch.maxSpamSim >= 0.30) {
            score = Math.max(score, 50);
            threats.push(`Spam Keyword Detected: ${dbMatch.detectedKeywords[0]}`);
            reasons.push(`Message contains vocabulary commonly associated with promotional or scam distribution in the database.`);
        }

        // Detected known spam contact phone numbers or shortcodes
        if (dbMatch.detectedNumbers.length > 0) {
            threats.push(`🚨 Known Scam Contact/Shortcode: ${dbMatch.detectedNumbers.join(', ')}`);
            reasons.push(`Contains telephone numbers or shortcodes verified in the CyberSaarthi SMS Spam Database (${dbMatch.detectedNumbers.join(', ')}).`);
            score = Math.max(score, 90);
        }

        // Verified legitimate communication style match
        if (dbMatch.bestHamMatch && dbMatch.maxHamSim >= 0.60 && dbMatch.maxSpamSim < 0.35 && dbMatch.detectedNumbers.length === 0 && dbMatch.detectedKeywords.length <= 1) {
            reasons.push(`Verified Corpus Match: Message style matches known legitimate personal communication (Ham record #${dbMatch.bestHamMatch.id}, ${Math.round(dbMatch.maxHamSim * 100)}% match).`);
        }
    }

    // 2. Critical Threat: Demanding UPI PIN / OTP / MPIN / CVV (Word-bounded regex to prevent false positives)
    const upiPinRegex = /\b(upi\s*pin|atm\s*pin|mpin|m-pin|secret\s*pin|security\s*pin|card\s*pin|cvv)\b/i;
    const otpRegex = /\b(otp|one-time\s*password)\b/i;
    const genericPinRegex = /\bpin\b/i;
    const bankingContextRegex = /\b(bank|account|gpay|phonepe|paytm|wallet|transfer|refund|debit|credit|card|login)\b/i;

    if (upiPinRegex.test(rawText) || otpRegex.test(rawText) || (genericPinRegex.test(rawText) && bankingContextRegex.test(rawText))) {
        score = 100;
        threats.unshift('🚨 CRITICAL THREAT: DEMANDING UPI PIN / OTP / PASSWORD');
        reasons.unshift('Official banks, GPay, PhonePe, Paytm, and customer care will NEVER ask for your UPI PIN, MPIN, or OTP over phone or SMS.');
        reasons.unshift('CRITICAL WARNING: Entering or sharing your UPI PIN WILL IMMEDIATELY DEDUCT MONEY FROM YOUR BANK ACCOUNT. You NEVER enter a PIN to receive money or refunds!');
    }

    // 3. Bank Account / KYC / SIM Suspension Urgency
    const kycPanicRegex = /\b(kyc|pan\s*card|aadhaar|account\s*blocked|account\s*suspended|sim\s*blocked|deactivated|unblock\s*account)\b/i;
    if (kycPanicRegex.test(rawText) || (bankingContextRegex.test(rawText) && /\b(blocked|suspended|deactivated|expire)\b/i.test(rawText))) {
        score = Math.max(score, 85);
        threats.push('Fake KYC / Account Suspension Threat');
        reasons.push('Creates artificial panic claiming your bank account or SIM card will be blocked unless you take immediate action.');
    }

    // 4. Lottery / Cash Prize / Claim Scams (Requires financial/prize context)
    const lotteryRegex = /\b(lottery|jackpot|crore|lakhs?|cash\s*prize|reward\s*points?|bonus\s*caller|claim\s*code|claim\s*your\s*prize)\b/i;
    const wonPrizeRegex = /\b(you\s*(?:have\s*)?won|selected\s*to\s*receive|awarded\s*(?:a\s*)?prize|claim\s*(?:your\s*)?reward)\b/i;

    if (lotteryRegex.test(rawText) || wonPrizeRegex.test(rawText) || (/\bwon\b/i.test(rawText) && /\b(prize|cash|claim|reward|lottery|bonus)\b/i.test(rawText))) {
        score = Math.max(score, 80);
        threats.push('Prize / Lottery / Claim Pattern');
        reasons.push('Promises unverified monetary gifts, jackpot, or prizes to solicit advance fees or personal banking details.');
    }

    // 5. Suspicious URLs embedded
    if (/\b(https?:\/\/\S+|bit\.ly\/\S+|tinyurl\.com\/\S+|\S+\.(xyz|top|site|club|work|buzz))\b/i.test(rawText)) {
        score = Math.max(score, 70);
        threats.push('Suspicious Embedded URL');
        reasons.push('Contains links pointing to unverified web addresses or URL shorteners.');
    }

    score = Math.min(score, 100);
    let level = score >= 60 ? 'HIGH RISK' : (score >= 25 ? 'SUSPICIOUS' : 'LOW RISK');
    let label = score >= 60 ? 'Take Action Immediately' : (score >= 25 ? 'Proceed With Care' : 'Likely Safe');
    let rec = score >= 60 ? 'Do NOT click any link. Do NOT share OTP, PIN or banking details. Entering your PIN transfers money TO the scammer!' : 'Verify independently before taking any action.';

    if (score === 0) {
        reasons.push('No suspicious scam patterns detected in message or CyberSaarthi database.');
        rec = 'Standard message format. Always stay cautious when receiving links or requests from unknown senders.';
    }

    // Prepare structured database match metadata for UI
    const databaseMatchPayload = {
        isSpamMatch: Boolean(dbMatch.bestSpamMatch && dbMatch.maxSpamSim >= 0.40),
        spamConfidence: dbMatch.spamProbability,
        spamSimilarity: Math.round(dbMatch.maxSpamSim * 100),
        matchedSpamId: dbMatch.bestSpamMatch ? dbMatch.bestSpamMatch.id : null,
        matchedSpamSnippet: dbMatch.bestSpamMatch ? dbMatch.bestSpamMatch.message : '',
        hamSimilarity: Math.round(dbMatch.maxHamSim * 100),
        matchedHamId: dbMatch.bestHamMatch ? dbMatch.bestHamMatch.id : null,
        matchedHamSnippet: dbMatch.bestHamMatch ? dbMatch.bestHamMatch.message : '',
        detectedKeywords: dbMatch.detectedKeywords,
        detectedNumbers: dbMatch.detectedNumbers,
        corpusSize: (smsSpamDb && smsSpamDb.metadata) ? smsSpamDb.metadata.totalRecords : 5572
    };

    res.json({
        category: 'MESSAGE',
        riskScore: score,
        riskLevel: level,
        label: label,
        threatsDetected: threats,
        reasons: reasons,
        recommendedAction: rec,
        disclaimer: 'This assessment provides guidance powered by the CyberSaarthi SMS Spam Intelligence Database (5,572 verified records) & heuristic engine.',
        databaseMatch: databaseMatchPayload
    });
});

app.post('/api/analyze/link', (req, res) => {
    const url = (req.body.url || '').toLowerCase();
    let score = 0;
    const warningFlags = [];
    const reasons = [];

    if (url.startsWith('http://')) {
        score += 25;
        warningFlags.push('Unencrypted HTTP Connection');
        reasons.push('Website lacks SSL security encryption.');
    }
    if (url.includes('bit.ly') || url.includes('tinyurl') || url.includes('t.co')) {
        score += 25;
        warningFlags.push('URL Shortener Masking Target');
        reasons.push('Link hides final destination address.');
    }
    if (url.includes('.xyz') || url.includes('.top') || url.includes('.site')) {
        score += 25;
        warningFlags.push('High-Risk Top-Level Domain (TLD)');
        reasons.push('Extension frequently used for low-cost phishing sites.');
    }
    if ((url.includes('sbi') || url.includes('hdfc') || url.includes('kyc')) && !url.includes('sbi.co.in') && !url.includes('hdfcbank.com')) {
        score += 45;
        warningFlags.push('Brand Impersonation / Bank Spoof');
        reasons.push('Domain contains bank keywords but is not an official domain.');
    }

    score = Math.min(score, 100);
    let level = score >= 60 ? 'HIGH RISK' : (score >= 25 ? 'SUSPICIOUS' : 'LOW RISK');
    let label = score >= 60 ? 'Take Action Immediately' : (score >= 25 ? 'Proceed With Care' : 'Likely Safe');
    let rec = score >= 60 ? 'Do NOT enter your password or banking information on this site.' : 'Verify domain in address bar before proceeding.';

    res.json({
        category: 'LINK',
        riskScore: score,
        riskLevel: level,
        label: label,
        threatsDetected: warningFlags,
        reasons: reasons,
        recommendedAction: rec,
        disclaimer: 'This assessment provides guidance and is not a guarantee of accuracy. Prototype Heuristic Engine.'
    });
});

const demoPhoneDb = {
    '9000000001': { number: '+91 9000000001', reportCount: 0, scamTypes: 'NONE', status: 'UNREPORTED' },
    '9000000002': { number: '+91 9000000002', reportCount: 3, scamTypes: 'BANKING, OTP', status: 'COMMUNITY_REPORTED' },
    '9000000003': { number: '+91 9000000003', reportCount: 7, scamTypes: 'KYC, BANKING', status: 'COMMUNITY_REPORTED' },
    '9000000004': { number: '+91 9000000004', reportCount: 12, scamTypes: 'UPI, PAYMENT', status: 'COMMUNITY_REPORTED' }
};

app.get('/api/reports', (req, res) => {
    const list = Object.values(demoPhoneDb);
    res.json(list);
});

app.get('/api/phone/check/:number', (req, res) => {
    const raw = req.params.number || '';
    const cleaned = raw.replace(/[^0-9]/g, '');

    for (let key in demoPhoneDb) {
        if (cleaned.endsWith(key)) {
            const item = demoPhoneDb[key];
            return res.json({
                phoneNumber: item.number,
                reportCount: item.reportCount,
                scamTypes: item.scamTypes,
                verificationStatus: item.status,
                source: 'CyberSaarthi Demonstration Database',
                found: true
            });
        }
    }

    res.json({
        phoneNumber: raw,
        reportCount: 0,
        scamTypes: 'NONE',
        verificationStatus: 'UNREPORTED',
        source: 'CyberSaarthi Demonstration Database',
        found: false
    });
});

app.post(['/api/phone/analyze', '/api/analyze/phone'], (req, res) => {
    const phone = (req.body.phoneNumber || '').trim();
    const actions = req.body.callActions || [];
    const cleaned = phone.replace(/[^0-9]/g, '');

    let dbReport = null;
    for (let key in demoPhoneDb) {
        if (cleaned.endsWith(key)) {
            dbReport = demoPhoneDb[key];
            break;
        }
    }

    intScore = 10;
    let threats = [];
    let reasons = [];

    if (dbReport) {
        if (dbReport.reportCount >= 10) {
            intScore = 90;
            threats.push(`MULTIPLE COMMUNITY REPORTS (${dbReport.reportCount} Reports)`);
            threats.push(`Scam Categories: ${dbReport.scamTypes}`);
            reasons.push(`Multiple reports associated with this demonstration number in the CyberSaarthi database.`);
        } else if (dbReport.reportCount >= 3) {
            intScore = 65;
            threats.push(`COMMUNITY REPORTED NUMBER (${dbReport.reportCount} Reports)`);
            threats.push(`Reported Types: ${dbReport.scamTypes}`);
            reasons.push(`Some community reports are associated with this demonstration number.`);
        } else {
            intScore = 10;
            reasons.push(`No matching active fraud reports were found for this number in the CyberSaarthi database.`);
        }
    } else {
        intScore = 10;
        reasons.push(`No matching reports were found in the CyberSaarthi Demonstration Database.`);
    }

    let actionScore = 0;
    if (actions.includes('Asked for OTP')) { actionScore += 40; threats.push('Caller requested OTP'); reasons.push('Caller asked for OTP. Official banks never ask for OTP.'); }
    if (actions.includes('Asked for UPI PIN')) { actionScore += 50; threats.push('Caller requested UPI PIN'); reasons.push('Caller asked for UPI PIN. Entering PIN transfers money TO scammer!'); }
    if (actions.includes('Asked for bank details') || actions.includes('Asked me to transfer money')) { actionScore += 35; threats.push('Caller requested money transfer / bank details'); }
    if (actions.includes('Asked me to install an app') || actions.includes('Asked me to share my screen')) { actionScore += 45; threats.push('Caller requested remote screen access app'); }

    const totalScore = Math.min(intScore + actionScore, 100);

    const level = totalScore >= 85 ? (actions.includes('Asked for UPI PIN') && intScore >= 60 ? 'CRITICAL RISK' : 'HIGH RISK') : (totalScore >= 55 ? 'SUSPICIOUS' : 'UNKNOWN / LOW EVIDENCE');
    const label = totalScore >= 85 ? 'Take Action Immediately' : (totalScore >= 55 ? 'Proceed With Care' : 'No Matching Reports Found');
    const rec = totalScore >= 85 ? 'DO NOT SHARE OTP • DO NOT TRANSFER MONEY • END THE CALL • CONTACT YOUR BANK THROUGH ITS OFFICIAL CHANNEL' : 'An unreported number can still be dangerous. Never share OTP, PIN, passwords or banking information.';

    res.json({
        category: 'PHONE',
        riskScore: totalScore,
        riskLevel: level,
        label: label,
        threatsDetected: threats,
        reasons: reasons,
        recommendedAction: rec,
        disclaimer: 'This assessment provides guidance and is not a guarantee of accuracy. CyberSaarthi Demonstration Database.'
    });
});

app.post('/api/report/phone', (req, res) => {
    const phone = req.body.phoneNumber || '+91 9000000000';
    const cleaned = phone.replace(/[^0-9]/g, '');
    const scamType = req.body.scamType || 'SUSPICIOUS_CALL';

    demoPhoneDb[cleaned] = {
        number: phone,
        reportCount: (demoPhoneDb[cleaned] ? demoPhoneDb[cleaned].reportCount + 1 : 1),
        scamTypes: scamType,
        status: 'COMMUNITY_REPORTED'
    };

    res.json({
        status: 'SUCCESS',
        message: 'Community Report Submitted. Reports are reviewed before being treated as verified evidence.',
        report: demoPhoneDb[cleaned]
    });
});

app.post(['/api/media/analyze', '/api/analyze/media', '/api/media/upload'], (req, res) => {
    const fname = (req.body.mediaName || 'sample.jpg').toLowerCase();
    const fsize = req.body.fileSize || 1200000;
    const isVideo = req.body.mediaType === 'VIDEO' || fname.endsWith('.mp4') || fname.endsWith('.mov') || fname.endsWith('.webm');

    const hasAi = fname.includes('deepfake') || fname.includes('ai') || fname.includes('synthetic') || fname.includes('midjourney') || fname.includes('dalle') || fname.includes('fake') || fname.includes('generated');

    let score = hasAi ? (isVideo ? 82 : 78) : 15;
    let level = score >= 60 ? 'POSSIBLE AI-GENERATED CONTENT' : 'LOW SUSPICION';
    let label = score >= 60 ? 'Proceed With Extreme Caution' : 'No Strong Synthetic Artifacts';

    let threats = hasAi ? ['Unusual visual/audio frame characteristics', 'Metadata unavailable / stripped', 'Synthetic pixel pattern geometry detected'] : ['Standard Media File Codec Structure', 'Consistent Frame Rate & Shadow Geometry'];
    let reasons = hasAi ? ['Prototype Heuristic Analysis: File exhibits attributes common in generative media synthesis.'] : ['No strong synthetic indicators detected in prototype media analysis.'];

    let rec = score >= 60 
        ? 'Do not use this media alone as evidence of identity or authenticity. Verify through direct communication.'
        : 'No strong synthetic indicators found. However, this does not prove that the media is authentic.';

    res.json({
        category: 'MEDIA',
        riskScore: score,
        riskLevel: level,
        label: label,
        threatsDetected: threats,
        reasons: reasons,
        recommendedAction: rec,
        disclaimer: '⚠ This is an experimental assessment and is not proof that the image/video is AI-generated or authentic.'
    });
});

app.post('/api/chat', (req, res) => {
    const msg = (req.body.userMessage || '').toLowerCase();
    let reply = 'Hello! I am CyberSaarthi Assistant. How can I protect you today? You can ask me about bank SMS, suspicious links, fake calls, or OTP safety.';
    let riskLevel = 'INFO';

    if (msg.includes('bank') || msg.includes('block') || msg.includes('kyc')) {
        reply = 'Do not click any link in the message. Banks generally do not ask you to share OTP, PIN or passwords. You can paste the message here and I can help you check it.';
        riskLevel = 'HIGH RISK';
    } else if (msg.includes('otp')) {
        reply = 'Never share your OTP with anyone! Banks and official authorities will NEVER ask for your OTP over phone or SMS.';
        riskLevel = 'HIGH RISK';
    }

    res.json({
        botReply: reply,
        riskLevel: riskLevel,
        quickActions: ['Check Message', 'Check Link', 'Check Number', 'Emergency Help', 'Talk to Helpline']
    });
});

app.post('/api/report', (req, res) => {
    const ref = 'CYB-2026-' + Math.floor(100000 + Math.random() * 900000);
    res.json({ ...req.body, referenceId: ref, status: 'NEW', createdAt: new Date().toISOString() });
});

app.post('/api/helpline/call', (req, res) => {
    const ref = 'CALL-2026-' + Math.floor(100000 + Math.random() * 900000);
    res.json({ ...req.body, callRef: ref, status: 'NEW', createdAt: new Date().toISOString() });
});

app.get('/api/help', (req, res) => {
    res.json({
        title: 'EMERGENCY FRAUD RESPONSE GUIDANCE',
        helplineNumber: '1800-CYBER-HELP',
        nationalHelpline: '1930',
        steps: [
            { step: 'STEP 1', title: 'Stop Communication', desc: 'Stop communicating with the scammer.' },
            { step: 'STEP 2', title: 'Protect Credentials', desc: 'Do not share OTP, PIN, password or banking info.' },
            { step: 'STEP 3', title: 'Contact Bank', desc: 'Contact your bank / payment provider immediately.' },
            { step: 'STEP 4', title: 'Preserve Evidence', desc: 'Preserve screenshots, numbers, messages and transaction details.' },
            { step: 'STEP 5', title: 'Contact Authority', desc: 'Contact cybercrime authority (1930) and CyberSaarthi.' }
        ]
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` CyberSaarthi Frontend & Mock API running on port ${PORT}`);
    console.log(` Open Web App at: http://localhost:${PORT}`);
    console.log(`==================================================`);
});
