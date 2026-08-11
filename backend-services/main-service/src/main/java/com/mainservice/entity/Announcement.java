package com.mainservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;

@Document(collection = "announcements")
public class Announcement {

    @Id
    private String id;
    private String title;
    private String content;
    private LocalDate date;
    private String postedBy; // Principal, Teacher, etc.
    private String targetRole; // All, Student, Teacher, Counselor, etc.

    public Announcement() {
    }

    public Announcement(String title, String content, LocalDate date, String postedBy, String targetRole) {
        this.title = title;
        this.content = content;
        this.date = date;
        this.postedBy = postedBy;
        this.targetRole = targetRole;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getPostedBy() {
        return postedBy;
    }

    public void setPostedBy(String postedBy) {
        this.postedBy = postedBy;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }
}
