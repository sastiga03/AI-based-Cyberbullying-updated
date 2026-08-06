package com.kce.safeguard.service;

import com.kce.safeguard.dto.AnnouncementRequest;
import com.kce.safeguard.entity.Announcement;
import com.kce.safeguard.entity.AnnouncementReadStatus;
import com.kce.safeguard.entity.User;
import com.kce.safeguard.exception.ResourceNotFoundException;
import com.kce.safeguard.repository.AnnouncementRepository;
import com.kce.safeguard.repository.AnnouncementReadStatusRepository;
import com.kce.safeguard.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AnnouncementReadStatusRepository readStatusRepository;
    private final UserRepository userRepository;

    @Autowired
    public AnnouncementService(AnnouncementRepository announcementRepository,
                               AnnouncementReadStatusRepository readStatusRepository,
                               UserRepository userRepository) {
        this.announcementRepository = announcementRepository;
        this.readStatusRepository = readStatusRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> getAnnouncementsForUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        List<Announcement> announcements;
        if (user.getRole().equalsIgnoreCase("Admin") || user.getRole().equalsIgnoreCase("Principal")) {
            announcements = announcementRepository.findAll();
        } else {
            // Students see All + Student target role. Counselor sees All + Counselor. etc.
            announcements = announcementRepository.findByTargetRoleIgnoreCaseOrTargetRoleIgnoreCase("All", user.getRole());
        }

        // Fetch read statuses
        List<AnnouncementReadStatus> readStatuses = readStatusRepository.findByUser(user);
        Map<Long, Boolean> readMap = new HashMap<>();
        for (AnnouncementReadStatus status : readStatuses) {
            readMap.put(status.getAnnouncement().getId(), status.isRead());
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Announcement ann : announcements) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", ann.getId());
            map.put("title", ann.getTitle());
            map.put("content", ann.getContent());
            map.put("date", ann.getDate().toString());
            map.put("postedBy", ann.getPostedBy());
            map.put("targetRole", ann.getTargetRole());
            map.put("read", readMap.getOrDefault(ann.getId(), false));
            result.add(map);
        }

        return result;
    }

    @Transactional
    public Announcement createAnnouncement(AnnouncementRequest request, String postedBy) {
        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getDescription());
        announcement.setDate(LocalDate.now());
        announcement.setPostedBy(postedBy);
        announcement.setTargetRole(request.getTargetRole());

        return announcementRepository.save(announcement);
    }

    @Transactional
    public void markAsRead(Long announcementId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", announcementId));

        AnnouncementReadStatus status = readStatusRepository.findByUserAndAnnouncement(user, announcement)
                .orElseGet(() -> new AnnouncementReadStatus(user, announcement, false));

        status.setRead(true);
        readStatusRepository.save(status);
    }
}
