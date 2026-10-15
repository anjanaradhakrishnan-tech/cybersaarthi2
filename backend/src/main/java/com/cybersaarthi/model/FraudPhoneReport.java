package com.cybersaarthi.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_phone_reports")
public class FraudPhoneReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String phoneNumber;

    private String countryCode;

    private int reportCount;

    private String scamTypes; // Comma separated: e.g. "BANKING, OTP, UPI"

    private LocalDateTime lastReported;

    private String source; // e.g. "CyberSaarthi Demonstration Database", "Community Report"

    private String verificationStatus; // UNREPORTED, COMMUNITY_REPORTED, VERIFIED_SAFE, VERIFIED_FRAUD

    @Column(length = 1000)
    private String notes;

    public FraudPhoneReport() {}

    public FraudPhoneReport(String phoneNumber, String countryCode, int reportCount, String scamTypes, String verificationStatus, String notes) {
        this.phoneNumber = phoneNumber;
        this.countryCode = countryCode;
        this.reportCount = reportCount;
        this.scamTypes = scamTypes;
        this.lastReported = LocalDateTime.now();
        this.source = "CyberSaarthi Demonstration Database";
        this.verificationStatus = verificationStatus;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getCountryCode() { return countryCode; }
    public void setCountryCode(String countryCode) { this.countryCode = countryCode; }

    public int getReportCount() { return reportCount; }
    public void setReportCount(int reportCount) { this.reportCount = reportCount; }

    public String getScamTypes() { return scamTypes; }
    public void setScamTypes(String scamTypes) { this.scamTypes = scamTypes; }

    public LocalDateTime getLastReported() { return lastReported; }
    public void setLastReported(LocalDateTime lastReported) { this.lastReported = lastReported; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
