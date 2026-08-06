package com.kce.safeguard.service;

import com.kce.safeguard.dto.CaseRequest;
import com.kce.safeguard.entity.CyberbullyingCase;
import com.kce.safeguard.entity.Submission;
import com.kce.safeguard.entity.StudentMessage;
import com.kce.safeguard.exception.ResourceNotFoundException;
import com.kce.safeguard.repository.CyberbullyingCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class CaseService {

    private final CyberbullyingCaseRepository caseRepository;

    @Autowired
    public CaseService(CyberbullyingCaseRepository caseRepository) {
        this.caseRepository = caseRepository;
    }

    public List<CyberbullyingCase> getCases(String statusFilter) {
        if (statusFilter != null && !statusFilter.equalsIgnoreCase("All")) {
            return caseRepository.findByStatus(statusFilter);
        }
        return caseRepository.findAll();
    }

    @Transactional
    public CyberbullyingCase reportIssue(CaseRequest request, String studentName) {
        CyberbullyingCase newCase = new CyberbullyingCase();
        newCase.setStudentName(studentName);
        newCase.setClassName("CSE A"); // default
        newCase.setSeverity("45%"); // Default medium/low severity for self-report
        newCase.setDate(LocalDate.now());
        newCase.setContent(request.getType() + ": " + request.getDesc());
        newCase.setStatus("Pending");
        newCase.setDecision("");
        newCase.setResult("Student reported issue: " + request.getType());

        return caseRepository.save(newCase);
    }

    @Transactional
    public CyberbullyingCase forwardSubmission(Submission submission) {
        CyberbullyingCase newCase = new CyberbullyingCase();
        newCase.setStudentName(submission.getStudentName());
        newCase.setClassName("CSE A"); // default
        newCase.setSeverity(submission.getSeverityScore() + "%");
        newCase.setDate(submission.getDate());
        newCase.setContent(submission.getContent() != null ? submission.getContent() : "Submission file: " + submission.getFileName());
        newCase.setStatus("Pending");
        newCase.setDecision("");
        newCase.setResult("Flagged Content Severity: " + submission.getSeverityScore() + "%");

        return caseRepository.save(newCase);
    }

    @Transactional
    public CyberbullyingCase forwardMessage(StudentMessage msg) {
        CyberbullyingCase newCase = new CyberbullyingCase();
        newCase.setStudentName(msg.getStudentName());
        newCase.setClassName("CSE A"); // default
        newCase.setSeverity("80%"); // default high severity for forwarded inquiry
        newCase.setDate(msg.getDate());
        newCase.setContent(msg.getContent());
        newCase.setStatus("Pending");
        newCase.setDecision("");
        newCase.setResult("Forwarded message inquiry review");

        return caseRepository.save(newCase);
    }

    @Transactional
    public CyberbullyingCase resolveCase(Long id, String decisionText) {
        CyberbullyingCase c = caseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CyberbullyingCase", "id", id));
        c.setStatus("Resolved");
        c.setDecision(decisionText);
        return caseRepository.save(c);
    }

    public CyberbullyingCase getCaseById(Long id) {
        return caseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CyberbullyingCase", "id", id));
    }
}
