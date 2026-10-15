package com.cybersaarthi.service;

import com.cybersaarthi.model.Report;
import com.cybersaarthi.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class ReportService {

    @Autowired(required = false)
    private ReportRepository reportRepository;

    @Autowired(required = false)
    private FraudIntelligenceService fraudIntelligenceService;

    public Report createReport(Report report) {
        String refId = "CYB-2026-" + String.format("%06d", new Random().nextInt(900000) + 100000);
        report.setReferenceId(refId);

        if (report.getSuspiciousNumber() != null && !report.getSuspiciousNumber().trim().isEmpty()) {
            if (fraudIntelligenceService != null) {
                fraudIntelligenceService.registerOrIncrementReport(
                        report.getSuspiciousNumber().trim(),
                        report.getScamType() != null ? report.getScamType() : "FRAUD",
                        report.getDescription(),
                        report.getEvidencePath()
                );
            } else {
                PhoneAnalysisService.registerScamNumber(report.getSuspiciousNumber());
            }
        }

        if (reportRepository != null) {
            return reportRepository.save(report);
        }
        return report;
    }

    public List<Report> getAllReports() {
        if (reportRepository != null) {
            return reportRepository.findAll();
        }
        return List.of();
    }
}
