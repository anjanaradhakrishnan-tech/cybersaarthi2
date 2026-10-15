package com.cybersaarthi.service;

import com.cybersaarthi.model.AnalysisResult;
import com.cybersaarthi.model.SmsMatchResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class MessageAnalysisService {

    private static final String DISCLAIMER = "This assessment provides guidance powered by the CyberSaarthi SMS Spam Intelligence Database (5,572 verified records) & heuristic engine.";

    private static final Pattern UPI_PIN_PATTERN = Pattern.compile("\\b(upi\\s*pin|atm\\s*pin|mpin|m-pin|secret\\s*pin|security\\s*pin|card\\s*pin|cvv)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern OTP_PATTERN = Pattern.compile("\\b(otp|one-time\\s*password)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern GENERIC_PIN_PATTERN = Pattern.compile("\\bpin\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern BANKING_CONTEXT_PATTERN = Pattern.compile("\\b(bank|account|gpay|phonepe|paytm|wallet|transfer|refund|debit|credit|card|login)\\b", Pattern.CASE_INSENSITIVE);

    private static final Pattern KYC_PANIC_PATTERN = Pattern.compile("\\b(kyc|pan\\s*card|aadhaar|account\\s*blocked|account\\s*suspended|sim\\s*blocked|deactivated|unblock\\s*account)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern LOTTERY_PRIZE_PATTERN = Pattern.compile("\\b(lottery|jackpot|crore|lakhs?|cash\\s*prize|reward\\s*points?|bonus\\s*caller|claim\\s*code|claim\\s*your\\s*prize)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern WON_PRIZE_PATTERN = Pattern.compile("\\b(you\\s*(?:have\\s*)?won|selected\\s*to\\s*receive|awarded\\s*(?:a\\s*)?prize|claim\\s*(?:your\\s*)?reward)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern SUSPICIOUS_URL_PATTERN = Pattern.compile("\\b(https?://\\S+|bit\\.ly/\\S+|tinyurl\\.com/\\S+|\\S+\\.(xyz|top|site|club|work|buzz))\\b", Pattern.CASE_INSENSITIVE);

    @Autowired(required = false)
    private SmsSpamDatabaseService smsSpamDatabaseService;

    public AnalysisResult analyzeMessage(String messageText) {
        if (messageText == null || messageText.trim().isEmpty()) {
            return new AnalysisResult("MESSAGE", 0, "LOW RISK", "Likely Safe",
                    List.of(), List.of("No message content provided."),
                    "Please enter a suspicious message to analyze.", DISCLAIMER, null);
        }

        String textLower = messageText.toLowerCase();
        int score = 0;
        List<String> threats = new ArrayList<>();
        List<String> reasons = new ArrayList<>();

        // 1. Cross-reference with CyberSaarthi SMS Spam Database (5,572 records)
        SmsMatchResult dbResult = null;
        if (smsSpamDatabaseService != null) {
            try {
                dbResult = smsSpamDatabaseService.checkSms(messageText);
            } catch (Exception e) {
                // Fallback to heuristics
            }
        }

        if (dbResult != null) {
            score = Math.max(score, dbResult.getRiskScore());

            if (dbResult.isSpam()) {
                if (dbResult.getSimilarityScore() >= 0.40) {
                    int simPct = (int) Math.round(dbResult.getSimilarityScore() * 100);
                    threats.add(String.format("🎯 SMS SPAM DATABASE MATCH: %d%% similarity with known spam record #%d",
                            simPct, dbResult.getMatchedRecordId() != null ? dbResult.getMatchedRecordId() : 0));
                    String snippet = dbResult.getMatchedSnippet();
                    if (snippet.length() > 95) snippet = snippet.substring(0, 92) + "...";
                    reasons.add(String.format("Matches verified Spam Record #%d in database: \"%s\"",
                            dbResult.getMatchedRecordId() != null ? dbResult.getMatchedRecordId() : 0, snippet));
                }

                if (dbResult.getConfidencePercent() >= 65.0) {
                    threats.add(String.format("📊 High Statistical Spam Confidence (%.1f%% probability across 5,572 records)", dbResult.getConfidencePercent()));
                }

                if (dbResult.getMatchedSpamKeywords() != null && !dbResult.getMatchedSpamKeywords().isEmpty()) {
                    threats.add("Spam Vocabulary Indicators: " + String.join(", ", dbResult.getMatchedSpamKeywords()));
                    reasons.add("Detected high-frequency promotional/fraud vocabulary extracted from SMS spam intelligence corpus.");
                }

                if (dbResult.getDetectedNumbers() != null && !dbResult.getDetectedNumbers().isEmpty()) {
                    threats.add("🚨 Known Scam Contact/Shortcode: " + String.join(", ", dbResult.getDetectedNumbers()));
                    reasons.add("Contains telephone numbers or shortcodes verified in the CyberSaarthi SMS Spam Database.");
                    score = Math.max(score, 90);
                }

                if (dbResult.getRationale() != null && !dbResult.getRationale().isEmpty()) {
                    reasons.add("Database Insight: " + dbResult.getRationale());
                }
            } else if (dbResult.getHamSimilarity() >= 0.60 && dbResult.getSimilarityScore() < 0.35) {
                reasons.add(String.format("Verified Corpus Match: Message style matches known legitimate personal SMS (Ham record #%d, %d%% match).",
                        dbResult.getMatchedHamId() != null ? dbResult.getMatchedHamId() : 0,
                        (int) Math.round(dbResult.getHamSimilarity() * 100)));
            }
        }

        // 2. Critical Heuristic Rule: UPI PIN / OTP / MPIN / CVV Demands (CRITICAL HIGH RISK)
        if (UPI_PIN_PATTERN.matcher(messageText).find() || OTP_PATTERN.matcher(messageText).find() ||
                (GENERIC_PIN_PATTERN.matcher(messageText).find() && BANKING_CONTEXT_PATTERN.matcher(messageText).find())) {
            score = 100;
            threats.add(0, "🚨 CRITICAL THREAT: DEMANDING UPI PIN / OTP / PASSWORD");
            reasons.add(0, "CRITICAL WARNING: Entering or sharing your UPI PIN WILL IMMEDIATELY DEDUCT MONEY FROM YOUR BANK ACCOUNT. You NEVER enter a PIN to receive money or refunds!");
            reasons.add("Official banks, GPay, PhonePe, Paytm, and customer care will NEVER ask for your UPI PIN, MPIN, or OTP over phone, SMS, or WhatsApp.");
        }

        // 3. Bank Account / KYC / SIM Suspension Urgency
        if (KYC_PANIC_PATTERN.matcher(messageText).find() ||
                (BANKING_CONTEXT_PATTERN.matcher(messageText).find() && (textLower.contains("blocked") || textLower.contains("suspended") || textLower.contains("deactivated")))) {
            score = Math.max(score, 85);
            threats.add("Fake KYC / Account Suspension Threat");
            reasons.add("Creates artificial panic claiming your bank account or SIM card will be blocked unless you take immediate action.");
        }

        // 4. Lottery / Cash Prize / Claim Scams
        if (LOTTERY_PRIZE_PATTERN.matcher(messageText).find() || WON_PRIZE_PATTERN.matcher(messageText).find() ||
                (textLower.contains("won") && (textLower.contains("prize") || textLower.contains("cash") || textLower.contains("claim") || textLower.contains("reward")))) {
            score = Math.max(score, 80);
            threats.add("Prize / Lottery / Claim Pattern");
            reasons.add("Message promises unexpected monetary rewards or prizes to trick users into paying advance processing fees.");
        }

        // 5. Urgent Utility Disconnection
        if (textLower.contains("electricity") || textLower.contains("power cut") || (textLower.contains("urgent payment") && textLower.contains("bill"))) {
            score = Math.max(score, 80);
            threats.add("Urgent Bill Payment Threat");
            reasons.add("Creates artificial panic around utility disconnection or immediate penalty.");
        }

        // 6. Suspicious URLs embedded
        if (SUSPICIOUS_URL_PATTERN.matcher(messageText).find()) {
            score = Math.max(score, 70);
            threats.add("Suspicious Embedded URL");
            reasons.add("Contains unverified links or URL shorteners pointing to unknown websites.");
        }

        // Cap score at 100
        score = Math.min(score, 100);

        String level;
        String label;
        String recommendedAction;

        if (score >= 60) {
            level = "HIGH RISK";
            label = "Take Action Immediately";
            recommendedAction = "Do NOT click any link. Do NOT share your UPI PIN, OTP, or passwords under any circumstances! Disconnect immediately. Entering your PIN transfers money TO the scammer!";
        } else if (score >= 25) {
            level = "SUSPICIOUS";
            label = "Proceed With Care";
            recommendedAction = "Verify claims independently through official customer care numbers before taking any action.";
        } else {
            level = "LOW RISK";
            label = "Likely Safe";
            recommendedAction = "No obvious scam patterns detected. Always maintain caution when receiving unexpected messages or links from unknown senders.";
            if (reasons.isEmpty()) {
                reasons.add("Message appears to be normal communication without aggressive scam indicators.");
            }
        }

        return new AnalysisResult("MESSAGE", score, level, label, threats, reasons, recommendedAction, DISCLAIMER, dbResult);
    }
}
