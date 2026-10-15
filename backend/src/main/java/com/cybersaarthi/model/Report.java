package com.cybersaarthi.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_id", unique = true, nullable = false)
    private String referenceId;

    private String reporterName;
    private String reporterPhone;
    private String scamType;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String suspiciousNumber;
    private String suspiciousUrl;
    private Double amountLost;
    private String evidencePath;
    private String riskLevel;
    private String status;

    private LocalDateTime createdAt;

    public Report() {
        this.createdAt = LocalDateTime.now();
        this.status = "NEW";
        this.riskLevel = "HIGH RISK";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getReporterPhone() { return reporterPhone; }
    public void setReporterPhone(String reporterPhone) { this.reporterPhone = reporterPhone; }

    public String getScamType() { return scamType; }
    public void setScamType(String scamType) { this.scamType = scamType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSuspiciousNumber() { return suspiciousNumber; }
    public void setSuspiciousNumber(String suspiciousNumber) { this.suspiciousNumber = suspiciousNumber; }

    public String getSuspiciousUrl() { return suspiciousUrl; }
    public void setSuspiciousUrl(String suspiciousUrl) { this.suspiciousUrl = suspiciousUrl; }

    public Double getAmountLost() { return amountLost; }
    public void setAmountLost(Double amountLost) { this.amountLost = amountLost; }

    public String getEvidencePath() { return evidencePath; }
    public void setEvidencePath(String evidencePath) { this.evidencePath = evidencePath; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
