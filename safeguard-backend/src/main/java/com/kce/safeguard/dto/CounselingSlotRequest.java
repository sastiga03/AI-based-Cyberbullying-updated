package com.kce.safeguard.dto;

import jakarta.validation.constraints.NotBlank;

public class CounselingSlotRequest {

    private String rollNo;
    private String dept;

    @NotBlank(message = "Reason is required")
    private String reason;

    // Getters and Setters
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
}
