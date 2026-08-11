package com.mainservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CounselingSlotRequest {

    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    private String email;
    private String dept;
    @NotBlank(message = "Reason is required")
    private String reason;

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDept() {
        return dept;
    }

    public void setDept(String dept) {
        this.dept = dept;
    }
}
