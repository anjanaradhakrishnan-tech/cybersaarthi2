package com.cybersaarthi.model;

import java.util.ArrayList;
import java.util.List;

public class PhoneAnalysisRequest {
    private String phoneNumber;
    private List<String> callActions = new ArrayList<>();

    public PhoneAnalysisRequest() {}

    public PhoneAnalysisRequest(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public PhoneAnalysisRequest(String phoneNumber, List<String> callActions) {
        this.phoneNumber = phoneNumber;
        this.callActions = callActions != null ? callActions : new ArrayList<>();
    }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public List<String> getCallActions() { return callActions; }
    public void setCallActions(List<String> callActions) { this.callActions = callActions != null ? callActions : new ArrayList<>(); }
}
