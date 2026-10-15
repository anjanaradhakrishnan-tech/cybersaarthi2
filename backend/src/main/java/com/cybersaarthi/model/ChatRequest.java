package com.cybersaarthi.model;

public class ChatRequest {
    private String sessionId;
    private String userMessage;
    private String language; // en, ml, hi

    public ChatRequest() {}

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getUserMessage() { return userMessage; }
    public void setUserMessage(String userMessage) { this.userMessage = userMessage; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
