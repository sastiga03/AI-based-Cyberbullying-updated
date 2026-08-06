package com.kce.safeguard.controller;

import com.kce.safeguard.dto.CounselingSlotRequest;
import com.kce.safeguard.dto.CounselingApproveRequest;
import com.kce.safeguard.entity.CounselingSlot;
import com.kce.safeguard.service.CounselingSlotService;
import com.kce.safeguard.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/counseling-slots")
public class CounselingController {

    private final CounselingSlotService counselingSlotService;

    @Autowired
    public CounselingController(CounselingSlotService counselingSlotService) {
        this.counselingSlotService = counselingSlotService;
    }

    @GetMapping
    public ResponseEntity<List<CounselingSlot>> getSlots(
            @RequestParam(value = "all", required = false, defaultValue = "false") boolean all) {
        
        if (all) {
            return ResponseEntity.ok(counselingSlotService.getAllSlots());
        } else {
            String studentName = SecurityUtils.getCurrentUserName();
            if (studentName == null) studentName = "Harshini Sasti";
            return ResponseEntity.ok(counselingSlotService.getSlotsByStudent(studentName));
        }
    }

    @PostMapping
    public ResponseEntity<CounselingSlot> bookSlot(@Valid @RequestBody CounselingSlotRequest request) {
        String studentName = SecurityUtils.getCurrentUserName();
        if (studentName == null) studentName = "Harshini Sasti";
        
        CounselingSlot booked = counselingSlotService.bookSlot(request, studentName);
        return ResponseEntity.ok(booked);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('COUNSELOR', 'ADMIN')")
    public ResponseEntity<CounselingSlot> approveSlot(
            @PathVariable Long id,
            @Valid @RequestBody CounselingApproveRequest request) {
        CounselingSlot approved = counselingSlotService.approveSlot(id, request.getTimings());
        return ResponseEntity.ok(approved);
    }
}
