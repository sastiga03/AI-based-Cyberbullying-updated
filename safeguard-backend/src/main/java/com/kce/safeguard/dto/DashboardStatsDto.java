package com.kce.safeguard.dto;

import java.util.Map;

public class DashboardStatsDto {

    private String role;
    private Map<String, Object> stats;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(String role, Map<String, Object> stats) {
        this.role = role;
        this.stats = stats;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Map<String, Object> getStats() {
        return stats;
    }

    public void setStats(Map<String, Object> stats) {
        this.stats = stats;
    }
}
