package com.kce.safeguard.service;

import com.kce.safeguard.dto.CounselingSlotRequest;
import com.kce.safeguard.entity.CounselingSlot;
import com.kce.safeguard.exception.ResourceNotFoundException;
import com.kce.safeguard.repository.CounselingSlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CounselingSlotService {

    private final CounselingSlotRepository counselingSlotRepository;

    @Autowired
    public CounselingSlotService(CounselingSlotRepository counselingSlotRepository) {
        this.counselingSlotRepository = counselingSlotRepository;
    }

    public List<CounselingSlot> getAllSlots() {
        return counselingSlotRepository.findAll();
    }

    public List<CounselingSlot> getSlotsByStudent(String studentName) {
        return counselingSlotRepository.findByStudentName(studentName);
    }

    @Transactional
    public CounselingSlot bookSlot(CounselingSlotRequest request, String studentName) {
        CounselingSlot slot = new CounselingSlot();
        slot.setStudentName(studentName);
        slot.setRollNo(request.getRollNo() != null ? request.getRollNo() : "KCE101");
        slot.setDept(request.getDept() != null ? request.getDept() : "Computer Science & Engineering");
        slot.setReason(request.getReason());
        slot.setStatus("Pending");
        slot.setTimings("");
        slot.setCounselorName("Meena Jegan"); // Default counselor in Karpagam college mock data

        return counselingSlotRepository.save(slot);
    }

    @Transactional
    public CounselingSlot approveSlot(Long id, String timings) {
        CounselingSlot slot = counselingSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CounselingSlot", "id", id));
        slot.setStatus("Approved");
        slot.setTimings(timings);
        return counselingSlotRepository.save(slot);
    }
}
