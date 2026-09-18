package com.mainservice.config;

import com.mainservice.entity.*;
import com.mainservice.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private AnnouncementRepository announcementRepository;
    @Autowired private TaskRepository taskRepository;
    @Autowired private SubmissionRepository submissionRepository;
    @Autowired private CyberbullyingCaseRepository caseRepository;
    @Autowired private ChatMessageRepository chatMessageRepository;
    @Autowired private MaterialRepository materialRepository;
    @Autowired private CounselingSlotRepository counselingSlotRepository;
    @Autowired private StudentMessageRepository studentMessageRepository;

    @Override
    public void run(String... args) throws Exception {
        // Clean up any legacy mock tasks
        taskRepository.findAll().stream()
            .filter(t -> t.getTitle() != null && (
                t.getTitle().equals("Data Structures Assignment") ||
                t.getTitle().equals("Computational Methods") ||
                t.getTitle().equals("Database Systems Design") ||
                t.getTitle().equals("Algorithm Analysis Review") ||
                t.getTitle().equals("Computer Networks Lab") ||
                t.getTitle().equals("Theory of Computation HW3") ||
                t.getTitle().equals("Operating Systems Project") ||
                t.getTitle().equals("Software Engineering Case Study")
            ))
            .forEach(taskRepository::delete);

        // Clean up legacy mock submissions
        submissionRepository.findAll().stream()
            .filter(s -> s.getStudentName() != null && (
                s.getStudentName().equalsIgnoreCase("Jaya She") ||
                s.getStudentName().equalsIgnoreCase("Asin") ||
                s.getStudentName().equalsIgnoreCase("Sanjai") ||
                s.getStudentName().equalsIgnoreCase("Sheriya")
            ))
            .forEach(submissionRepository::delete);

        // Clean up legacy mock cases
        caseRepository.findAll().stream()
            .filter(c -> c.getStudentName() != null && (
                c.getStudentName().equalsIgnoreCase("Mouna") ||
                c.getStudentName().equalsIgnoreCase("Thejan") ||
                c.getStudentName().equalsIgnoreCase("Aakil") ||
                c.getStudentName().equalsIgnoreCase("Thrisha")
            ))
            .forEach(caseRepository::delete);

        // Clean up legacy mock materials
        materialRepository.findAll().stream()
            .filter(m -> m.getTitle() != null && (
                m.getTitle().equals("Binary Search Trees Lecture Notes") ||
                m.getTitle().equals("Relational Database Schema Design") ||
                m.getTitle().equals("Numerical Integration Methods")
            ))
            .forEach(materialRepository::delete);

        // Clean up legacy mock and test announcements
        announcementRepository.findAll().stream()
            .filter(a -> a.getTitle() != null && (
                a.getTitle().equals("Cyber Safety Workshop - 24 July") ||
                a.getTitle().equals("Mid-Term Exam Schedule Released") ||
                a.getTitle().equals("Anti-Bullying Campus Policy Update") ||
                a.getTitle().equals("AI Security Tool Deployment on KCE Network") ||
                a.getTitle().contains("1786599") ||
                a.getTitle().contains("All Roles Notice") ||
                a.getTitle().contains("Student Specific Notice") ||
                a.getTitle().contains("Teacher Specific Notice") ||
                (a.getContent() != null && a.getContent().toLowerCase().contains("test content"))
            ))
            .forEach(announcementRepository::delete);

        // Clean up legacy mock student messages
        studentMessageRepository.findAll().stream()
            .filter(m -> m.getStudentName() != null && (
                m.getStudentName().equalsIgnoreCase("Divya") ||
                m.getStudentName().equalsIgnoreCase("Madhan")
            ))
            .forEach(studentMessageRepository::delete);

        // Clean up legacy mock chats
        chatMessageRepository.findAll().stream()
            .filter(cm -> (cm.getSenderName() != null && (cm.getSenderName().equalsIgnoreCase("Jan She") || cm.getSenderName().equalsIgnoreCase("Sanshetha S"))) ||
                          (cm.getRecipientName() != null && (cm.getRecipientName().equalsIgnoreCase("Jan She") || cm.getRecipientName().equalsIgnoreCase("Sanshetha S"))))
            .forEach(chatMessageRepository::delete);
    }
}
