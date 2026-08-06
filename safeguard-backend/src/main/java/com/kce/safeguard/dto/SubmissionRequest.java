package com.kce.safeguard.dto;

import jakarta.validation.constraints.NotBlank;

public class SubmissionRequest {

    @NotBlank(message = "Task title is required")
    private String taskTitle;

    private String fileName;
    private String fileUrl;
    private String comment; // represents the content to scan

    // Getters and Setters
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

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
