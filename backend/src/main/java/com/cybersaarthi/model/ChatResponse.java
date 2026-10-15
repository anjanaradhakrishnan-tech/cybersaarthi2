package com.cybersaarthi.model;

import java.util.List;

public class ChatResponse {
    private String botReply;
    private String riskLevel;
    private List<String> quickActions;

    public ChatResponse() {}

    public ChatResponse(String botReply, String riskLevel, List<String> quickActions) {
        this.botReply = botReply;
        this.riskLevel = riskLevel;
        this.quickActions = quickActions;
    }

    public String getBotReply() { return botReply; }
    public void setBotReply(String botReply) { this.botReply = botReply; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public List<String> getQuickActions() { return quickActions; }
    public void setQuickActions(List<String> quickActions) { this.quickActions = quickActions; }
}
