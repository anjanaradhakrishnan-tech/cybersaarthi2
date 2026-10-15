package com.cybersaarthi.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "helpline_calls")
public class HelplineCall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "call_ref", unique = true, nullable = false)
    private String callRef;

    private String callerNumber;
    private String complaintType;
    private String riskLevel;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String status; // NEW, IN PROGRESS, ESCALATED, RESOLVED
    
    @Column(columnDefinition = "TEXT")
    private String operatorNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public HelplineCall() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = "NEW";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCallRef() { return callRef; }
    public void setCallRef(String callRef) { this.callRef = callRef; }

    public String getCallerNumber() { return callerNumber; }
    public void setCallerNumber(String callerNumber) { this.callerNumber = callerNumber; }

    public String getComplaintType() { return complaintType; }
    public void setComplaintType(String complaintType) { this.complaintType = complaintType; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOperatorNotes() { return operatorNotes; }
    public void setOperatorNotes(String operatorNotes) { this.operatorNotes = operatorNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
