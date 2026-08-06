package com.kce.safeguard.dto;

import com.kce.safeguard.entity.ChatMessage;
import java.time.format.DateTimeFormatter;

public class ChatMessageDto {

    private String sender;
    private String text;
    private String time; // e.g. "10:02 AM"

    public ChatMessageDto() {
    }

    public ChatMessageDto(ChatMessage chatMessage) {
        this.sender = chatMessage.getSenderName();
        this.text = chatMessage.getText();
        
        // Format LocalDateTime to readable "hh:mm a"
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        this.time = chatMessage.getTimeStamp().format(formatter);
    }

    public ChatMessageDto(String sender, String text, String time) {
        this.sender = sender;
        this.text = text;
        this.time = time;
    }

    // Getters and Setters
    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }
}
