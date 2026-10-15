package com.cybersaarthi.model;

public class LinkAnalysisRequest {
    private String url;

    public LinkAnalysisRequest() {}

    public LinkAnalysisRequest(String url) {
        this.url = url;
    }

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
