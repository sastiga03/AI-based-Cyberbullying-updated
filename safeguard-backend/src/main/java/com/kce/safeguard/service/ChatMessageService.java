package com.kce.safeguard.service;

import com.kce.safeguard.dto.ChatMessageDto;
import com.kce.safeguard.entity.ChatMessage;
import com.kce.safeguard.entity.CyberbullyingCase;
import com.kce.safeguard.repository.ChatMessageRepository;
import com.kce.safeguard.repository.CyberbullyingCaseRepository;
import com.kce.safeguard.util.CyberbullyingAnalyzer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final CyberbullyingCaseRepository caseRepository;
    private final CyberbullyingAnalyzer cyberbullyingAnalyzer;

    @Autowired
    public ChatMessageService(ChatMessageRepository chatMessageRepository,
                              CyberbullyingCaseRepository caseRepository,
                              CyberbullyingAnalyzer cyberbullyingAnalyzer) {
        this.chatMessageRepository = chatMessageRepository;
        this.caseRepository = caseRepository;
        this.cyberbullyingAnalyzer = cyberbullyingAnalyzer;
    }

    public Map<String, List<ChatMessageDto>> getChatsForUser(String currentUserName) {
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

        // Sort each contact's message list by timestamp is not needed since findAll is ordered by default or we can sort them
        return chatMap;
    }

    @Transactional
    public ChatMessageDto saveMessage(String senderName, String recipientName, String text) {
        ChatMessage message = new ChatMessage();
        message.setSenderName(senderName);
        message.setRecipientName(recipientName);
        message.setText(text);
        message.setTimeStamp(LocalDateTime.now());

        ChatMessage saved = chatMessageRepository.save(message);

        // Run cyberbullying analysis on student-to-student messages
        CyberbullyingAnalyzer.AnalysisResult analysis = cyberbullyingAnalyzer.analyze(text);
        if ("Flagged".equalsIgnoreCase(analysis.getFlagStatus())) {
            // Automatically log a case for the counselor
            CyberbullyingCase newCase = new CyberbullyingCase();
            newCase.setStudentName(senderName);
            newCase.setClassName("CSE A"); // default
            newCase.setSeverity(analysis.getSeverityScore() + "%");
            newCase.setDate(LocalDate.now());
            newCase.setContent("Chat Message to " + recipientName + ": " + text);
            newCase.setStatus("Pending");
            newCase.setDecision("");
            newCase.setResult(analysis.getResult());
            caseRepository.save(newCase);
        }

        return new ChatMessageDto(saved);
    }
}
