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
        if (taskRepository.count() == 0) {
            initializeData();
        }
    }

    private void initializeData() {
        // 1. Initialize Announcements
        announcementRepository.save(new Announcement("Cyber Safety Workshop - 24 July", "KCE is organizing a campus-wide Cyber Safety Workshop focusing on digital ethics and cyberbullying awareness. Attendance is mandatory.", LocalDate.of(2026, 7, 24), "Principal", "All"));
        announcementRepository.save(new Announcement("Mid-Term Exam Schedule Released", "The mid-term examination timetable for all departments has been published on the student portal. Exams start July 15.", LocalDate.of(2026, 7, 2), "Principal", "All"));
        announcementRepository.save(new Announcement("Anti-Bullying Campus Policy Update", "The Karpagam management has updated the student handbook with strict guidelines regarding digital communications and social media harassment.", LocalDate.of(2026, 6, 28), "Principal", "All"));
        announcementRepository.save(new Announcement("AI Security Tool Deployment on KCE Network", "Our college network is now monitored by an advanced AI safety agent that flags offensive and threatening language automatically to protect students.", LocalDate.of(2026, 6, 25), "Principal", "All"));

        // 2. Initialize Tasks (Visible and Hidden)
        Task t1 = taskRepository.save(new Task("Data Structures Assignment", "teacherp101", "Implement a binary search tree with insert, delete operations and tree traversals.", LocalDate.of(2026, 7, 5), true, null, null));
        Task t2 = taskRepository.save(new Task("Computational Methods", "teacherp102", "Complete Exercise 9 and 10 in Chapter 8 concerning numeric integration methods.", LocalDate.of(2026, 7, 5), true, null, null));
        Task t3 = taskRepository.save(new Task("Database Systems Design", "teacherp101", "Create an Entity-Relationship (ER) model and schema design for a hospital management database.", LocalDate.of(2026, 7, 12), true, null, null));
        Task t4 = taskRepository.save(new Task("Algorithm Analysis Review", "teacherp102", "Analyze the time complexity of quicksort and mergesort under best, average, and worst-case scenarios.", LocalDate.of(2026, 7, 15), true, null, null));
        Task t5 = taskRepository.save(new Task("Computer Networks Lab", "teacherp101", "Simulate TCP sliding window protocols using NS2 or packet tracer.", LocalDate.of(2026, 7, 18), true, null, null));

        // Hidden tasks
        taskRepository.save(new Task("Theory of Computation HW3", "teacherp101", "OS Theory details and homework.", LocalDate.of(2026, 7, 20), false, "toc_assignment_3.pdf", "toc_assignment_3.pdf"));
        taskRepository.save(new Task("Operating Systems Project", "teacherp101", "Design a custom process scheduler.", LocalDate.of(2026, 7, 28), false, "os_process_scheduler.docx", "os_process_scheduler.docx"));
        taskRepository.save(new Task("Software Engineering Case Study", "teacherp101", "Compare agile and waterfall methods.", LocalDate.of(2026, 8, 5), false, "se_agile_methods.pdf", "se_agile_methods.pdf"));

        // 3. Initialize Submissions
        submissionRepository.save(new Submission(t1, "Data Structures Assignment", "assignment.pdf", null, LocalDate.of(2026, 7, 5), "Received", "Good effort", 85, "Flagged", "Jaya She", "You look like a cow and your body like an elephant"));
        submissionRepository.save(new Submission(t2, "Computational Methods", "asin_hw.pdf", null, LocalDate.of(2026, 7, 5), "Received", "Excellent", 4, "Safe", "Asin", "Completed the numerical analysis and graphed the error rates."));
        submissionRepository.save(new Submission(t3, "Database Systems Design", "sajai_hw.pdf", null, LocalDate.of(2026, 6, 30), "Received", "Satisfactory", 2, "Safe", "Sanjai", "Attached ER diagram and normal forms normalized to 3NF."));
        submissionRepository.save(new Submission(t4, "Algorithm Analysis Review", "sheriyalab.pdf", null, LocalDate.of(2026, 6, 29), "Received", "Review Required", 91, "Flagged", "Sheriya", "You are such a fool and you are fit for nothing and we will never include you in our friends group and you will be isolated"));

        // 4. Initialize Cyberbullying Cases
        caseRepository.save(new CyberbullyingCase("Mouna", "CSE B", "47%", LocalDate.of(2026, 6, 5), "Hey shut up !Very funny", "Pending", "", "Mocking ------ 47% ------ Average"));
        caseRepository.save(new CyberbullyingCase("Thejan", "IT A", "80%", LocalDate.of(2026, 6, 26), "You look like a cow and your body like an elephant", "Pending", "", "Bullying ------ 80% ------ High"));
        caseRepository.save(new CyberbullyingCase("Aakil", "ECE C", "22%", LocalDate.of(2026, 9, 6), "Hey shut up !Very funny", "Resolved", "Falsely Detected", "Angry ------ 22% ------ Low"));
        caseRepository.save(new CyberbullyingCase("Thrisha", "CIVIL C", "95%", LocalDate.of(2026, 8, 4), "You dont deserve this and better go die somewhere", "Pending", "", "Threatening ------ 95% ------ At Risk"));

        // 5. Initialize Chats
        chatMessageRepository.save(new ChatMessage("Jan She", "Harshini Sasti", "Hey HarshiniSasti! This is Jan She", LocalDateTime.of(2026, 8, 4, 10, 2)));
        chatMessageRepository.save(new ChatMessage("Jan She", "Harshini Sasti", "Why no reply harsh??", LocalDateTime.of(2026, 8, 4, 14, 12)));
        chatMessageRepository.save(new ChatMessage("Harshini Sasti", "Jan She", "Hey Jan She, I was busy", LocalDateTime.of(2026, 8, 4, 16, 16)));
        chatMessageRepository.save(new ChatMessage("Jan She", "Harshini Sasti", "You are useless, u are so rude such a bull", LocalDateTime.of(2026, 8, 4, 16, 17)));

        chatMessageRepository.save(new ChatMessage("Sanshetha S", "Harshini Sasti", "Hi Harshini! Did you complete the network lab?", LocalDateTime.of(2026, 8, 4, 11, 30)));
        chatMessageRepository.save(new ChatMessage("Harshini Sasti", "Sanshetha S", "Yes, I just submitted the NS2 simulation code.", LocalDateTime.of(2026, 8, 4, 12, 15)));
        chatMessageRepository.save(new ChatMessage("Sanshetha S", "Harshini Sasti", "Can you help me with the slide window part? I am stuck.", LocalDateTime.of(2026, 8, 4, 12, 20)));

        // 6. Initialize Materials
        materialRepository.save(new Material("Binary Search Trees Lecture Notes", "This document covers binary search tree insertion, deletion, and search algorithms with complexity analysis.", "AnandKumar", "bst_lecture_notes.pdf", null, LocalDate.of(2026, 7, 28)));
        materialRepository.save(new Material("Relational Database Schema Design", "Guide on normalizing relational database tables to 3NF and BCNF. Includes solved exercises.", "AnandKumar", "rdbms_normalization.pdf", null, LocalDate.of(2026, 7, 30)));
        materialRepository.save(new Material("Numerical Integration Methods", "Complete overview of Trapezoidal and Simpson's rules with error margins.", "Prof. Rak Karnan", "numerical_integration.pdf", null, LocalDate.of(2026, 7, 29)));

        // 7. Initialize Student Messages
        studentMessageRepository.save(new StudentMessage("Harshini Sasti", "Question about assignment", "Professor, can I use a doubly linked list instead of a binary tree for the data structures assignment?", LocalDate.of(2026, 6, 30)));
        studentMessageRepository.save(new StudentMessage("Divya", "Request for extension", "Sir, I am unwell. Can I get a 1-day extension for the database project submission?", LocalDate.of(2026, 6, 29)));
        studentMessageRepository.save(new StudentMessage("Madhan", "Feedback Request", "Ma'am, I have submitted my project. Please let know if there are any issues with it.", LocalDate.of(2026, 6, 28)));

        // 8. Initialize Counseling Slots
        // Initial slots left empty for fresh student bookings
    }
}
