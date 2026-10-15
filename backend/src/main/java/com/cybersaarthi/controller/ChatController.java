package com.cybersaarthi.controller;

import com.cybersaarthi.model.ChatRequest;
import com.cybersaarthi.model.ChatResponse;
import com.cybersaarthi.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(chatbotService.processChat(request));
    }
}
