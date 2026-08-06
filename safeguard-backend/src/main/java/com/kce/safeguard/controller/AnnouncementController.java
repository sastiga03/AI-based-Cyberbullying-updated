package com.kce.safeguard.controller;

import com.kce.safeguard.dto.AnnouncementRequest;
import com.kce.safeguard.entity.Announcement;
import com.kce.safeguard.service.AnnouncementService;
import com.kce.safeguard.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @Autowired
    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAnnouncements() {
        String email = SecurityUtils.getCurrentUserEmail();
        List<Map<String, Object>> list = announcementService.getAnnouncementsForUser(email);
        return ResponseEntity.ok(list);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PRINCIPAL', 'TEACHER', 'ADMIN')")
    public ResponseEntity<Announcement> createAnnouncement(@Valid @RequestBody AnnouncementRequest request) {
        String postedBy = SecurityUtils.getCurrentUserName();
        if (postedBy == null) postedBy = "Principal";
        
        Announcement created = announcementService.createAnnouncement(request, postedBy);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Map<String, Boolean>> markAsRead(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail();
        announcementService.markAsRead(id, email);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("read", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }
}
