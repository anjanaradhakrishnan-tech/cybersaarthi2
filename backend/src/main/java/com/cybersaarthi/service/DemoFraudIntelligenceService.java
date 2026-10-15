package com.cybersaarthi.service;

import com.cybersaarthi.model.FraudPhoneReport;
import com.cybersaarthi.repository.FraudPhoneReportRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DemoFraudIntelligenceService implements FraudIntelligenceService {

    @Autowired(required = false)
    private FraudPhoneReportRepository repository;

    // In-memory fallback map if JPA repository is unavailable
    private final Map<String, FraudPhoneReport> inMemoryDb = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        seedDemoData();
    }

    @Override
    public void seedDemoData() {
        List<FraudPhoneReport> demoRecords = List.of(
            new FraudPhoneReport("+91 9000000001", "+91", 0, "NONE", "UNREPORTED", "Demo number with 0 community reports."),
            new FraudPhoneReport("+91 9000000002", "+91", 3, "BANKING, OTP", "COMMUNITY_REPORTED", "Demo number with 3 community reports."),
            new FraudPhoneReport("+91 9000000003", "+91", 7, "KYC, BANKING", "COMMUNITY_REPORTED", "Demo number with 7 community reports."),
            new FraudPhoneReport("+91 9000000004", "+91", 12, "UPI, PAYMENT", "COMMUNITY_REPORTED", "Demo number with 12 community reports.")
        );

        for (FraudPhoneReport report : demoRecords) {
            String norm = normalize(report.getPhoneNumber());
            inMemoryDb.put(norm, report);
            if (repository != null) {
                try {
                    Optional<FraudPhoneReport> existing = repository.findByPhoneNumber(report.getPhoneNumber());
                    if (existing.isEmpty()) {
                        repository.save(report);
                    }
                } catch (Exception e) {
                    // Fallback to in-memory DB
                }
            }
        }
    }

    @Override
    public Optional<FraudPhoneReport> checkPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) return Optional.empty();
        String norm = normalize(phoneNumber);

        if (repository != null) {
            try {
                List<FraudPhoneReport> all = repository.findAll();
                for (FraudPhoneReport r : all) {
                    if (normalize(r.getPhoneNumber()).equals(norm)) {
                        return Optional.of(r);
                    }
                }
            } catch (Exception ignored) {}
        }

        return Optional.ofNullable(inMemoryDb.get(norm));
    }

    @Override
    public boolean checkUrl(String url) {
        if (url == null) return false;
        String u = url.toLowerCase();
        return u.contains("phish") || u.contains("fake") || u.contains(".xyz") || u.startsWith("http://");
    }

    @Override
    public List<FraudPhoneReport> getReports() {
        if (repository != null) {
            try {
                return repository.findAll();
            } catch (Exception ignored) {}
        }
        return new ArrayList<>(inMemoryDb.values());
    }

    @Override
    public FraudPhoneReport registerOrIncrementReport(String phoneNumber, String scamType, String description, String evidence) {
        String norm = normalize(phoneNumber);
        Optional<FraudPhoneReport> existingOpt = checkPhoneNumber(phoneNumber);

        FraudPhoneReport report;
        if (existingOpt.isPresent()) {
            report = existingOpt.get();
            report.setReportCount(report.getReportCount() + 1);
            if (scamType != null && !scamType.trim().isEmpty() && !report.getScamTypes().contains(scamType)) {
                report.setScamTypes(report.getScamTypes().equals("NONE") ? scamType : report.getScamTypes() + ", " + scamType);
            }
            report.setLastReported(LocalDateTime.now());
            report.setVerificationStatus("COMMUNITY_REPORTED");
        } else {
            report = new FraudPhoneReport(
                phoneNumber.trim(),
                extractCountryCode(phoneNumber),
                1,
                (scamType != null && !scamType.trim().isEmpty()) ? scamType : "SUSPICIOUS_CALL",
                "COMMUNITY_REPORTED",
                description != null ? description : "Community reported incident."
            );
        }

        inMemoryDb.put(norm, report);
        if (repository != null) {
            try {
                report = repository.save(report);
            } catch (Exception ignored) {}
        }

        return report;
    }

    private String normalize(String num) {
        if (num == null) return "";
        return num.replaceAll("[^0-9]", "");
    }

    private String extractCountryCode(String num) {
        if (num != null && num.trim().startsWith("+")) {
            String parts[] = num.trim().split(" ");
            if (parts.length > 0) return parts[0];
        }
        return "+91";
    }
}
