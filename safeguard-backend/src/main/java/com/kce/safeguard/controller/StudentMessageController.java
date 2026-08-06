package com.kce.safeguard.controller;

import com.kce.safeguard.entity.StudentMessage;
import com.kce.safeguard.entity.CyberbullyingCase;
import com.kce.safeguard.repository.StudentMessageRepository;
import com.kce.safeguard.service.CaseService;
import com.kce.safeguard.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/student-messages")
public class StudentMessageController {

    private final StudentMessageRepository studentMessageRepository;
    private final CaseService caseService;

    @Autowired
    public StudentMessageController(StudentMessageRepository studentMessageRepository, CaseService caseService) {
        this.studentMessageRepository = studentMessageRepository;
        this.caseService = caseService;
    }

    @GetMapping
    public ResponseEntity<List<StudentMessage>> getStudentMessages() {
        return ResponseEntity.ok(studentMessageRepository.findAllByOrderByIdDesc());
    }

    @PostMapping
    public ResponseEntity<StudentMessage> createStudentMessage(@RequestBody StudentMessage message) {
        if (message.getDate() == null) {
            message.setDate(java.time.LocalDate.now());
        }
        return ResponseEntity.ok(studentMessageRepository.save(message));
    }

    @PostMapping("/{id}/forward")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<CyberbullyingCase> forwardMessage(@PathVariable Long id) {
        StudentMessage msg = studentMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentMessage", "id", id));
        CyberbullyingCase newCase = caseService.forwardMessage(msg);
        return ResponseEntity.ok(newCase);
    }
}
