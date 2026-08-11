package com.mainservice.repository;

import com.mainservice.entity.Submission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubmissionRepository extends MongoRepository<Submission, String> {
    List<Submission> findByStudentName(String studentName);
    List<Submission> findByFlagStatus(String flagStatus);
    List<Submission> findByStudentNameAndFlagStatus(String studentName, String flagStatus);
}
