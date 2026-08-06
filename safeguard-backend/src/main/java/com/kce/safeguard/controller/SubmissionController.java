package com.kce.safeguard.controller;

import com.kce.safeguard.dto.SubmissionRequest;
import com.kce.safeguard.entity.Submission;
import com.kce.safeguard.entity.CyberbullyingCase;
import com.kce.safeguard.service.SubmissionService;
import com.kce.safeguard.service.CaseService;
import com.kce.safeguard.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final CaseService caseService;

    @Autowired
    public SubmissionController(SubmissionService submissionService, CaseService caseService) {
        this.submissionService = submissionService;
        this.caseService = caseService;
    }

    @GetMapping
    public ResponseEntity<List<Submission>> getSubmissions(
            @RequestParam(value = "all", required = false, defaultValue = "false") boolean all,
            @RequestParam(value = "filter", required = false) String filter) {
        
        if (all) {
            // Teachers, counselors, admin can fetch all submissions
            return ResponseEntity.ok(submissionService.getAllSubmissions(filter));
        } else {
            // Student fetches only their own submissions
            String currentStudent = SecurityUtils.getCurrentUserName();
            if (currentStudent == null) currentStudent = "Harshini Sasti";
            return ResponseEntity.ok(submissionService.getSubmissionsByStudent(currentStudent));
        }
    }

    @PostMapping
    public ResponseEntity<Submission> submitTask(@Valid @RequestBody SubmissionRequest request) {
        String studentName = SecurityUtils.getCurrentUserName();
        if (studentName == null) studentName = "Harshini Sasti";
        
        Submission submission = submissionService.submitTask(request, studentName);
        return ResponseEntity.ok(submission);
    }

    @PostMapping("/{id}/forward")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<CyberbullyingCase> forwardSubmission(@PathVariable Long id) {
        Submission submission = submissionService.getSubmissionById(id);
        CyberbullyingCase newCase = caseService.forwardSubmission(submission);
        return ResponseEntity.ok(newCase);
    }
}
