const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'sms_spam_collection.csv');
const backendCsvPath = path.join(__dirname, '..', 'backend', 'src', 'main', 'resources', 'sms_spam_collection.csv');
const jsonOutPath = path.join(__dirname, '..', 'frontend', 'data', 'sms_spam_db.json');
const sqlOutPath = path.join(__dirname, 'sms_spam_seed.sql');

if (!fs.existsSync(path.dirname(jsonOutPath))) {
    fs.mkdirSync(path.dirname(jsonOutPath), { recursive: true });
}

function parseCSV(content) {
    const lines = content.split(/\r?\n/);
    const records = [];
    
    let i = 0;
    // Skip header line if v1,v2
    if (lines.length > 0 && lines[0].toLowerCase().includes('v1,v2')) {
        i = 1;
    }

    for (; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        let label = '';
        if (line.startsWith('spam,')) {
            label = 'spam';
            line = line.substring(5);
        } else if (line.startsWith('ham,')) {
            label = 'ham';
            line = line.substring(4);
        } else {
            continue;
        }

        let text = '';
        if (line.startsWith('"')) {
            let quoteClosed = false;
            let acc = line.substring(1);
            while (true) {
                let endIdx = -1;
                for (let c = 0; c < acc.length; c++) {
                    if (acc[c] === '"') {
                        if (acc[c + 1] === '"') {
                            c++; // skip escaped quote
                        } else {
                            endIdx = c;
                            break;
                        }
                    }
                }
                if (endIdx !== -1) {
                    text = acc.substring(0, endIdx).replace(/""/g, '"');
                    quoteClosed = true;
                    break;
                } else {
                    i++;
                    if (i >= lines.length) break;
                    acc += '\n' + lines[i];
                }
            }
            if (!quoteClosed) {
                text = acc.replace(/""/g, '"');
            }
        } else {
            text = line.replace(/,,,+$/, '').trim();
        }

        text = text.trim();
        if (text) {
            records.push({
                id: records.length + 1,
                label: label,
                isSpam: label === 'spam',
                message: text
            });
        }
    }

    return records;
}

const csvRaw = fs.readFileSync(csvPath, 'utf8');
const records = parseCSV(csvRaw);

const spamCount = records.filter(r => r.isSpam).length;
const hamCount = records.filter(r => !r.isSpam).length;

console.log(`[CyberSaarthi DB Builder] Parsed ${records.length} records (${spamCount} spam, ${hamCount} ham).`);

// Tokenizer
const tokenize = (str) => {
    return (str.toLowerCase().match(/[a-z0-9£$€]+/g) || []);
};

// Build Vocabulary & Frequency Tables
const spamWords = {};
const hamWords = {};
let totalSpamWords = 0;
let totalHamWords = 0;

records.forEach(r => {
    const words = tokenize(r.message);
    const seenInDoc = new Set(words);
    seenInDoc.forEach(w => {
        if (r.isSpam) {
            spamWords[w] = (spamWords[w] || 0) + 1;
            totalSpamWords++;
        } else {
            hamWords[w] = (hamWords[w] || 0) + 1;
            totalHamWords++;
        }
    });
});

// Identify distinctive spam keywords with Laplace probability ratio
const wordScores = [];
const allWords = new Set([...Object.keys(spamWords), ...Object.keys(hamWords)]);

allWords.forEach(word => {
    const sCount = spamWords[word] || 0;
    const hCount = hamWords[word] || 0;
    if (sCount >= 3) {
        // Laplace smoothed probability
        const pSpam = (sCount + 1) / (spamCount + 2);
        const pHam = (hCount + 1) / (hamCount + 2);
        const ratio = pSpam / (pHam + 0.0001);
        wordScores.push({ word, sCount, hCount, ratio });
    }
});

wordScores.sort((a, b) => b.ratio - a.ratio);
const topSpamKeywords = wordScores.slice(0, 120).map(w => ({
    keyword: w.word,
    spamCount: w.sCount,
    hamCount: w.hCount,
    riskWeight: Math.min(Math.round(w.ratio * 5), 100)
}));

// Extract known scam phone numbers and shortcodes from spam records
const phoneRegex = /\b(0[7-9]\d{9}|08\d{8,9}|09\d{8,9}|\+44\d{10}|\d{5})\b/g;
const spamNumbersSet = new Set();
records.filter(r => r.isSpam).forEach(r => {
    const matches = r.message.match(phoneRegex);
    if (matches) {
        matches.forEach(m => {
            if (m.length >= 5) spamNumbersSet.add(m);
        });
    }
});

const databasePayload = {
    metadata: {
        datasetName: 'SMS Spam Collection Database',
        totalRecords: records.length,
        spamCount: spamCount,
        hamCount: hamCount,
        spamPercentage: ((spamCount / records.length) * 100).toFixed(2) + '%',
        topSpamKeywordsCount: topSpamKeywords.length,
        extractedSpamNumbersCount: spamNumbersSet.size
    },
    topSpamKeywords: topSpamKeywords,
    knownSpamNumbers: Array.from(spamNumbersSet),
    records: records
};

// 1. Write JSON DB for frontend and quick Node server access
fs.writeFileSync(jsonOutPath, JSON.stringify(databasePayload, null, 2), 'utf8');
console.log(`[CyberSaarthi DB Builder] Wrote JSON database payload to ${jsonOutPath}`);

// 2. Write full SQL seed script for relational database
let sqlContent = `-- CyberSaarthi SMS Spam Database Complete Seed (${records.length} Records)\n`;
sqlContent += `-- Compatible with H2, SQLite, MySQL, and PostgreSQL\n\n`;
sqlContent += `CREATE TABLE IF NOT EXISTS sms_spam_records (\n`;
sqlContent += `    id BIGINT AUTO_INCREMENT PRIMARY KEY,\n`;
sqlContent += `    label VARCHAR(10) NOT NULL,\n`;
sqlContent += `    is_spam BOOLEAN NOT NULL,\n`;
sqlContent += `    message_text TEXT NOT NULL,\n`;
sqlContent += `    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n`;
sqlContent += `);\n\n`;

// Write in efficient multi-row batch inserts of 100 records
const BATCH_SIZE = 100;
for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    sqlContent += `INSERT INTO sms_spam_records (label, is_spam, message_text) VALUES\n`;
    const rows = batch.map(r => {
        const escapedMsg = r.message.replace(/'/g, "''");
        return `  ('${r.label}', ${r.isSpam ? 'TRUE' : 'FALSE'}, '${escapedMsg}')`;
    });
    sqlContent += rows.join(',\n') + ';\n\n';
}

fs.writeFileSync(sqlOutPath, sqlContent, 'utf8');
console.log(`[CyberSaarthi DB Builder] Wrote complete SQL seed script with all ${records.length} records to ${sqlOutPath}`);

// 3. Write standardized normalized CSV for both database/ and backend resources
let cleanCsv = `v1,v2\n`;
records.forEach(r => {
    let msg = r.message.replace(/"/g, '""');
    cleanCsv += `${r.label},"${msg}"\n`;
});
fs.writeFileSync(csvPath, cleanCsv, 'utf8');
console.log(`[CyberSaarthi DB Builder] Normalized CSV written to ${csvPath}`);

if (fs.existsSync(path.dirname(backendCsvPath))) {
    fs.writeFileSync(backendCsvPath, cleanCsv, 'utf8');
    console.log(`[CyberSaarthi DB Builder] Normalized CSV synchronized to ${backendCsvPath}`);
}

console.log('[CyberSaarthi DB Builder] Database build completed successfully!');
