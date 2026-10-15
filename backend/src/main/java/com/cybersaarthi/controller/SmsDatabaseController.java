package com.cybersaarthi.controller;

import com.cybersaarthi.model.SmsMatchResult;
import com.cybersaarthi.model.SmsSpamRecord;
import com.cybersaarthi.service.SmsSpamDatabaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sms-database")
@CrossOrigin(origins = "*")
public class SmsDatabaseController {

    @Autowired
    private SmsSpamDatabaseService smsSpamDatabaseService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(smsSpamDatabaseService.getDatabaseStats());
    }

    @GetMapping("/samples")
    public ResponseEntity<List<SmsSpamRecord>> getSamples(@RequestParam(defaultValue = "10") int count) {
        return ResponseEntity.ok(smsSpamDatabaseService.getSampleRecords(count));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SmsSpamRecord>> searchRecords(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(required = false, defaultValue = "all") String type,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(smsSpamDatabaseService.searchRecords(query, type, limit));
    }

    @PostMapping("/check")
    public ResponseEntity<SmsMatchResult> checkSms(@RequestBody Map<String, String> payload) {
        String messageText = payload.getOrDefault("messageText", "");
        return ResponseEntity.ok(smsSpamDatabaseService.checkSms(messageText));
    }
}
