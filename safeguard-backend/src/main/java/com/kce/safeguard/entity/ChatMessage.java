package com.kce.safeguard.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String senderName;

    @Column(nullable = false)
    private String recipientName;

    @Lob
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String text;

    @Column(nullable = false)
    private LocalDateTime timeStamp;

    public ChatMessage() {
    }

    public ChatMessage(String senderName, String recipientName, String text, LocalDateTime timeStamp) {
        this.senderName = senderName;
        this.recipientName = recipientName;
        this.text = text;
        this.timeStamp = timeStamp;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public LocalDateTime getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(LocalDateTime timeStamp) {
        this.timeStamp = timeStamp;
    }
}
