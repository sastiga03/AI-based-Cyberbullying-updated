package com.mainservice.controller;

import com.mainservice.dto.CounselingSlotRequest;
import com.mainservice.dto.CounselingApproveRequest;
import com.mainservice.entity.CounselingSlot;
import com.mainservice.repository.CounselingSlotRepository;
import com.mainservice.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/counseling-slots")
public class CounselingController {

    @Autowired
    private CounselingSlotRepository slotRepository;

    @GetMapping
    public ResponseEntity<List<CounselingSlot>> getSlots(
            @RequestParam(value = "all", required = false, defaultValue = "false") boolean all) {
        
        if (all) {
            return ResponseEntity.ok(slotRepository.findAll());
        } else {
            String studentName = SecurityUtils.getCurrentUserName();
            if (studentName == null) studentName = "Harshini Sasti";
            return ResponseEntity.ok(slotRepository.findByStudentName(studentName));
        }
    }

    @PostMapping
    public ResponseEntity<CounselingSlot> bookSlot(@Valid @RequestBody CounselingSlotRequest request) {
        String studentName = request.getStudentName();
        if (studentName == null || studentName.trim().isEmpty()) {
            studentName = SecurityUtils.getCurrentUserName();
        }
        if (studentName == null || studentName.trim().isEmpty()) {
            studentName = "Harshini Sasti";
        }
        
        CounselingSlot slot = new CounselingSlot();
        slot.setStudentName(studentName);
        slot.setRollNo(request.getRollNo() != null && !request.getRollNo().trim().isEmpty() ? request.getRollNo() : "23CSE101");
        slot.setDept(request.getDept() != null && !request.getDept().trim().isEmpty() ? request.getDept() : "Computer Science & Engineering");
        slot.setReason(request.getReason());
        slot.setStatus("Pending");
        slot.setTimings("");
        slot.setCounselorName("Meena Jegan");

        CounselingSlot booked = slotRepository.save(slot);
        return ResponseEntity.ok(booked);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CounselingSlot> updateSlot(
            @PathVariable String id,
            @RequestBody CounselingSlot updatedSlot) {
        
        CounselingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found with id: " + id));
        if (updatedSlot.getStatus() != null) slot.setStatus(updatedSlot.getStatus());
        if (updatedSlot.getTimings() != null) slot.setTimings(updatedSlot.getTimings());
        if (updatedSlot.getReason() != null) slot.setReason(updatedSlot.getReason());
        if (updatedSlot.getDept() != null) slot.setDept(updatedSlot.getDept());
        if (updatedSlot.getRollNo() != null) slot.setRollNo(updatedSlot.getRollNo());
        if (updatedSlot.getCounselorName() != null) slot.setCounselorName(updatedSlot.getCounselorName());

        CounselingSlot saved = slotRepository.save(slot);
        return ResponseEntity.ok(saved);
    }
}
