package com.cybersaarthi.model;

import java.util.List;

public class AnalysisResult {
    private String category;
    private int riskScore; // 0 to 100
    private String riskLevel; // LOW RISK, SUSPICIOUS, HIGH RISK
    private String label; // "Likely Safe", "Proceed With Care", "Take Action Immediately"
    private List<String> threatsDetected;
    private List<String> reasons;
    private String recommendedAction;
    private String disclaimer;
    private SmsMatchResult databaseMatch;

    public AnalysisResult() {}

    public AnalysisResult(String category, int riskScore, String riskLevel, String label, 
                          List<String> threatsDetected, List<String> reasons, 
                          String recommendedAction, String disclaimer) {
        this.category = category;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.label = label;
        this.threatsDetected = threatsDetected;
        this.reasons = reasons;
        this.recommendedAction = recommendedAction;
        this.disclaimer = disclaimer;
    }

    public AnalysisResult(String category, int riskScore, String riskLevel, String label, 
                          List<String> threatsDetected, List<String> reasons, 
                          String recommendedAction, String disclaimer, SmsMatchResult databaseMatch) {
        this(category, riskScore, riskLevel, label, threatsDetected, reasons, recommendedAction, disclaimer);
        this.databaseMatch = databaseMatch;
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public List<String> getThreatsDetected() { return threatsDetected; }
    public void setThreatsDetected(List<String> threatsDetected) { this.threatsDetected = threatsDetected; }

    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }

    public SmsMatchResult getDatabaseMatch() { return databaseMatch; }
    public void setDatabaseMatch(SmsMatchResult databaseMatch) { this.databaseMatch = databaseMatch; }
}
