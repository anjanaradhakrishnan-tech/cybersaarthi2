package com.cybersaarthi.model;

public class MessageAnalysisRequest {
    private String messageText;

    public MessageAnalysisRequest() {}

    public MessageAnalysisRequest(String messageText) {
        this.messageText = messageText;
    }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }
}
