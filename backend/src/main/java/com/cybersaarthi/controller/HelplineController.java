package com.cybersaarthi.controller;

import com.cybersaarthi.model.HelplineCall;
import com.cybersaarthi.service.HelplineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/helpline")
@CrossOrigin(origins = "*")
public class HelplineController {

    @Autowired
    private HelplineService helplineService;

    @PostMapping("/call")
    public ResponseEntity<HelplineCall> registerCall(@RequestBody HelplineCall call) {
        return ResponseEntity.ok(helplineService.registerCall(call));
    }

    @GetMapping("/calls")
    public ResponseEntity<List<HelplineCall>> getAllCalls() {
        return ResponseEntity.ok(helplineService.getAllCalls());
    }

    @PutMapping("/call/{id}/status")
    public ResponseEntity<HelplineCall> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String notes = body.get("operatorNotes");
        HelplineCall updated = helplineService.updateStatus(id, status, notes);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }
}
