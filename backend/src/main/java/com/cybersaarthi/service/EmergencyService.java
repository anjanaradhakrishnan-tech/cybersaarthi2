package com.cybersaarthi.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmergencyService {

    @Value("${cybersaarthi.helpline.number:1800-CYBER-HELP}")
    private String helplineNumber;

    @Value("${cybersaarthi.emergency.national-cyber-crime:1930}")
    private String nationalHelpline;

    public Map<String, Object> getEmergencyGuidance() {
        Map<String, Object> emergencyMap = new HashMap<>();
        emergencyMap.put("title", "EMERGENCY FRAUD RESPONSE GUIDANCE");
        emergencyMap.put("helplineNumber", helplineNumber);
        emergencyMap.put("nationalHelpline", nationalHelpline);
        emergencyMap.put("officialPortal", "https://cybercrime.gov.in");

        List<Map<String, String>> steps = List.of(
            Map.of("step", "STEP 1", "title", "Stop Communication", "desc", "Immediately stop communicating with the scammer. Do not answer their calls or messages."),
            Map.of("step", "STEP 2", "title", "Protect Credentials", "desc", "Do not share OTP, PIN, password, or banking information under any circumstances."),
            Map.of("step", "STEP 3", "title", "Contact Bank", "desc", "Call your bank or payment provider helpline (1930) immediately if money was deducted."),
            Map.of("step", "STEP 4", "title", "Preserve Evidence", "desc", "Take screenshots of messages, phone call logs, transaction IDs, and fraudulent URLs."),
            Map.of("step", "STEP 5", "title", "File Complaint", "desc", "Report to National Cyber Crime Portal (1930 / cybercrime.gov.in) and CyberSaarthi.")
        );

        emergencyMap.put("steps", steps);
        return emergencyMap;
    }
}
