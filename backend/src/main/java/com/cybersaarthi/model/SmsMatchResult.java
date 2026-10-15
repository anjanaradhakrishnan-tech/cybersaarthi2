package com.cybersaarthi.model;

import java.util.ArrayList;
import java.util.List;

public class SmsMatchResult {
    private boolean spam;
    private int riskScore; // 0 to 100
    private double confidencePercent;
    private double similarityScore; // 0.0 to 1.0 (spam similarity)
    private String matchedSnippet;
    private String matchedCategory; // "SPAM" or "HAM"
    private Long matchedRecordId;
    private List<String> matchedSpamKeywords;
    private List<String> detectedNumbers;
    private double hamSimilarity;
    private Long matchedHamId;
    private String matchedHamSnippet;
    private int corpusSize;
    private String rationale;

    public SmsMatchResult() {
        this.matchedSpamKeywords = new ArrayList<>();
        this.detectedNumbers = new ArrayList<>();
    }

    public SmsMatchResult(boolean spam, int riskScore, double confidencePercent, double similarityScore,
                          String matchedSnippet, String matchedCategory, Long matchedRecordId,
                          List<String> matchedSpamKeywords, String rationale) {
        this.spam = spam;
        this.riskScore = riskScore;
        this.confidencePercent = confidencePercent;
        this.similarityScore = similarityScore;
        this.matchedSnippet = matchedSnippet;
        this.matchedCategory = matchedCategory;
        this.matchedRecordId = matchedRecordId;
        this.matchedSpamKeywords = matchedSpamKeywords != null ? matchedSpamKeywords : new ArrayList<>();
        this.detectedNumbers = new ArrayList<>();
        this.rationale = rationale;
        this.corpusSize = 5572;
    }

    public boolean isSpam() { return spam; }
    public void setSpam(boolean spam) { this.spam = spam; }

    public int getRiskScore() { return riskScore; }
    public void setRiskScore(int riskScore) { this.riskScore = riskScore; }

    public double getConfidencePercent() { return confidencePercent; }
    public void setConfidencePercent(double confidencePercent) { this.confidencePercent = confidencePercent; }

    public double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(double similarityScore) { this.similarityScore = similarityScore; }

    public String getMatchedSnippet() { return matchedSnippet; }
    public void setMatchedSnippet(String matchedSnippet) { this.matchedSnippet = matchedSnippet; }

    public String getMatchedCategory() { return matchedCategory; }
    public void setMatchedCategory(String matchedCategory) { this.matchedCategory = matchedCategory; }

    public Long getMatchedRecordId() { return matchedRecordId; }
    public void setMatchedRecordId(Long matchedRecordId) { this.matchedRecordId = matchedRecordId; }

    public List<String> getMatchedSpamKeywords() { return matchedSpamKeywords; }
    public void setMatchedSpamKeywords(List<String> matchedSpamKeywords) { this.matchedSpamKeywords = matchedSpamKeywords; }

    public List<String> getDetectedNumbers() { return detectedNumbers; }
    public void setDetectedNumbers(List<String> detectedNumbers) { this.detectedNumbers = detectedNumbers; }

    public double getHamSimilarity() { return hamSimilarity; }
    public void setHamSimilarity(double hamSimilarity) { this.hamSimilarity = hamSimilarity; }

    public Long getMatchedHamId() { return matchedHamId; }
    public void setMatchedHamId(Long matchedHamId) { this.matchedHamId = matchedHamId; }

    public String getMatchedHamSnippet() { return matchedHamSnippet; }
    public void setMatchedHamSnippet(String matchedHamSnippet) { this.matchedHamSnippet = matchedHamSnippet; }

    public int getCorpusSize() { return corpusSize; }
    public void setCorpusSize(int corpusSize) { this.corpusSize = corpusSize; }

    public String getRationale() { return rationale; }
    public void setRationale(String rationale) { this.rationale = rationale; }
}
