package com.auth.config;

import com.auth.entity.User;
import com.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed default demo accounts if not already present in the database

        // 1. Student
        if (!userRepository.existsByEmail("studentp101@kce.ac.in")) {
            User student = new User(
                "Harshini Sasti",
                "studentp101@kce.ac.in",
                passwordEncoder.encode("studentp101"),
                "Student",
                20,
                "+91 9876543210",
                "Coimbatore, Tamil Nadu",
                "Computer Science & Engineering",
                "2023 - 2027",
                "",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            );
            userRepository.save(student);
        }

        // 2. Teacher (CSE)
        if (!userRepository.existsByEmail("teacherp101@kce.ac.in")) {
            User teacher = new User(
                "P. Vijayalakshmi",
                "teacherp101@kce.ac.in",
                passwordEncoder.encode("teacherp101"),
                "Teacher",
                38,
                "+91 9876543211",
                "Coimbatore, Tamil Nadu",
                "Computer Science & Engineering",
                "III Year CSE",
                "Data Structures, Database Management Systems, Cloud Computing",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
            );
            userRepository.save(teacher);
        }

        // 3. Counselor
        if (!userRepository.existsByEmail("counselormeerajegan@kce.ac.in")) {
            User counselor = new User(
                "Meena Jegan",
                "counselormeerajegan@kce.ac.in",
                passwordEncoder.encode("meerajegan"),
                "Counselor",
                42,
                "+91 9876543212",
                "Coimbatore, Tamil Nadu",
                "Student Welfare & Counseling Cell",
                "Campus Counseling",
                "",
                "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150"
            );
            userRepository.save(counselor);
        }

        // 4. Admin
        if (!userRepository.existsByEmail("adminsuresh@kce.ac.in")) {
            User admin = new User(
                "Suresh Kumar",
                "adminsuresh@kce.ac.in",
                passwordEncoder.encode("admin"),
                "Admin",
                45,
                "+91 9876543213",
                "Coimbatore, Tamil Nadu",
                "Administration",
                "IT & Operations",
                "",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
            );
            userRepository.save(admin);
        }

        // 5. Principal
        if (!userRepository.existsByEmail("principalkrishnamurthy@kce.ac.in")) {
            User principal = new User(
                "Dr. K. Krishnamurthy",
                "principalkrishnamurthy@kce.ac.in",
                passwordEncoder.encode("Krishnamurthy"),
                "Principal",
                54,
                "+91 9876543214",
                "Coimbatore, Tamil Nadu",
                "Office of the Principal",
                "Leadership",
                "",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
            );
            userRepository.save(principal);
        }

        // 6. Teacher (IT)
        if (!userRepository.existsByEmail("teachersaravanan@kce.ac.in")) {
            User teacherIT = new User(
                "R. Saravanan",
                "teachersaravanan@kce.ac.in",
                passwordEncoder.encode("saravanan"),
                "Teacher",
                35,
                "+91 9876543215",
                "Coimbatore, Tamil Nadu",
                "Information & Technology",
                "III Year IT",
                "Web Technology, Internet of Things, Artificial Intelligence",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
            );
            userRepository.save(teacherIT);
        }

        // 7. Student (IT)
        if (!userRepository.existsByEmail("studentdinesh@kce.ac.in")) {
            User studentIT = new User(
                "K. Dinesh",
                "studentdinesh@kce.ac.in",
                passwordEncoder.encode("dinesh"),
                "Student",
                20,
                "+91 9876543216",
                "Coimbatore, Tamil Nadu",
                "Information & Technology",
                "2023 - 2027",
                "",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
            );
            userRepository.save(studentIT);
        }
    }
}
