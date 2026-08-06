package com.kce.safeguard.repository;

import com.kce.safeguard.entity.AnnouncementReadStatus;
import com.kce.safeguard.entity.User;
import com.kce.safeguard.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface AnnouncementReadStatusRepository extends JpaRepository<AnnouncementReadStatus, Long> {

    Optional<AnnouncementReadStatus> findByUserAndAnnouncement(User user, Announcement announcement);

    List<AnnouncementReadStatus> findByUser(User user);
}
