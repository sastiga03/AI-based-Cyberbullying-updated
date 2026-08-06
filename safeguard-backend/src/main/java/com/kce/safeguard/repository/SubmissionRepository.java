package com.kce.safeguard.repository;

import com.kce.safeguard.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByStudentName(String studentName);

    List<Submission> findByFlagStatus(String flagStatus);

    List<Submission> findByStudentNameAndFlagStatus(String studentName, String flagStatus);
}
