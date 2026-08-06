package com.kce.safeguard.dto;

import jakarta.validation.constraints.NotBlank;

public class CounselingApproveRequest {

    @NotBlank(message = "Timings details are required")
    private String timings;

    public String getTimings() {
        return timings;
    }

    public void setTimings(String timings) {
        this.timings = timings;
    }
}
