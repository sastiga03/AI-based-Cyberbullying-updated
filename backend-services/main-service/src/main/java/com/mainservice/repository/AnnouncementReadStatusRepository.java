package com.mainservice.repository;

import com.mainservice.entity.AnnouncementReadStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface AnnouncementReadStatusRepository extends MongoRepository<AnnouncementReadStatus, String> {
    Optional<AnnouncementReadStatus> findByUserEmailAndAnnouncementId(String userEmail, String announcementId);
    List<AnnouncementReadStatus> findByUserEmail(String userEmail);
    List<AnnouncementReadStatus> findByAnnouncementId(String announcementId);
}
