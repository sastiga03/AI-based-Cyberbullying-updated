package com.mainservice.controller;

import com.mainservice.dto.ChatMessageDto;
import com.mainservice.entity.ChatMessage;
import com.mainservice.entity.CyberbullyingCase;
import com.mainservice.repository.ChatMessageRepository;
import com.mainservice.repository.CyberbullyingCaseRepository;
import com.mainservice.util.CyberbullyingAnalyzer;
import com.mainservice.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private CyberbullyingCaseRepository caseRepository;

    @Autowired
    private CyberbullyingAnalyzer cyberbullyingAnalyzer;

    @GetMapping
    public ResponseEntity<Map<String, List<ChatMessageDto>>> getChats() {
        String currentUserName = SecurityUtils.getCurrentUserName();
        if (currentUserName == null) currentUserName = "Harshini Sasti";
        
        List<ChatMessage> allMessages = chatMessageRepository.findAll();
        Map<String, List<ChatMessageDto>> chatMap = new HashMap<>();

        for (ChatMessage msg : allMessages) {
            String contactName = null;
            if (msg.getSenderName().equalsIgnoreCase(currentUserName)) {
                contactName = msg.getRecipientName();
            } else if (msg.getRecipientName().equalsIgnoreCase(currentUserName)) {
                contactName = msg.getSenderName();
            }

            if (contactName != null) {
                chatMap.computeIfAbsent(contactName, k -> new ArrayList<>())
                       .add(new ChatMessageDto(msg));
            }
        }
        return ResponseEntity.ok(chatMap);
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

        ChatMessage message = new ChatMessage();
        message.setSenderName(senderName);
        message.setRecipientName(recipientName);
        message.setText(text);
        message.setTimeStamp(LocalDateTime.now());

        ChatMessage saved = chatMessageRepository.save(message);

        CyberbullyingAnalyzer.AnalysisResult analysis = cyberbullyingAnalyzer.analyze(text);
        if ("Flagged".equalsIgnoreCase(analysis.getFlagStatus())) {
            CyberbullyingCase newCase = new CyberbullyingCase();
            newCase.setStudentName(senderName);
            newCase.setClassName("CSE A"); 
            newCase.setSeverity(analysis.getSeverityScore() + "%");
            newCase.setDate(LocalDate.now());
            newCase.setContent(text);
            newCase.setStatus("Pending");
            newCase.setDecision("");
            newCase.setResult(analysis.getResult());
            caseRepository.save(newCase);
        }

        return ResponseEntity.ok(new ChatMessageDto(saved));
    }
}
