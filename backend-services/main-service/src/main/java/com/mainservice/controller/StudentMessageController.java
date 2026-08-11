package com.mainservice.controller;

import com.mainservice.entity.StudentMessage;
import com.mainservice.entity.CyberbullyingCase;
import com.mainservice.repository.StudentMessageRepository;
import com.mainservice.repository.CyberbullyingCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/student-messages")
public class StudentMessageController {

    @Autowired
    private StudentMessageRepository studentMessageRepository;

    @Autowired
    private CyberbullyingCaseRepository caseRepository;

    @GetMapping
    public ResponseEntity<List<StudentMessage>> getStudentMessages() {
        return ResponseEntity.ok(studentMessageRepository.findAllByOrderByIdDesc());
    }

    @PostMapping
    public ResponseEntity<StudentMessage> createStudentMessage(@RequestBody StudentMessage message) {
        if (message.getDate() == null) {
            message.setDate(LocalDate.now());
        }
        return ResponseEntity.ok(studentMessageRepository.save(message));
    }

    @PostMapping("/{id}/forward")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<CyberbullyingCase> forwardMessage(@PathVariable String id) {
        StudentMessage msg = studentMessageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "StudentMessage not found with id: " + id));

        CyberbullyingCase newCase = new CyberbullyingCase();
        newCase.setStudentName(msg.getStudentName());
        newCase.setClassName("CSE A"); 
        newCase.setSeverity("80%"); 
        newCase.setDate(msg.getDate() != null ? msg.getDate() : LocalDate.now());
        newCase.setContent(msg.getContent());
        newCase.setStatus("Pending");
        newCase.setDecision("");
        newCase.setResult("Forwarded message inquiry review");

        CyberbullyingCase saved = caseRepository.save(newCase);
        return ResponseEntity.ok(saved);
    }
}
