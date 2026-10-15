package com.cybersaarthi.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sms_spam_records")
public class SmsSpamRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String label; // "spam" or "ham"

    @Column(name = "is_spam", nullable = false)
    private boolean isSpam;

    @Column(name = "message_text", nullable = false, columnDefinition = "TEXT")
    private String messageText;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public SmsSpamRecord() {}

    public SmsSpamRecord(String label, boolean isSpam, String messageText) {
        this.label = label;
        this.isSpam = isSpam;
        this.messageText = messageText;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public boolean isSpam() { return isSpam; }
    public void setSpam(boolean spam) { isSpam = spam; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
