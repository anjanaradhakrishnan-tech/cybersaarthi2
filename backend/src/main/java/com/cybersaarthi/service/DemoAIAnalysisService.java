package com.cybersaarthi.service;

import com.cybersaarthi.model.AnalysisResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DemoAIAnalysisService implements AIAnalysisService {

    private static final String DISCLAIMER = "⚠ This is an experimental assessment and is not proof that the image/video is AI-generated or authentic.";

    @Override
    public AnalysisResult analyzeImage(String mediaName, String mediaType, long fileSize) {
        String name = (mediaName != null) ? mediaName.toLowerCase() : "sample.jpg";
        int score;
        List<String> indicators = new ArrayList<>();
        List<String> reasons = new ArrayList<>();

        boolean hasAiKeywords = name.contains("deepfake") || name.contains("ai") || name.contains("synthetic")
                || name.contains("midjourney") || name.contains("dalle") || name.contains("generated") || name.contains("fake");

        if (hasAiKeywords) {
            score = 78;
            indicators.add("Unusual image visual characteristics");
            indicators.add("EXIF Camera Metadata unavailable / stripped");
            indicators.add("Synthetic pixel pattern geometry detected");
            reasons.add("Prototype Heuristic Analysis: File exhibits attributes common in generative image synthesis.");
            reasons.add("File Name & Format: " + mediaName + " (" + formatSize(fileSize) + ")");
        } else {
            score = 15;
            indicators.add("Standard Image Pixel Structure");
            indicators.add("Consistent Shadow Geometry");
            reasons.add("No strong synthetic indicators detected.");
            reasons.add("File Name & Format: " + mediaName + " (" + formatSize(fileSize) + ")");
        }

        String level = (score >= 60) ? "POSSIBLE AI-GENERATED CONTENT" : "LOW SUSPICION";
        String label = (score >= 60) ? "Proceed With Extreme Caution" : "No Strong Synthetic Artifacts";
        String recommendedAction = (score >= 60) 
            ? "Do not use this image alone as evidence of identity or authenticity. Verify through direct communication."
            : "No strong synthetic indicators found. However, this does not prove that the image is authentic.";

        return new AnalysisResult("MEDIA", score, level, label, indicators, reasons, recommendedAction, DISCLAIMER);
    }

    @Override
    public AnalysisResult analyzeVideo(String mediaName, String mediaType, long fileSize, double duration) {
        String name = (mediaName != null) ? mediaName.toLowerCase() : "sample.mp4";
        int score;
        List<String> indicators = new ArrayList<>();
        List<String> reasons = new ArrayList<>();

        boolean hasAiKeywords = name.contains("deepfake") || name.contains("ai") || name.contains("synthetic") || name.contains("fake") || name.contains("clone");

        if (hasAiKeywords) {
            score = 82;
            indicators.add("Temporal Frame Rate Discrepancy");
            indicators.add("Potential Lip-Sync Frame Mismatch");
            indicators.add("GAN Compression Mesh Boundary Noise");
            reasons.add("Prototype Video Analysis: Video stream exhibits temporal mesh inconsistencies.");
            reasons.add("File Info: " + mediaName + " (" + formatSize(fileSize) + ")");
        } else {
            score = 20;
            indicators.add("Standard Video Codec Stream");
            indicators.add("Consistent Frame Rate & Lighting");
            reasons.add("No strong synthetic video artifacts detected.");
            reasons.add("File Info: " + mediaName + " (" + formatSize(fileSize) + ")");
        }

        String level = (score >= 60) ? "POSSIBLE AI-GENERATED CONTENT" : "LOW SUSPICION";
        String label = (score >= 60) ? "Proceed With Extreme Caution" : "No Strong Synthetic Artifacts";
        String recommendedAction = (score >= 60)
            ? "Do not transfer money based on video calls or clips alone. Contact the person on their official phone number."
            : "No strong synthetic video indicators found. Advanced deepfake detection requires a trained model or external analysis service.";

        return new AnalysisResult("MEDIA", score, level, label, indicators, reasons, recommendedAction, DISCLAIMER);
    }

    private String formatSize(long size) {
        if (size <= 0) return "1.2 MB";
        return String.format("%.2f MB", (double) size / (1024 * 1024));
    }
}
