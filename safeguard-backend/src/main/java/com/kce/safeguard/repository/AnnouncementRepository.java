package com.kce.safeguard.repository;

import com.kce.safeguard.entity.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByTargetRoleIgnoreCaseOrTargetRoleIgnoreCase(String role1, String role2);
}
