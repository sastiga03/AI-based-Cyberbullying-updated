package com.kce.safeguard.controller;

import com.kce.safeguard.dto.CaseRequest;
import com.kce.safeguard.entity.CyberbullyingCase;
import com.kce.safeguard.service.CaseService;
import com.kce.safeguard.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseService caseService;

    @Autowired
    public CaseController(CaseService caseService) {
        this.caseService = caseService;
    }

    @GetMapping
    public ResponseEntity<List<CyberbullyingCase>> getCases(
            @RequestParam(value = "status", required = false, defaultValue = "All") String status) {
        return ResponseEntity.ok(caseService.getCases(status));
    }

    @PostMapping
    public ResponseEntity<CyberbullyingCase> reportIssue(@Valid @RequestBody CaseRequest request) {
        String studentName = SecurityUtils.getCurrentUserName();
        if (studentName == null) studentName = "Harshini Sasti";
        
        CyberbullyingCase c = caseService.reportIssue(request, studentName);
        return ResponseEntity.ok(c);
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('COUNSELOR', 'ADMIN')")
    public ResponseEntity<CyberbullyingCase> resolveCase(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String decisionText = body.get("decision");
        if (decisionText == null) decisionText = "Resolved";
        
        CyberbullyingCase resolved = caseService.resolveCase(id, decisionText);
        return ResponseEntity.ok(resolved);
    }
}
