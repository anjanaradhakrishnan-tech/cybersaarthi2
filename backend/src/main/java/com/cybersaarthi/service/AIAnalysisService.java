package com.cybersaarthi.service;

import com.cybersaarthi.model.AnalysisResult;

public interface AIAnalysisService {
    AnalysisResult analyzeImage(String mediaName, String mediaType, long fileSize);
    AnalysisResult analyzeVideo(String mediaName, String mediaType, long fileSize, double duration);
}
