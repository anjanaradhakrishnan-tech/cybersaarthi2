package com.cybersaarthi.service;

import com.cybersaarthi.model.AnalysisResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class LinkAnalysisService {

    private static final String DISCLAIMER = "This assessment provides guidance and is not a guarantee of accuracy. Prototype Heuristic Engine.";
    private static final Pattern IP_PATTERN = Pattern.compile("^https?://\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}.*");

    public AnalysisResult analyzeLink(String url) {
        if (url == null || url.trim().isEmpty()) {
            return new AnalysisResult("LINK", 0, "LOW RISK", "Likely Safe",
                    List.of(), List.of("No URL provided."),
                    "Please enter a website URL to analyze.", DISCLAIMER);
        }

        String urlTrimmed = url.trim();
        String urlLower = urlTrimmed.toLowerCase();
        int score = 0;
        List<String> warningFlags = new ArrayList<>();
        List<String> reasons = new ArrayList<>();

        // Check 1: HTTP instead of HTTPS
        if (urlLower.startsWith("http://")) {
            score += 25;
            warningFlags.add("Unencrypted HTTP Connection");
            reasons.add("Website uses HTTP without SSL encryption. Passwords and credentials sent over HTTP can be intercepted.");
        }

        // Check 2: IP Address in Hostname
        if (IP_PATTERN.matcher(urlLower).matches()) {
            score += 35;
            warningFlags.add("IP Address Hostname Detected");
            reasons.add("URL uses a raw IP address instead of a standard domain name, a common trick used by phishing servers.");
        }

        // Check 3: URL Shortener
        if (urlLower.contains("bit.ly/") || urlLower.contains("tinyurl.com/") || urlLower.contains("t.co/") ||
            urlLower.contains("is.gd/") || urlLower.contains("cutt.ly/") || urlLower.contains("rb.gy/")) {
            score += 25;
            warningFlags.add("URL Shortener Masking Target");
            reasons.add("Uses a link shortening service to hide the final destination web address.");
        }

        // Check 4: Suspicious TLDs
        if (urlLower.contains(".xyz") || urlLower.contains(".top") || urlLower.contains(".online") ||
            urlLower.contains(".site") || urlLower.contains(".club") || urlLower.contains(".biz") || urlLower.contains(".tk")) {
            score += 25;
            warningFlags.add("High-Risk Top-Level Domain (TLD)");
            reasons.add("Domain extension (.xyz, .top, etc.) is frequently associated with low-cost phishing sites.");
        }

        // Check 5: Misleading Bank / Govt Brand Spoofing
        if ((urlLower.contains("sbi") || urlLower.contains("hdfc") || urlLower.contains("icici") ||
             urlLower.contains("axis") || urlLower.contains("paytm") || urlLower.contains("yono") || urlLower.contains("kyc")) &&
            !urlLower.contains("sbi.co.in") && !urlLower.contains("hdfcbank.com") && !urlLower.contains("icicibank.com") &&
            !urlLower.contains("axisbank.com") && !urlLower.contains("paytm.com")) {
            score += 45;
            warningFlags.add("Potential Brand Impersonation / Bank Spoof");
            reasons.add("Domain contains banking keywords (SBI, HDFC, YONO, KYC) but does not match the official domain.");
        }

        // Check 6: Excessive Subdomains or Hyphens
        long hyphensCount = urlLower.chars().filter(ch -> ch == '-').count();
        if (hyphensCount >= 3) {
            score += 15;
            warningFlags.add("Multiple Hyphens in Domain");
            reasons.add("Excessive hyphens in web address are often used to confuse users into mistaking fake domains for real ones.");
        }

        score = Math.min(score, 100);

        String level;
        String label;
        String recommendedAction;

        if (score >= 60) {
            level = "HIGH RISK";
            label = "Take Action Immediately";
            recommendedAction = "Do NOT enter your password, PIN or banking details on this website. Close the browser tab immediately.";
        } else if (score >= 25) {
            level = "SUSPICIOUS";
            label = "Proceed With Care";
            recommendedAction = "Do not enter sensitive login or financial information unless you have double-checked the address bar.";
        } else {
            level = "LOW RISK";
            label = "Likely Safe";
            recommendedAction = "Standard domain structure detected. Always verify that the address bar shows HTTPS and the official domain.";
            reasons.add("URL structure adheres to standard web domain practices.");
        }

        return new AnalysisResult("LINK", score, level, label, warningFlags, reasons, recommendedAction, DISCLAIMER);
    }
}
