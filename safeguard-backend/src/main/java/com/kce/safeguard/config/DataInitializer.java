package com.kce.safeguard.config;

import com.kce.safeguard.entity.*;
import com.kce.safeguard.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AnnouncementRepository announcementRepository;
    private final TaskRepository taskRepository;
    private final SubmissionRepository submissionRepository;
    private final CyberbullyingCaseRepository caseRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MaterialRepository materialRepository;
    private final CounselingSlotRepository counselingSlotRepository;
    private final StudentMessageRepository studentMessageRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(UserRepository userRepository,
                           AnnouncementRepository announcementRepository,
                           TaskRepository taskRepository,
                           SubmissionRepository submissionRepository,
                           CyberbullyingCaseRepository caseRepository,
                           ChatMessageRepository chatMessageRepository,
                           MaterialRepository materialRepository,
                           CounselingSlotRepository counselingSlotRepository,
                           StudentMessageRepository studentMessageRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.announcementRepository = announcementRepository;
        this.taskRepository = taskRepository;
        this.submissionRepository = submissionRepository;
        this.caseRepository = caseRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.materialRepository = materialRepository;
        this.counselingSlotRepository = counselingSlotRepository;
        this.studentMessageRepository = studentMessageRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            initializeData();
        }
    }

    private void initializeData() {
        // 1. Initialize Users
        User student = new User("Harshini Sasti", "studentp101@kce.ac.in", passwordEncoder.encode("studentp101"), "Student", 20, "+91 98765 43210", "KCE Student Hostel, Coimbatore", "Computer Science & Engineering", "2023-2027", null);
        User teacher = new User("AnandKumar", "teacherp101@kce.ac.in", passwordEncoder.encode("teacherp101"), "Teacher", 42, "+91 94432 12345", "KCE Staff Quarters, Coimbatore", "Computer Science & Engineering", "Faculty", null);
        User counselor = new User("Meena Jegan", "counselormeerajegan@kce.ac.in", passwordEncoder.encode("meerajegan"), "Counselor", 38, "+91 97890 54321", "KCE Counseling Center, Coimbatore", "Counseling Department", "Staff", null);
        User admin = new User("Suresh", "adminsuresh@kce.ac.in", passwordEncoder.encode("admin"), "Admin", 35, "+91 99654 32109", "KCE System Center, Coimbatore", "Information Technology", "Staff", null);
        User principal = new User("Krishnamurthy", "principalkrishnamurthy@kce.ac.in", passwordEncoder.encode("Krishnamurthy"), "Principal", 55, "+91 94440 98765", "KCE Principal Bungalow, Coimbatore", "Administration", "Executive Staff", null);

        userRepository.save(student);
        userRepository.save(teacher);
        userRepository.save(counselor);
        userRepository.save(admin);
        userRepository.save(principal);

        // 2. Initialize Announcements
        announcementRepository.save(new Announcement("Cyber Safety Workshop - 24 July", "KCE is organizing a campus-wide Cyber Safety Workshop focusing on digital ethics and cyberbullying awareness. Attendance is mandatory.", LocalDate.of(2026, 7, 24), "Principal", "All"));
        announcementRepository.save(new Announcement("Mid-Term Exam Schedule Released", "The mid-term examination timetable for all departments has been published on the student portal. Exams start July 15.", LocalDate.of(2026, 7, 2), "Principal", "All"));
        announcementRepository.save(new Announcement("Anti-Bullying Campus Policy Update", "The Karpagam management has updated the student handbook with strict guidelines regarding digital communications and social media harassment.", LocalDate.of(2026, 6, 28), "Principal", "All"));
        announcementRepository.save(new Announcement("AI Security Tool Deployment on KCE Network", "Our college network is now monitored by an advanced AI safety agent that flags offensive and threatening language automatically to protect students.", LocalDate.of(2026, 6, 25), "Principal", "All"));

        // 3. Initialize Tasks (Visible and Hidden)
        Task t1 = taskRepository.save(new Task("Data Structures Assignment", "Prof. Anand Kumar", "Implement a binary search tree with insert, delete operations and tree traversals.", LocalDate.of(2026, 7, 5), true, null));
        Task t2 = taskRepository.save(new Task("Computational Methods", "Prof. Rak Karnan", "Complete Exercise 9 and 10 in Chapter 8 concerning numeric integration methods.", LocalDate.of(2026, 7, 5), true, null));
        Task t3 = taskRepository.save(new Task("Database Systems Design", "Prof. Anand Kumar", "Create an Entity-Relationship (ER) model and schema design for a hospital management database.", LocalDate.of(2026, 7, 12), true, null));
        Task t4 = taskRepository.save(new Task("Algorithm Analysis Review", "Prof. Rak Karnan", "Analyze the time complexity of quicksort and mergesort under best, average, and worst-case scenarios.", LocalDate.of(2026, 7, 15), true, null));
        Task t5 = taskRepository.save(new Task("Computer Networks Lab", "Prof. Anand Kumar", "Simulate TCP sliding window protocols using NS2 or packet tracer.", LocalDate.of(2026, 7, 18), true, null));

        // Hidden tasks
        taskRepository.save(new Task("Theory of Computation HW3", "Prof AnandKumar", "OS Theory details and homework.", LocalDate.of(2026, 7, 20), false, "toc_assignment_3.pdf"));
        taskRepository.save(new Task("Operating Systems Project", "Prof AnandKumar", "Design a custom process scheduler.", LocalDate.of(2026, 7, 28), false, "os_process_scheduler.docx"));
        taskRepository.save(new Task("Software Engineering Case Study", "Prof AnandKumar", "Compare agile and waterfall methods.", LocalDate.of(2026, 8, 5), false, "se_agile_methods.pdf"));

        // 4. Initialize Submissions (with severity and flag statuses matching frontend)
        submissionRepository.save(new Submission(t1, "Data Structures Assignment", "assignment.pdf", null, LocalDate.of(2026, 7, 5), "Received", "Good effort", 85, "Flagged", "Jaya She", "You look like a cow and your body like an elephant"));
        submissionRepository.save(new Submission(t2, "Computational Methods", "asin_hw.pdf", null, LocalDate.of(2026, 7, 5), "Received", "Excellent", 4, "Safe", "Asin", "Completed the numerical analysis and graphed the error rates."));
        submissionRepository.save(new Submission(t3, "Database Systems Design", "sajai_hw.pdf", null, LocalDate.of(2026, 6, 30), "Received", "Satisfactory", 2, "Safe", "Sanjai", "Attached ER diagram and normal forms normalized to 3NF."));
        submissionRepository.save(new Submission(t4, "Algorithm Analysis Review", "sheriyalab.pdf", null, LocalDate.of(2026, 6, 29), "Received", "Review Required", 91, "Flagged", "Sheriya", "You are such a fool and you are fit for nothing and we will never include you in our friends group and you will be isolated"));

        // 5. Initialize Cyberbullying Cases
        caseRepository.save(new CyberbullyingCase("Mouna", "CSE B", "47%", LocalDate.of(2026, 6, 5), "Hey shut up !Very funny", "Pending", "", "Mocking ------ 47% ------ Average"));
        caseRepository.save(new CyberbullyingCase("Thejan", "IT A", "80%", LocalDate.of(2026, 6, 26), "You look like a cow and your body like an elephant", "Pending", "", "Bullying ------ 80% ------ High"));
        caseRepository.save(new CyberbullyingCase("Aakil", "ECE C", "22%", LocalDate.of(2026, 9, 6), "Hey shut up !Very funny", "Resolved", "Falsely Detected", "Angry ------ 22% ------ Low"));
        caseRepository.save(new CyberbullyingCase("Thrisha", "CIVIL C", "95%", LocalDate.of(2026, 8, 4), "You dont deserve this and better go die somewhere", "Pending", "", "Threatening ------ 95% ------ At Risk"));

        // 6. Initialize Chats (between Harshini Sasti and friends)
        chatMessageRepository.save(new ChatMessage("Jan She", "Harshini Sasti", "Hey HarshiniSasti! This is Jan She", LocalDateTime.of(2026, 8, 4, 10, 2)));
        chatMessageRepository.save(new ChatMessage("Jan She", "Harshini Sasti", "Why no reply harsh??", LocalDateTime.of(2026, 8, 4, 14, 12)));
        chatMessageRepository.save(new ChatMessage("Harshini Sasti", "Jan She", "Hey Jan She, I was busy", LocalDateTime.of(2026, 8, 4, 16, 16)));
        chatMessageRepository.save(new ChatMessage("Jan She", "Harshini Sasti", "You are useless, u are so rude such a bull", LocalDateTime.of(2026, 8, 4, 16, 17)));

        chatMessageRepository.save(new ChatMessage("Sanshetha S", "Harshini Sasti", "Hi Harshini! Did you complete the network lab?", LocalDateTime.of(2026, 8, 4, 11, 30)));
        chatMessageRepository.save(new ChatMessage("Harshini Sasti", "Sanshetha S", "Yes, I just submitted the NS2 simulation code.", LocalDateTime.of(2026, 8, 4, 12, 15)));
        chatMessageRepository.save(new ChatMessage("Sanshetha S", "Harshini Sasti", "Can you help me with the slide window part? I am stuck.", LocalDateTime.of(2026, 8, 4, 12, 20)));

        // 7. Initialize Materials
        materialRepository.save(new Material("Binary Search Trees Lecture Notes", "This document covers binary search tree insertion, deletion, and search algorithms with complexity analysis.", "AnandKumar", "bst_lecture_notes.pdf", null, LocalDate.of(2026, 7, 28)));
        materialRepository.save(new Material("Relational Database Schema Design", "Guide on normalizing relational database tables to 3NF and BCNF. Includes solved exercises.", "AnandKumar", "rdbms_normalization.pdf", null, LocalDate.of(2026, 7, 30)));
        materialRepository.save(new Material("Numerical Integration Methods", "Complete overview of Trapezoidal and Simpson's rules with error margins.", "Prof. Rak Karnan", "numerical_integration.pdf", null, LocalDate.of(2026, 7, 29)));

        // 8. Initialize Student Messages (Teachers inbox)
        studentMessageRepository.save(new StudentMessage("Harshini Sasti", "Question about assignment", "Professor, can I use a doubly linked list instead of a binary tree for the data structures assignment?", LocalDate.of(2026, 6, 30)));
        studentMessageRepository.save(new StudentMessage("Divya", "Request for extension", "Sir, I am unwell. Can I get a 1-day extension for the database project submission?", LocalDate.of(2026, 6, 29)));
        studentMessageRepository.save(new StudentMessage("Madhan", "Feedback Request", "Ma'am, I have submitted my project. Please let me know if there are any issues with it.", LocalDate.of(2026, 6, 28)));

        // 9. Initialize Counseling Slots (Approved & Pending)
        counselingSlotRepository.save(new CounselingSlot("Harshini Sasti", "23CSE101", "Computer Science & Engineering", "Experiencing stress regarding exam schedule", "Pending", "", "Meena Jegan"));
    }
}
