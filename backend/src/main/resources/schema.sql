-- CyberSaarthi Relational Database Schema
-- Compatible with H2, SQLite, and MySQL

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(20),
    language VARCHAR(10) DEFAULT 'en',
    elder_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference_id VARCHAR(50) UNIQUE NOT NULL,
    reporter_name VARCHAR(100),
    reporter_phone VARCHAR(20),
    scam_type VARCHAR(50) NOT NULL,
    description TEXT,
    suspicious_number VARCHAR(30),
    suspicious_url VARCHAR(500),
    amount_lost DECIMAL(10, 2) DEFAULT 0.0,
    evidence_path VARCHAR(500),
    risk_level VARCHAR(20) DEFAULT 'HIGH RISK',
    status VARCHAR(20) DEFAULT 'NEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analysis_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(30) NOT NULL, -- MESSAGE, LINK, PHONE, MEDIA
    input_text TEXT,
    risk_score INT,
    risk_level VARCHAR(20),
    threats_detected TEXT,
    reasons TEXT,
    recommended_action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS phone_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(30) NOT NULL,
    scam_category VARCHAR(50),
    reports_count INT DEFAULT 1,
    last_reported TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS link_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    domain VARCHAR(200),
    risk_score INT,
    warning_flags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(100),
    sender VARCHAR(20), -- USER or ASSISTANT
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS helpline_calls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    call_ref VARCHAR(50) UNIQUE NOT NULL,
    caller_number VARCHAR(30) NOT NULL,
    complaint_type VARCHAR(50) NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'SUSPICIOUS',
    description TEXT,
    status VARCHAR(20) DEFAULT 'NEW', -- NEW, IN PROGRESS, ESCALATED, RESOLVED
    operator_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS safety_scores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),
    score INT NOT NULL,
    password_check BOOLEAN,
    two_fa_check BOOLEAN,
    link_check BOOLEAN,
    caller_check BOOLEAN,
    update_check BOOLEAN,
    otp_check BOOLEAN,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sms_spam_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    label VARCHAR(10) NOT NULL, -- 'spam' or 'ham'
    is_spam BOOLEAN NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Note: The complete 5,572-record seed dataset is available in database/sms_spam_seed.sql
-- Core initial reference seeds for quick initialization:
INSERT INTO sms_spam_records (label, is_spam, message_text) VALUES 
('ham', FALSE, 'Go until jurong point, crazy.. Available only in bugis n great world la e buffet... Cine there got amore wat...'),
('ham', FALSE, 'Ok lar... Joking wif u oni...'),
('spam', TRUE, 'Free entry in 2 a wkly comp to win FA Cup final tkts 21st May 2005. Text FA to 87121 to receive entry question(std txt rate)T&C''s apply 08452810075over18''s'),
('spam', TRUE, 'WINNER!! As a valued network customer you have been selected to receivea 900 prize reward! To claim call 09061701461. Claim code KL341. Valid 12 hours only.'),
('spam', TRUE, 'URGENT! Your Mobile No. was awarded 2000 Bonus Caller Prize on 5/9/03 This is our final try to contact U! Call from Landline 09064019788 BOX42WR29C, 150PPM'),
('ham', FALSE, 'I''ve been searching for the right words to thank you for this breather. I promise i wont take your help for granted and will fulfil my promise. You have been wonderful and a blessing at all times.');
