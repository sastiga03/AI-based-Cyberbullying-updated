package com.kce.safeguard.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "cyberbullying_cases")
public class CyberbullyingCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentName;

    private String className; // e.g. CSE A
    private String severity;  // e.g. 47%
    private LocalDate date;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String content;

    private String status; // Pending, Resolved
    private String decision; // Counselor's resolution comments

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String result; // AI categorization result, e.g. "Mocking ------ 47% ------ Average"

    public CyberbullyingCase() {
    }

    public CyberbullyingCase(String studentName, String className, String severity, LocalDate date, String content, String status, String decision, String result) {
        this.studentName = studentName;
        this.className = className;
        this.severity = severity;
        this.date = date;
        this.content = content;
        this.status = status;
        this.decision = decision;
        this.result = result;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDecision() {
        return decision;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }
}
