package com.kce.safeguard.dto;

import jakarta.validation.constraints.NotBlank;

public class CaseRequest {

    @NotBlank(message = "Issue type is required")
    private String type;

    @NotBlank(message = "Description is required")
    private String desc;

    private String file;

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public String getFile() {
        return file;
    }

    public void setFile(String file) {
        this.file = file;
    }
}
