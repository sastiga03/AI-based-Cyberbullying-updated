package com.mainservice.controller;

import com.mainservice.dto.SubmissionRequest;
import com.mainservice.entity.Submission;
import com.mainservice.entity.Task;
import com.mainservice.entity.CyberbullyingCase;
import com.mainservice.repository.SubmissionRepository;
import com.mainservice.repository.TaskRepository;
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

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private CyberbullyingCaseRepository caseRepository;

    @Autowired
    private CyberbullyingAnalyzer cyberbullyingAnalyzer;

    @GetMapping
    public ResponseEntity<List<Submission>> getSubmissions(
            @RequestParam(value = "all", required = false, defaultValue = "false") boolean all,
            @RequestParam(value = "filter", required = false) String filter) {
        
        if (all) {
            if (filter != null && filter.equalsIgnoreCase("Flagged")) {
                return ResponseEntity.ok(submissionRepository.findByFlagStatus("Flagged"));
            } else if (filter != null && filter.equalsIgnoreCase("Safe")) {
                return ResponseEntity.ok(submissionRepository.findByFlagStatus("Safe"));
            }
            return ResponseEntity.ok(submissionRepository.findAll());
        } else {
            String currentStudent = SecurityUtils.getCurrentUserName();
            if (currentStudent == null) currentStudent = "Harshini Sasti";
            return ResponseEntity.ok(submissionRepository.findByStudentName(currentStudent));
        }
    }

    @org.springframework.beans.factory.annotation.Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<Submission> submitTask(@Valid @RequestBody SubmissionRequest request) {
        String studentName = SecurityUtils.getCurrentUserName();
        if (studentName == null) studentName = "Harshini Sasti";
        
        List<Task> tasks = taskRepository.findByVisible(true);
        Task matchedTask = tasks.stream()
                .filter(t -> t.getTitle().equalsIgnoreCase(request.getTaskTitle().trim()))
                .findFirst()
                .orElse(null);

        if (matchedTask == null) {
            matchedTask = new Task();
            matchedTask.setTitle(request.getTaskTitle());
            matchedTask.setInstructor("teacherp101");
            matchedTask.setDescription("Dynamic class assignment");
            matchedTask.setDueDate(LocalDate.now().plusDays(7));
            matchedTask.setVisible(true);
            matchedTask = taskRepository.save(matchedTask);
        }

        // 1. Analyze Comment / Remarks
        String commentText = request.getComment() == null ? "" : request.getComment();
        CyberbullyingAnalyzer.AnalysisResult commentAnalysis = cyberbullyingAnalyzer.analyze(commentText);

        // 2. Extract and Analyze File Content (e.g. .docx, .txt, .csv)
        CyberbullyingAnalyzer.AnalysisResult fileAnalysis = null;
        String fileTextContent = "";
        String fileUrl = request.getFileUrl();
        String fileName = request.getFileName();

        if (fileUrl != null && fileUrl.contains("/download/")) {
            String storedName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            try {
                java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir).resolve(storedName).toAbsolutePath().normalize();
                if (java.nio.file.Files.exists(filePath)) {
                    try (java.io.InputStream is = java.nio.file.Files.newInputStream(filePath)) {
                        fileTextContent = com.mainservice.util.DocumentTextExtractor.extractText(is, fileName);
                    }
                    if (fileTextContent != null && !fileTextContent.trim().isEmpty()) {
                        fileAnalysis = cyberbullyingAnalyzer.analyze(fileTextContent);
                    }
                }
            } catch (Exception e) {
                System.err.println("Error reading submitted file content: " + e.getMessage());
            }
        }

        // 3. Combine Results
        boolean isFlagged = "Flagged".equalsIgnoreCase(commentAnalysis.getFlagStatus()) ||
                            (fileAnalysis != null && "Flagged".equalsIgnoreCase(fileAnalysis.getFlagStatus()));
        
        int finalSeverity = commentAnalysis.getSeverityScore();
        String finalResult = commentAnalysis.getResult();
        String finalCategory = commentAnalysis.getCategory();
        String combinedContent = commentText;

        if (fileAnalysis != null && fileAnalysis.getSeverityScore() > finalSeverity) {
            finalSeverity = fileAnalysis.getSeverityScore();
            finalResult = fileAnalysis.getResult();
            finalCategory = fileAnalysis.getCategory();
        }

        if (fileAnalysis != null && "Flagged".equalsIgnoreCase(fileAnalysis.getFlagStatus())) {
            combinedContent = "Uploaded File Content (" + fileName + "): " + fileTextContent + 
                              (!commentText.trim().isEmpty() ? " | Comment: " + commentText : "");
        }

        Submission submission = new Submission();
        submission.setTask(matchedTask);
        submission.setTaskTitle(matchedTask.getTitle());
        submission.setFileName(request.getFileName());
        submission.setFileUrl(request.getFileUrl());
        submission.setDate(LocalDate.now());
        submission.setStatus("Received");
        submission.setFeedback("Awaiting Review");
        submission.setSeverityScore(finalSeverity);
        submission.setFlagStatus(isFlagged ? "Flagged" : "Safe");
        submission.setStudentName(studentName);
        submission.setContent(combinedContent);

        Submission saved = submissionRepository.save(submission);

        // 4. Auto-escalate to Counselor Cases if either the file content or comment is flagged
        if (isFlagged) {
            CyberbullyingCase newCase = new CyberbullyingCase();
            newCase.setStudentName(studentName);
            newCase.setClassName("CSE A");
            newCase.setSeverity(finalSeverity + "%");
            newCase.setDate(LocalDate.now());
            newCase.setContent(combinedContent);
            newCase.setStatus("Pending");
            newCase.setDecision("");
            newCase.setResult(finalResult);
            caseRepository.save(newCase);
        }

        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/forward")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<CyberbullyingCase> forwardSubmission(@PathVariable String id) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found with id: " + id));

        CyberbullyingCase newCase = new CyberbullyingCase();
        newCase.setStudentName(submission.getStudentName());
        newCase.setClassName("CSE B");
        newCase.setSeverity(submission.getSeverityScore() + "%");
        newCase.setDate(LocalDate.now());
        newCase.setContent(submission.getContent());
        newCase.setStatus("Pending");
        newCase.setDecision("");
        newCase.setResult(submission.getFlagStatus().equals("Flagged") ? 
                "Bullying ------ " + submission.getSeverityScore() + "% ------ High" : 
                "Safe ------ " + submission.getSeverityScore() + "% ------ Low");

        CyberbullyingCase savedCase = caseRepository.save(newCase);
        return ResponseEntity.ok(savedCase);
    }
}
