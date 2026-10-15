package com.cybersaarthi.service;

import com.cybersaarthi.model.AnalysisResult;
import com.cybersaarthi.model.FraudPhoneReport;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PhoneAnalysisService {

    private static final String DISCLAIMER = "This assessment provides guidance and is not a guarantee of accuracy. CyberSaarthi Demonstration Database.";

    private static PhoneAnalysisService instance;

    @Autowired(required = false)
    private FraudIntelligenceService fraudIntelligenceService;

    @PostConstruct
    public void init() {
        instance = this;
    }

    public static void registerScamNumber(String number) {
        if (instance != null && instance.fraudIntelligenceService != null && number != null && !number.trim().isEmpty()) {
            instance.fraudIntelligenceService.registerOrIncrementReport(number.trim(), "REPORTED_SCAM", "Community fraud report submitted", "");
        }
    }

    public AnalysisResult analyzePhone(String phoneNumber, List<String> callActions) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return new AnalysisResult("PHONE", 0, "UNKNOWN / NO REPORTS FOUND", "Low Evidence",
                    List.of(), List.of("No phone number provided."),
                    "Please enter a phone number to analyze.", DISCLAIMER);
        }

        String trimmedNum = phoneNumber.trim();
        List<String> actions = (callActions != null) ? callActions : List.of();

        // 1. Search fraud_phone_reports database
        Optional<FraudPhoneReport> dbReportOpt = Optional.empty();
        if (fraudIntelligenceService != null) {
            dbReportOpt = fraudIntelligenceService.checkPhoneNumber(trimmedNum);
        }

        int dbScore = 10;
        int actionScore = 0;
        List<String> threats = new ArrayList<>();
        List<String> reasons = new ArrayList<>();

        if (dbReportOpt.isPresent()) {
            FraudPhoneReport dbReport = dbReportOpt.get();
            int count = dbReport.getReportCount();
            String status = dbReport.getVerificationStatus();
            String types = dbReport.getScamTypes();

            if (count >= 10) {
                dbScore = 90;
                threats.add("MULTIPLE COMMUNITY REPORTS (" + count + " Reports)");
                threats.add("Scam Categories: " + types);
                reasons.add("Multiple reports associated with this demonstration number in the CyberSaarthi database.");
                reasons.add("Community Verification Status: " + status);
            } else if (count >= 3) {
                dbScore = 65;
                threats.add("COMMUNITY REPORTED NUMBER (" + count + " Reports)");
                threats.add("Reported Types: " + types);
                reasons.add("Some community reports are associated with this demonstration number.");
            } else {
                dbScore = 10;
                reasons.add("No matching active fraud reports were found for this number in the CyberSaarthi database.");
            }
        } else {
            dbScore = 10;
            reasons.add("No matching reports were found in the CyberSaarthi Demonstration Database.");
        }

        // 2. Call Context Analysis (Behavioral Options)
        boolean asksOtp = actions.stream().anyMatch(a -> a.equalsIgnoreCase("Asked for OTP"));
        boolean asksUpiPin = actions.stream().anyMatch(a -> a.equalsIgnoreCase("Asked for UPI PIN"));
        boolean asksBank = actions.stream().anyMatch(a -> a.equalsIgnoreCase("Asked for bank details"));
        boolean asksTransfer = actions.stream().anyMatch(a -> a.equalsIgnoreCase("Asked me to transfer money"));
        boolean asksApp = actions.stream().anyMatch(a -> a.equalsIgnoreCase("Asked me to install an app"));
        boolean asksScreen = actions.stream().anyMatch(a -> a.equalsIgnoreCase("Asked me to share my screen"));
        boolean claimsGovt = actions.stream().anyMatch(a -> a.equalsIgnoreCase("Claimed to be police/government") || a.equalsIgnoreCase("Claimed to be from a bank"));
        boolean threatensBlock = actions.stream().anyMatch(a -> a.equalsIgnoreCase("Threatened account suspension"));

        if (asksOtp) {
            actionScore += 40;
            threats.add("Caller requested OTP");
            reasons.add("Caller asked for OTP. Official institutions never request OTP over phone calls.");
        }
        if (asksUpiPin) {
            actionScore += 50;
            threats.add("Caller requested UPI PIN");
            reasons.add("Caller asked for UPI PIN. Entering your PIN transfers money TO the scammer!");
        }
        if (asksBank || asksTransfer) {
            actionScore += 35;
            threats.add("Caller requested money transfer / banking credentials");
            reasons.add("Caller requested financial transfer or card details.");
        }
        if (asksApp || asksScreen) {
            actionScore += 45;
            threats.add("Caller requested remote app installation / screen sharing");
            reasons.add("Caller requested remote access software (AnyDesk/TeamViewer).");
        }
        if (claimsGovt || threatensBlock) {
            actionScore += 30;
            threats.add("Authority impersonation & urgent penalty threat");
            reasons.add("Caller used authority pressure or threats of legal action.");
        }

        int totalScore = Math.min(dbScore + actionScore, 100);

        String level;
        String label;
        String recommendedAction;

        if (totalScore >= 85) {
            level = (asksUpiPin && dbScore >= 60) ? "CRITICAL RISK" : "HIGH RISK";
            label = "Take Action Immediately";
            recommendedAction = "DO NOT SHARE OTP • DO NOT TRANSFER MONEY • END THE CALL • CONTACT YOUR BANK THROUGH ITS OFFICIAL CHANNEL";
        } else if (totalScore >= 55) {
            level = "SUSPICIOUS";
            label = "Proceed With Care";
            recommendedAction = "Do not share sensitive passwords or PINs. Verify caller identity independently.";
        } else {
            level = "UNKNOWN / LOW EVIDENCE";
            label = "No Matching Reports Found";
            recommendedAction = "An unreported number can still be dangerous. Never share OTP, PIN, passwords or banking information.";
        }

        return new AnalysisResult("PHONE", totalScore, level, label, threats, reasons, recommendedAction, DISCLAIMER);
    }
}
