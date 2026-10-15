package com.cybersaarthi.controller;

import com.cybersaarthi.service.EmergencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class EmergencyController {

    @Autowired
    private EmergencyService emergencyService;

    @GetMapping("/api/help")
    public ResponseEntity<Map<String, Object>> getHelp() {
        return ResponseEntity.ok(emergencyService.getEmergencyGuidance());
    }

    @GetMapping("/api/emergency")
    public ResponseEntity<Map<String, Object>> getEmergency() {
        return ResponseEntity.ok(emergencyService.getEmergencyGuidance());
    }
}
