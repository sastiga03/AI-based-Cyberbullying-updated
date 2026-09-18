package com.mainservice.controller;

import com.mainservice.dto.MaterialRequest;
import com.mainservice.entity.Material;
import com.mainservice.repository.MaterialRepository;
import com.mainservice.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
public class MaterialController {

    @Autowired
    private MaterialRepository materialRepository;

    @GetMapping
    public ResponseEntity<List<Material>> getMaterials() {
        return ResponseEntity.ok(materialRepository.findAllByOrderByIdDesc());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Material> addMaterial(@Valid @RequestBody MaterialRequest request) {
        String teacherName = SecurityUtils.getCurrentUserName();
        if (teacherName == null) teacherName = "Prof. Anand Kumar";
        
        Material m = new Material();
        m.setTitle(request.getTitle());
        m.setDescription(request.getDescription());
        m.setTeacherName(teacherName);
        m.setFileName(request.getFileName());
        m.setFileUrl(request.getFileUrl());
        m.setDate(LocalDate.now());
        m.setDept(request.getDept() != null ? request.getDept() : "Computer Science & Engineering");
        m.setSubject(request.getSubject());

        Material saved = materialRepository.save(m);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Void> deleteMaterial(@PathVariable String id) {
        if (materialRepository.existsById(id)) {
            materialRepository.deleteById(id);
        }
        return ResponseEntity.noContent().build();
    }
}
