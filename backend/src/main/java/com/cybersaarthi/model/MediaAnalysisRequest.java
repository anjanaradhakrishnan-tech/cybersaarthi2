package com.cybersaarthi.model;

public class MediaAnalysisRequest {
    private String mediaType; // IMAGE or VIDEO
    private String mediaName;
    private String mediaData; // base64 or URL
    private long fileSize;
    private double duration;

    public MediaAnalysisRequest() {}

    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }

    public String getMediaName() { return mediaName; }
    public void setMediaName(String mediaName) { this.mediaName = mediaName; }

    public String getMediaData() { return mediaData; }
    public void setMediaData(String mediaData) { this.mediaData = mediaData; }

    public long getFileSize() { return fileSize; }
    public void setFileSize(long fileSize) { this.fileSize = fileSize; }

    public double getDuration() { return duration; }
    public void setDuration(double duration) { this.duration = duration; }
}
