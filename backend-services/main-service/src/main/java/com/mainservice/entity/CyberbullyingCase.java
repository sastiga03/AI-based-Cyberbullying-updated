package com.mainservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "cyberbullying_cases")
public class CyberbullyingCase {

    @Id
    private String id;
    private String studentName;
    private String className; // e.g. CSE A
    private String severity;  // e.g. 47%
    private LocalDate date;
    private String content;
    private String status; // Pending, Resolved
    private String decision; // Counselor's resolution comments
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
    public String getId() {
        return id;
    }

    public void setId(String id) {
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
