package com.kce.safeguard.controller;

import com.kce.safeguard.dto.ChatMessageDto;
import com.kce.safeguard.service.ChatMessageService;
import com.kce.safeguard.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatMessageService chatMessageService;

    @Autowired
    public ChatController(ChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    @GetMapping
    public ResponseEntity<Map<String, List<ChatMessageDto>>> getChats() {
        String currentUserName = SecurityUtils.getCurrentUserName();
        if (currentUserName == null) currentUserName = "Harshini Sasti";
        
        Map<String, List<ChatMessageDto>> conversations = chatMessageService.getChatsForUser(currentUserName);
        return ResponseEntity.ok(conversations);
    }

    @PostMapping
    public ResponseEntity<ChatMessageDto> sendMessage(@RequestBody Map<String, String> body) {
        String senderName = SecurityUtils.getCurrentUserName();
        if (senderName == null) senderName = "Harshini Sasti";
        
        String recipientName = body.get("recipient");
        String text = body.get("text");
        
        if (recipientName == null || text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        ChatMessageDto saved = chatMessageService.saveMessage(senderName, recipientName, text);
        return ResponseEntity.ok(saved);
    }
}
