package com.mainservice.repository;

import com.mainservice.entity.CounselingSlot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CounselingSlotRepository extends MongoRepository<CounselingSlot, String> {
    List<CounselingSlot> findByStudentName(String studentName);
    List<CounselingSlot> findByCounselorName(String counselorName);
}
