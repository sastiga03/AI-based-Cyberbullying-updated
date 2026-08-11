package com.mainservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "tasks")
public class Task {

    @Id
    private String id;
    private String title;
    private String instructor;
    private String description;
    private LocalDate dueDate;
    private boolean visible;
    private String fileUrl;
    private String fileName;

    public Task() {
    }

    public Task(String title, String instructor, String description, LocalDate dueDate, boolean visible, String fileUrl, String fileName) {
        this.title = title;
        this.instructor = instructor;
        this.description = description;
        this.dueDate = dueDate;
        this.visible = visible;
        this.fileUrl = fileUrl;
        this.fileName = fileName;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getInstructor() {
        return instructor;
    }

    public void setInstructor(String instructor) {
        this.instructor = instructor;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}
