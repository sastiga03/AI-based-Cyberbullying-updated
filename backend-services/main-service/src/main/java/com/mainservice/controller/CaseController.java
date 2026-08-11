package com.mainservice.controller;

import com.mainservice.dto.CaseRequest;
import com.mainservice.entity.CyberbullyingCase;
import com.mainservice.repository.CyberbullyingCaseRepository;
import com.mainservice.util.CyberbullyingAnalyzer;
import com.mainservice.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    @Autowired
    private CyberbullyingCaseRepository caseRepository;

    @Autowired
    private CyberbullyingAnalyzer cyberbullyingAnalyzer;

    @GetMapping
    public ResponseEntity<List<CyberbullyingCase>> getCases(
            @RequestParam(value = "status", required = false, defaultValue = "All") String status) {
        if (status == null || status.equalsIgnoreCase("All")) {
            return ResponseEntity.ok(caseRepository.findAll());
        }
        return ResponseEntity.ok(caseRepository.findByStatus(status));
    }

    @PostMapping
    public ResponseEntity<CyberbullyingCase> reportIssue(@Valid @RequestBody CaseRequest request) {
        String studentName = SecurityUtils.getCurrentUserName();
        if (studentName == null) studentName = "Harshini Sasti";
        
        CyberbullyingCase c = new CyberbullyingCase();
        c.setStudentName(studentName);
        c.setClassName("CSE A"); 
        c.setDate(LocalDate.now());
        c.setContent(request.getDesc());
        c.setStatus("Pending");
        c.setDecision("");

        CyberbullyingAnalyzer.AnalysisResult analysis = cyberbullyingAnalyzer.analyze(request.getDesc());
        c.setSeverity(analysis.getSeverityScore() + "%");
        c.setResult(analysis.getResult());

        CyberbullyingCase saved = caseRepository.save(c);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('COUNSELOR', 'ADMIN')")
    public ResponseEntity<CyberbullyingCase> resolveCase(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String decisionText = body.get("decision");
        if (decisionText == null) decisionText = "Resolved";
        
        CyberbullyingCase c = caseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Case not found with id: " + id));
        c.setStatus("Resolved");
        c.setDecision(decisionText);

        CyberbullyingCase saved = caseRepository.save(c);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COUNSELOR', 'ADMIN')")
    public ResponseEntity<Void> deleteCase(@PathVariable String id) {
        caseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
