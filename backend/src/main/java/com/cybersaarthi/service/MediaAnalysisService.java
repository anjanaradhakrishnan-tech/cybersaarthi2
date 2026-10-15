package com.cybersaarthi.service;

import com.cybersaarthi.model.AnalysisResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MediaAnalysisService {

    @Autowired
    private AIAnalysisService aiAnalysisService;

    public AnalysisResult analyzeMedia(String mediaType, String mediaName, long fileSize, double duration) {
        if (aiAnalysisService != null) {
            if ("VIDEO".equalsIgnoreCase(mediaType) || (mediaName != null && (mediaName.endsWith(".mp4") || mediaName.endsWith(".mov") || mediaName.endsWith(".webm")))) {
                return aiAnalysisService.analyzeVideo(mediaName, mediaType, fileSize, duration);
            } else {
                return aiAnalysisService.analyzeImage(mediaName, mediaType, fileSize);
            }
        }

        // Fallback if AI service un-injected
        return new AnalysisResult("MEDIA", 15, "LOW SUSPICION", "No Strong Synthetic Artifacts",
                java.util.List.of("Prototype Heuristic Analysis"),
                java.util.List.of("This assessment looks for selected technical indicators. It is not proof that media is AI-generated or authentic."),
                "Do not use this image/video alone as evidence of identity or authenticity.",
                "⚠ This is an experimental assessment and is not proof that the media is AI-generated.");
    }
}
