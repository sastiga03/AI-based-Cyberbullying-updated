package com.mainservice.controller;

import com.mainservice.entity.Announcement;
import com.mainservice.entity.AnnouncementReadStatus;
import com.mainservice.repository.AnnouncementRepository;
import com.mainservice.repository.AnnouncementReadStatusRepository;
import com.mainservice.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private AnnouncementReadStatusRepository readStatusRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAnnouncements() {
        String email = SecurityUtils.getCurrentUserEmail();
        List<Announcement> list = announcementRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        
        List<AnnouncementReadStatus> readStatuses = readStatusRepository.findByUserEmail(email);
        Set<String> readIds = new HashSet<>();
        for (AnnouncementReadStatus rs : readStatuses) {
            if (rs.isRead()) {
                readIds.add(rs.getAnnouncementId());
            }
        }

        for (Announcement a : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("title", a.getTitle());
            map.put("content", a.getContent());
            map.put("date", a.getDate());
            map.put("postedBy", a.getPostedBy());
            map.put("targetRole", a.getTargetRole());
            map.put("read", readIds.contains(a.getId()));
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        String postedBy = SecurityUtils.getCurrentUserName();
        if (postedBy == null) postedBy = "Principal";
        announcement.setPostedBy(postedBy);
        if (announcement.getDate() == null) {
            announcement.setDate(java.time.LocalDate.now());
        }
        Announcement saved = announcementRepository.save(announcement);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Map<String, Boolean>> markAsRead(@PathVariable String id) {
        String email = SecurityUtils.getCurrentUserEmail();
        Optional<AnnouncementReadStatus> existing = readStatusRepository.findByUserEmailAndAnnouncementId(email, id);
        if (existing.isPresent()) {
            AnnouncementReadStatus status = existing.get();
            status.setRead(true);
            readStatusRepository.save(status);
        } else {
            readStatusRepository.save(new AnnouncementReadStatus(email, id, true));
        }
        Map<String, Boolean> response = new HashMap<>();
        response.put("read", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }
}
