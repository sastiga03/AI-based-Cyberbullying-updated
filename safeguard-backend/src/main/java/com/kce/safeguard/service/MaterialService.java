package com.kce.safeguard.service;

import com.kce.safeguard.dto.MaterialRequest;
import com.kce.safeguard.entity.Material;
import com.kce.safeguard.repository.MaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
public class MaterialService {

    private final MaterialRepository materialRepository;

    @Autowired
    public MaterialService(MaterialRepository materialRepository) {
        this.materialRepository = materialRepository;
    }

    public List<Material> getMaterials() {
        return materialRepository.findAllByOrderByIdDesc();
    }

    @Transactional
    public Material addMaterial(MaterialRequest request, String teacherName) {
        Material mat = new Material();
        mat.setTitle(request.getTitle());
        mat.setDescription(request.getDescription());
        mat.setTeacherName(teacherName);
        mat.setFileName(request.getFileName());
        mat.setFileUrl(request.getFileUrl());
        mat.setDate(LocalDate.now());

        return materialRepository.save(mat);
    }
}
