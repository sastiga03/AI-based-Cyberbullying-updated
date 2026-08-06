package com.kce.safeguard.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    private String taskTitle; // Duplicate for easy retrieval
    private String fileName;
    private String fileUrl;
    private LocalDate date;
    private String status; // Received, Reviewed, etc.
    private String feedback; // e.g. Good effort, Awaiting Review
    private Integer severityScore; // 0-100%
    private String flagStatus; // Safe, Flagged
    private String studentName;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String content; // Submission comments / details

    public Submission() {
    }

    public Submission(Task task, String taskTitle, String fileName, String fileUrl, LocalDate date, String status, String feedback, Integer severityScore, String flagStatus, String studentName, String content) {
        this.task = task;
        this.taskTitle = taskTitle;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.date = date;
        this.status = status;
        this.feedback = feedback;
        this.severityScore = severityScore;
        this.flagStatus = flagStatus;
        this.studentName = studentName;
        this.content = content;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public Integer getSeverityScore() {
        return severityScore;
    }

    public void setSeverityScore(Integer severityScore) {
        this.severityScore = severityScore;
    }

    public String getFlagStatus() {
        return flagStatus;
    }

    public void setFlagStatus(String flagStatus) {
        this.flagStatus = flagStatus;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
