package com.cybersaarthi.service;

import com.cybersaarthi.model.FraudPhoneReport;
import java.util.List;
import java.util.Optional;

public interface FraudIntelligenceService {
    Optional<FraudPhoneReport> checkPhoneNumber(String phoneNumber);
    boolean checkUrl(String url);
    List<FraudPhoneReport> getReports();
    FraudPhoneReport registerOrIncrementReport(String phoneNumber, String scamType, String description, String evidence);
    void seedDemoData();
}
