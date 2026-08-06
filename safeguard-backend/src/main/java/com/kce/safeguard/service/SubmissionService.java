package com.kce.safeguard.service;

import com.kce.safeguard.dto.SubmissionRequest;
import com.kce.safeguard.entity.Submission;
import com.kce.safeguard.entity.Task;
import com.kce.safeguard.exception.ResourceNotFoundException;
import com.kce.safeguard.repository.SubmissionRepository;
import com.kce.safeguard.repository.TaskRepository;
import com.kce.safeguard.util.CyberbullyingAnalyzer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final TaskRepository taskRepository;
    private final CyberbullyingAnalyzer cyberbullyingAnalyzer;

    @Autowired
    public SubmissionService(SubmissionRepository submissionRepository,
                             TaskRepository taskRepository,
                             CyberbullyingAnalyzer cyberbullyingAnalyzer) {
        this.submissionRepository = submissionRepository;
        this.taskRepository = taskRepository;
        this.cyberbullyingAnalyzer = cyberbullyingAnalyzer;
    }

    public List<Submission> getSubmissionsByStudent(String studentName) {
        return submissionRepository.findByStudentName(studentName);
    }

    public List<Submission> getAllSubmissions(String filter) {
        if (filter != null && filter.equalsIgnoreCase("Flagged")) {
            return submissionRepository.findByFlagStatus("Flagged");
        } else if (filter != null && filter.equalsIgnoreCase("Safe")) {
            return submissionRepository.findByFlagStatus("Safe");
        }
        return submissionRepository.findAll();
    }

    @Transactional
    public Submission submitTask(SubmissionRequest request, String studentName) {
        // Find task by title
        List<Task> tasks = taskRepository.findByVisible(true);
        Task matchedTask = tasks.stream()
                .filter(t -> t.getTitle().equalsIgnoreCase(request.getTaskTitle().trim()))
                .findFirst()
                .orElse(null);

        if (matchedTask == null) {
            // Fallback or create dummy task to attach
            matchedTask = new Task();
            matchedTask.setTitle(request.getTaskTitle());
            matchedTask.setInstructor("Prof. Anand Kumar");
            matchedTask.setDescription("Dynamic class assignment");
            matchedTask.setDueDate(LocalDate.now().plusDays(7));
            matchedTask.setVisible(true);
            matchedTask = taskRepository.save(matchedTask);
        }

        // Run content scanning on comment / content
        CyberbullyingAnalyzer.AnalysisResult analysis = cyberbullyingAnalyzer.analyze(request.getComment());

        Submission submission = new Submission();
        submission.setTask(matchedTask);
        submission.setTaskTitle(matchedTask.getTitle());
        submission.setFileName(request.getFileName());
        submission.setFileUrl(request.getFileUrl());
        submission.setDate(LocalDate.now());
        submission.setStatus("Received");
        submission.setFeedback("Awaiting Review");
        submission.setSeverityScore(analysis.getSeverityScore());
        submission.setFlagStatus(analysis.getFlagStatus());
        submission.setStudentName(studentName);
        submission.setContent(request.getComment());

        return submissionRepository.save(submission);
    }

    public Submission getSubmissionById(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "id", id));
    }
}
