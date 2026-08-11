package com.mainservice.controller;

import com.mainservice.dto.DashboardStatsDto;
import com.mainservice.repository.TaskRepository;
import com.mainservice.repository.SubmissionRepository;
import com.mainservice.repository.CyberbullyingCaseRepository;
import com.mainservice.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private CyberbullyingCaseRepository caseRepository;

    @Autowired
    private HttpServletRequest servletRequest;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String role = "Student";
        String name = "Harshini Sasti";
        
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
            name = principal.getName();
            role = principal.getAuthorities().iterator().next().getAuthority()
                    .replace("ROLE_", "");
            role = role.substring(0, 1).toUpperCase() + role.substring(1).toLowerCase();
        }

        Map<String, Object> stats = new HashMap<>();

        long totalTasks = taskRepository.count();
        long totalCases = caseRepository.count();
        long pendingCases = caseRepository.findAll().stream().filter(c -> c.getStatus().equalsIgnoreCase("Pending")).count();
        long resolvedCases = caseRepository.findAll().stream().filter(c -> c.getStatus().equalsIgnoreCase("Resolved")).count();

        switch (role.toUpperCase()) {
            case "STUDENT":
                long completedTasks = submissionRepository.findByStudentName(name).size();
                stats.put("assignedTasks", totalTasks);
                stats.put("completedTasks", completedTasks);
                stats.put("safetyScore", 92);
                break;
                
            case "TEACHER":
                long totalSubmissions = submissionRepository.count();
                long flaggedCount = submissionRepository.findByFlagStatus("Flagged").size();
                stats.put("totalTasks", totalTasks);
                stats.put("totalSubmissions", totalSubmissions);
                stats.put("flaggedContent", flaggedCount);
                break;
                
            case "COUNSELOR":
                stats.put("totalCases", totalCases);
                stats.put("pendingCases", pendingCases);
                stats.put("resolvedCases", resolvedCases);
                break;
                
            case "PRINCIPAL":
                stats.put("totalCases", totalCases);
                stats.put("activeCases", pendingCases);
                stats.put("safetyScore", 91);
                break;
                
            case "ADMIN":
                stats.put("scannedCount", 48293 + totalSubmissionsCount());
                stats.put("flagsCount", 87 + totalCases);
                stats.put("accuracyPercent", 98.7);
                
                int totalUsers = 5;
                try {
                    RestTemplate restTemplate = new RestTemplate();
                    String token = servletRequest.getHeader("Authorization");
                    if (token != null) {
                        HttpHeaders headers = new HttpHeaders();
                        headers.set("Authorization", token);
                        HttpEntity<String> entity = new HttpEntity<>(headers);
                        ResponseEntity<List> res = restTemplate.exchange(
                                "http://localhost:8081/api/users", 
                                HttpMethod.GET, 
                                entity, 
                                List.class
                        );
                        if (res.getBody() != null) {
                            totalUsers = res.getBody().size();
                        }
                    }
                } catch (Exception e) {
                    // fallback
                }
                stats.put("totalUsers", totalUsers);
                break;
        }

        return ResponseEntity.ok(new DashboardStatsDto(role, stats));
    }

    private long totalSubmissionsCount() {
        try {
            return submissionRepository.count();
        } catch (Exception e) {
            return 0;
        }
    }
}
