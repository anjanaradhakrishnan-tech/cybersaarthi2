package com.cybersaarthi.service;

import com.cybersaarthi.model.ChatRequest;
import com.cybersaarthi.model.ChatResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatbotService {

    public ChatResponse processChat(ChatRequest request) {
        String query = (request.getUserMessage() != null) ? request.getUserMessage().toLowerCase() : "";
        String reply;
        String riskLevel = "INFO";
        List<String> actions = new ArrayList<>();

        if (query.contains("received this call") || (query.contains("call") && query.contains("upi pin")) || query.contains("phone context")) {
            riskLevel = "HIGH RISK";
            reply = "The number has community reports in the CyberSaarthi demonstration database and you indicated that the caller requested your UPI PIN. This combination is HIGH RISK. Never share your UPI PIN or OTP with any caller!";
            actions.add("END CALL");
            actions.add("REPORT NUMBER");
            actions.add("GET HELP");
        } else if (query.contains("analyzed media") || query.contains("image analysis") || query.contains("video analysis")) {
            riskLevel = "HIGH RISK";
            reply = "Media analysis results provided prototype heuristic insights. If the media shows a relative asking for emergency funds, ALWAYS verify by calling their personal phone number directly before transferring money.";
            actions.add("REPORT MEDIA");
            actions.add("TALK TO HELPLINE");
            actions.add("GET HELP");
        } else if (query.contains("bank") && (query.contains("block") || query.contains("kyc") || query.contains("suspend"))) {
            riskLevel = "HIGH RISK";
            reply = "Do not click any link in the message! Banks in India never ask you to update KYC or unblock accounts via random SMS links or share OTPs over the phone. If you are worried, visit your official bank branch or use the bank's official app.";
            actions.add("Check Link"); actions.add("Report Fraud"); actions.add("Emergency Help");
        } else if (query.contains("otp") || query.contains("pin") || query.contains("password")) {
            riskLevel = "HIGH RISK";
            reply = "NEVER share your OTP, UPI PIN, or ATM PIN with anyone! No bank, police officer, or customer care agent will ever legitimately ask for your OTP. Sharing an OTP allows scammers to withdraw money from your account instantly.";
            actions.add("Check Message"); actions.add("Report Fraud"); actions.add("Emergency Help");
        } else if (query.contains("click") && query.contains("link")) {
            riskLevel = "HIGH RISK";
            reply = "If you clicked a suspicious link: 1) Immediately disconnect from Wi-Fi/Mobile Data. 2) Do NOT enter any passwords or OTPs. 3) Change your internet banking and email passwords immediately. 4) Contact your bank to temporarily freeze account access if money was lost.";
            actions.add("Check Link"); actions.add("Emergency Help");
        } else if (query.contains("upi") || query.contains("deduct") || query.contains("money lost") || query.contains("scammed")) {
            riskLevel = "HIGH RISK";
            reply = "If money was deducted from your UPI or bank account: 1) Call National Cyber Crime Helpline at 1930 immediately! 2) Report the fraud on cybercrime.gov.in within 24 hours. 3) Inform your bank to block further transactions.";
            actions.add("Emergency Help"); actions.add("Talk to Helpline");
        } else if (query.contains("digital arrest") || query.contains("police") || query.contains("cbi")) {
            riskLevel = "HIGH RISK";
            reply = "Beware of Digital Arrest Scams! Police, CBI, Customs, and TRAI NEVER arrest people over Video Calls (Skype/WhatsApp) or demand money transfers for 'investigation'. Disconnect the call immediately and call 1930.";
            actions.add("END CALL"); actions.add("REPORT NUMBER"); actions.add("GET HELP");
        } else {
            reply = "Hello! I am CyberSaarthi Assistant. I can help you check suspicious messages, links, phone numbers, media deepfakes, or guide you if you suspect cyber fraud. Ask me anything below!";
            actions.add("Check Message"); actions.add("Check Link"); actions.add("Check Phone Number"); actions.add("Emergency Help");
        }

        return new ChatResponse(reply, riskLevel, actions);
    }
}
