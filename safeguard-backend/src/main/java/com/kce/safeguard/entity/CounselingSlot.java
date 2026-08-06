package com.kce.safeguard.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "counseling_slots")
public class CounselingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentName;

    private String rollNo;
    private String dept;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String reason;

    private String status; // Pending, Approved
    private String timings; // Approved slot timings, e.g. "10:00 AM - 11:00 AM"
    private String counselorName;

    public CounselingSlot() {
    }

    public CounselingSlot(String studentName, String rollNo, String dept, String reason, String status, String timings, String counselorName) {
        this.studentName = studentName;
        this.rollNo = rollNo;
        this.dept = dept;
        this.reason = reason;
        this.status = status;
        this.timings = timings;
        this.counselorName = counselorName;
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

    public String getRollNo() {
        return rollNo;
    }

    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public String getDept() {
        return dept;
    }

    public void setDept(String dept) {
        this.dept = dept;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getTimings() {
        return timings;
    }

    public void setTimings(String timings) {
        this.timings = timings;
    }

    public String getCounselorName() {
        return counselorName;
    }

    public void setCounselorName(String counselorName) {
        this.counselorName = counselorName;
    }
}
