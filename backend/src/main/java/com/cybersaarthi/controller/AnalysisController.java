package com.cybersaarthi.controller;

import com.cybersaarthi.model.*;
import com.cybersaarthi.service.CyberAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analyze")
@CrossOrigin(origins = "*")
public class AnalysisController {

    @Autowired
    private CyberAnalysisService cyberAnalysisService;

    @PostMapping("/message")
    public ResponseEntity<AnalysisResult> analyzeMessage(@RequestBody MessageAnalysisRequest request) {
        return ResponseEntity.ok(cyberAnalysisService.analyzeMessage(request));
    }

    @PostMapping("/link")
    public ResponseEntity<AnalysisResult> analyzeLink(@RequestBody LinkAnalysisRequest request) {
        return ResponseEntity.ok(cyberAnalysisService.analyzeLink(request));
    }

    @PostMapping("/phone")
    public ResponseEntity<AnalysisResult> analyzePhone(@RequestBody PhoneAnalysisRequest request) {
        return ResponseEntity.ok(cyberAnalysisService.analyzePhone(request));
    }

    @PostMapping("/media")
    public ResponseEntity<AnalysisResult> analyzeMedia(@RequestBody MediaAnalysisRequest request) {
        return ResponseEntity.ok(cyberAnalysisService.analyzeMedia(request));
    }
}
