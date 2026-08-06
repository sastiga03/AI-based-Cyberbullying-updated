package com.kce.safeguard.controller;

import com.kce.safeguard.dto.MaterialRequest;
import com.kce.safeguard.entity.Material;
import com.kce.safeguard.service.MaterialService;
import com.kce.safeguard.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/materials")
public class MaterialController {

    private final MaterialService materialService;

    @Autowired
    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping
    public ResponseEntity<List<Material>> getMaterials() {
        return ResponseEntity.ok(materialService.getMaterials());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Material> addMaterial(@Valid @RequestBody MaterialRequest request) {
        String teacherName = SecurityUtils.getCurrentUserName();
        if (teacherName == null) teacherName = "Prof. Anand Kumar";
        
        Material created = materialService.addMaterial(request, teacherName);
        return ResponseEntity.ok(created);
    }
}
