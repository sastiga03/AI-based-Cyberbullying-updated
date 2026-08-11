package com.mainservice.repository;

import com.mainservice.entity.Announcement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnnouncementRepository extends MongoRepository<Announcement, String> {
    List<Announcement> findByTargetRoleIgnoreCaseOrTargetRoleIgnoreCase(String role1, String role2);
}
