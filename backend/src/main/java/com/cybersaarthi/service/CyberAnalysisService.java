package com.cybersaarthi.service;

import com.cybersaarthi.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CyberAnalysisService {

    @Autowired
    private MessageAnalysisService messageAnalysisService;

    @Autowired
    private LinkAnalysisService linkAnalysisService;

    @Autowired
    private PhoneAnalysisService phoneAnalysisService;

    @Autowired
    private MediaAnalysisService mediaAnalysisService;

    public AnalysisResult analyzeMessage(MessageAnalysisRequest request) {
        return messageAnalysisService.analyzeMessage(request.getMessageText());
    }

    public AnalysisResult analyzeLink(LinkAnalysisRequest request) {
        return linkAnalysisService.analyzeLink(request.getUrl());
    }

    public AnalysisResult analyzePhone(PhoneAnalysisRequest request) {
        return phoneAnalysisService.analyzePhone(request.getPhoneNumber(), request.getCallActions());
    }

    public AnalysisResult analyzeMedia(MediaAnalysisRequest request) {
        return mediaAnalysisService.analyzeMedia(request.getMediaType(), request.getMediaName(), request.getFileSize(), request.getDuration());
    }
}
