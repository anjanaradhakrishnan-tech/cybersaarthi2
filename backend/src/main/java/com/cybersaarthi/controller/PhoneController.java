package com.cybersaarthi.controller;

import com.cybersaarthi.model.AnalysisResult;
import com.cybersaarthi.model.FraudPhoneReport;
import com.cybersaarthi.model.MediaAnalysisRequest;
import com.cybersaarthi.model.PhoneAnalysisRequest;
import com.cybersaarthi.service.FraudIntelligenceService;
import com.cybersaarthi.service.MediaAnalysisService;
import com.cybersaarthi.service.PhoneAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@CrossOrigin(origins = "*")
public class PhoneController {

    @Autowired
    private FraudIntelligenceService fraudIntelligenceService;

    @Autowired
    private PhoneAnalysisService phoneAnalysisService;

    @Autowired
    private MediaAnalysisService mediaAnalysisService;

    @GetMapping("/api/phone/check/{number}")
    public ResponseEntity<Map<String, Object>> checkPhone(@PathVariable String number) {
        Optional<FraudPhoneReport> reportOpt = fraudIntelligenceService.checkPhoneNumber(number);
        Map<String, Object> response = new LinkedHashMap<>();

        if (reportOpt.isPresent()) {
            FraudPhoneReport r = reportOpt.get();
            response.put("phoneNumber", r.getPhoneNumber());
            response.put("reportCount", r.getReportCount());
            response.put("scamTypes", r.getScamTypes());
            response.put("verificationStatus", r.getVerificationStatus());
            response.put("source", r.getSource());
            response.put("found", true);
        } else {
            response.put("phoneNumber", number);
            response.put("reportCount", 0);
            response.put("scamTypes", "NONE");
            response.put("verificationStatus", "UNREPORTED");
            response.put("source", "CyberSaarthi Demonstration Database");
            response.put("found", false);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/phone/analyze")
    public ResponseEntity<AnalysisResult> analyzePhonePost(@RequestBody PhoneAnalysisRequest request) {
        return ResponseEntity.ok(phoneAnalysisService.analyzePhone(request.getPhoneNumber(), request.getCallActions()));
    }

    @PostMapping("/api/report/phone")
    public ResponseEntity<Map<String, Object>> reportPhone(@RequestBody Map<String, String> body) {
        String phone = body.get("phoneNumber");
        String scamType = body.get("scamType");
        String desc = body.get("description");
        String evidence = body.get("evidence");

        FraudPhoneReport report = fraudIntelligenceService.registerOrIncrementReport(phone, scamType, desc, evidence);

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Community Report Submitted. Reports are reviewed before being treated as verified evidence.");
        res.put("report", report);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/api/media/analyze")
    public ResponseEntity<AnalysisResult> analyzeMediaPost(@RequestBody MediaAnalysisRequest request) {
        return ResponseEntity.ok(mediaAnalysisService.analyzeMedia(request.getMediaType(), request.getMediaName(), request.getFileSize(), request.getDuration()));
    }

    @PostMapping("/api/media/upload")
    public ResponseEntity<Map<String, Object>> uploadMediaPost(@RequestBody MediaAnalysisRequest request) {
        AnalysisResult result = mediaAnalysisService.analyzeMedia(request.getMediaType(), request.getMediaName(), request.getFileSize(), request.getDuration());
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "UPLOADED_AND_ANALYZED");
        res.put("privacyNotice", "Your file was processed strictly in temporary memory for heuristic analysis.");
        res.put("result", result);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/api/reports")
    public ResponseEntity<List<FraudPhoneReport>> getReports() {
        return ResponseEntity.ok(fraudIntelligenceService.getReports());
    }

    @PostMapping("/api/demo/seed")
    public ResponseEntity<Map<String, String>> seedDemoData() {
        fraudIntelligenceService.seedDemoData();
        return ResponseEntity.ok(Map.of("message", "Demonstration Database reset and pre-seeded with test records."));
    }
}
