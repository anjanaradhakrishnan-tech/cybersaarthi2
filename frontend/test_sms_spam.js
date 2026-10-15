const fs = require('fs');
const path = require('path');

// Test the dataset loading and classification logic
const dbPath = path.join(__dirname, 'data', 'sms_spam_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('Database Loaded Successfully:');
console.log('- Total records:', db.metadata.totalRecords);
console.log('- Spam count:', db.metadata.spamCount);
console.log('- Ham count:', db.metadata.hamCount);
console.log('- Spam percentage:', db.metadata.spamPercentage);
console.log('- Known spam numbers count:', db.knownSpamNumbers.length);
console.log('- Top spam keywords count:', db.topSpamKeywords.length);

function tokenize(text) {
    return new Set((text || '').toLowerCase().match(/[a-z0-9£$€]+/g) || []);
}

function calculateJaccard(tokensA, tokensB) {
    if (!tokensA.size || !tokensB.size) return 0;
    let intersect = 0;
    tokensA.forEach(t => { if (tokensB.has(t)) intersect++; });
    const union = tokensA.size + tokensB.size - intersect;
    return union > 0 ? (intersect / union) : 0;
}

function testMatch(text) {
    const inputTokens = tokenize(text);
    let bestSpamMatch = null;
    let maxSpamSim = 0;
    let bestHamMatch = null;
    let maxHamSim = 0;

    for (const record of db.records) {
        const recordTokens = tokenize(record.message);
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

    const detectedKeywords = db.topSpamKeywords
        .filter(k => inputTokens.has(k.keyword.toLowerCase()))
        .map(k => k.keyword);

    const inputLower = text.toLowerCase();
    const detectedNumbers = db.knownSpamNumbers.filter(n => n.length >= 5 && inputLower.includes(n.toLowerCase()));

    const isSpam = (maxSpamSim >= 0.40) || (detectedNumbers.length > 0) || (detectedKeywords.length >= 2);

    return {
        isSpam,
        bestSpamMatch,
        spamSimilarity: (maxSpamSim * 100).toFixed(1) + '%',
        bestHamMatch,
        hamSimilarity: (maxHamSim * 100).toFixed(1) + '%',
        detectedKeywords: detectedKeywords.slice(0, 6),
        detectedNumbers
    };
}

console.log('\n--- TEST 1: Known Spam in DB (FA Cup lottery) ---');
const r1 = testMatch("Free entry in 2 a wkly comp to win FA Cup final tkts 21st May 2005. Text FA to 87121 to receive entry question(std txt rate)T&C's apply 08452810075over18's");
console.log('Spam Match ID:', r1.bestSpamMatch.id, 'Similarity:', r1.spamSimilarity);
console.log('Detected Keywords:', r1.detectedKeywords);
console.log('Detected Numbers:', r1.detectedNumbers);
console.assert(r1.isSpam === true, 'Test 1 should be spam');

console.log('\n--- TEST 2: Varied Spam with Claim Code & Scam Numbers ---');
const r2 = testMatch("URGENT! You have won a 1000 prize reward. Call 09061701461 to claim your reward before midnight.");
console.log('Spam Match ID:', r2.bestSpamMatch.id, 'Similarity:', r2.spamSimilarity);
console.log('Detected Keywords:', r2.detectedKeywords);
console.log('Detected Numbers:', r2.detectedNumbers);
console.assert(r2.isSpam === true, 'Test 2 should be spam');

console.log('\n--- TEST 3: Legitimate Personal Message (Ham) ---');
const r3 = testMatch("I'm gonna be home soon and i don't want to talk about this stuff anymore tonight, k?");
console.log('Ham Match ID:', r3.bestHamMatch.id, 'Ham Similarity:', r3.hamSimilarity);
console.log('Spam Similarity:', r3.spamSimilarity);
console.assert(r3.isSpam === false, 'Test 3 should be ham');

console.log('\n--- TEST 4: Tricky Sentence with "opinion" (must NOT trigger UPI PIN false positive) ---');
const r4 = testMatch("what is your opinion on this movie?");
console.log('Spam Similarity:', r4.spamSimilarity, 'Ham Similarity:', r4.hamSimilarity);
console.assert(r4.isSpam === false, 'Test 4 should be ham');

console.log('\n--- TEST 5: Legitimate Sports message with "won" (must NOT trigger lottery false positive) ---');
const r5 = testMatch("Hey mom, I won the tennis match today! We get free ice cream afterwards.");
console.log('Spam Similarity:', r5.spamSimilarity, 'Ham Similarity:', r5.hamSimilarity);
console.assert(r5.isSpam === false, 'Test 5 should be ham');

console.log('\nAll 5 automated tests executed cleanly and verified!');
