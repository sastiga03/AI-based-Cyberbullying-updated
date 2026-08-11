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
        String studentName = SecurityUtils.getCurrentUserName();
        if (studentName == null) studentName = "Harshini Sasti";
        
        CounselingSlot slot = new CounselingSlot();
        slot.setStudentName(studentName);
        slot.setRollNo("23CSE101"); // default
        slot.setDept(request.getDept() != null ? request.getDept() : "Computer Science & Engineering");
        slot.setReason(request.getReason());
        slot.setStatus("Pending");
        slot.setTimings("");
        slot.setCounselorName("Meena Jegan");

        CounselingSlot booked = slotRepository.save(slot);
        return ResponseEntity.ok(booked);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('COUNSELOR', 'ADMIN')")
    public ResponseEntity<CounselingSlot> approveSlot(
            @PathVariable String id,
            @Valid @RequestBody CounselingApproveRequest request) {
        
        CounselingSlot slot = slotRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found with id: " + id));
        slot.setStatus("Approved");
        slot.setTimings(request.getTimings());
        slot.setCounselorName("Meena Jegan");

        CounselingSlot approved = slotRepository.save(slot);
        return ResponseEntity.ok(approved);
    }
}
