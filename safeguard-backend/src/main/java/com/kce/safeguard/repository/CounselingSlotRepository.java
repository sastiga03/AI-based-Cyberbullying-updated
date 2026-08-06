package com.kce.safeguard.repository;

import com.kce.safeguard.entity.CounselingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CounselingSlotRepository extends JpaRepository<CounselingSlot, Long> {

    List<CounselingSlot> findByStudentName(String studentName);

    List<CounselingSlot> findByCounselorName(String counselorName);
}
