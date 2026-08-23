package com.mainservice.controller;

import com.mainservice.entity.CyberbullyingCase;
import com.mainservice.repository.CyberbullyingCaseRepository;
import com.mainservice.util.CyberbullyingAnalyzer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiDetectionController {

    @Autowired
    private CyberbullyingAnalyzer cyberbullyingAnalyzer;

    @Autowired
    private CyberbullyingCaseRepository caseRepository;

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeText(@RequestBody Map<String, String> payload) {
        String text = payload.get("text");
        CyberbullyingAnalyzer.AnalysisResult analysis = cyberbullyingAnalyzer.analyze(text);

        Map<String, Object> response = new HashMap<>();
        response.put("severityScore", analysis.getSeverityScore());
        response.put("flagStatus", analysis.getFlagStatus());
        response.put("result", analysis.getResult());
        response.put("category", analysis.getCategory());
        response.put("isBullying", analysis.isBullying());
        response.put("flaggedTerms", analysis.getFlaggedTerms());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/scan-message")
    public ResponseEntity<Map<String, Object>> scanMessage(@RequestBody Map<String, String> payload) {
        String sender = payload.getOrDefault("sender", "Student");
        String content = payload.getOrDefault("content", "");
        String className = payload.getOrDefault("className", "CSE A");

        CyberbullyingAnalyzer.AnalysisResult analysis = cyberbullyingAnalyzer.analyze(content);

        Map<String, Object> response = new HashMap<>();
        response.put("severityScore", analysis.getSeverityScore());
        response.put("flagStatus", analysis.getFlagStatus());
        response.put("result", analysis.getResult());
        response.put("category", analysis.getCategory());
        response.put("isBullying", analysis.isBullying());
        response.put("flaggedTerms", analysis.getFlaggedTerms());

        if (analysis.isBullying()) {
            CyberbullyingCase c = new CyberbullyingCase();
            c.setStudentName(sender);
            c.setClassName(className);
            c.setDate(LocalDate.now());
            c.setContent(content);
            c.setStatus("Pending");
            c.setDecision("");
            c.setSeverity(analysis.getSeverityScore() + "%");
            c.setResult(analysis.getResult());

            CyberbullyingCase saved = caseRepository.save(c);
            response.put("caseId", saved.getId());
            response.put("caseCreated", true);
        } else {
            response.put("caseCreated", false);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/scan-submission")
    public ResponseEntity<Map<String, Object>> scanSubmission(@RequestBody Map<String, String> payload) {
        String studentName = payload.getOrDefault("studentName", "Student");
        String comment = payload.getOrDefault("comment", "");
        String className = payload.getOrDefault("className", "CSE A");

        CyberbullyingAnalyzer.AnalysisResult analysis = cyberbullyingAnalyzer.analyze(comment);

        Map<String, Object> response = new HashMap<>();
        response.put("severityScore", analysis.getSeverityScore());
        response.put("flagStatus", analysis.getFlagStatus());
        response.put("result", analysis.getResult());
        response.put("category", analysis.getCategory());
        response.put("isBullying", analysis.isBullying());
        response.put("flaggedTerms", analysis.getFlaggedTerms());

        if (analysis.isBullying()) {
            CyberbullyingCase c = new CyberbullyingCase();
            c.setStudentName(studentName);
            c.setClassName(className);
            c.setDate(LocalDate.now());
            c.setContent("File submission comment: " + comment);
            c.setStatus("Pending");
            c.setDecision("");
            c.setSeverity(analysis.getSeverityScore() + "%");
            c.setResult(analysis.getResult());

            CyberbullyingCase saved = caseRepository.save(c);
            response.put("caseId", saved.getId());
            response.put("caseCreated", true);
        } else {
            response.put("caseCreated", false);
        }

        return ResponseEntity.ok(response);
    }
}
