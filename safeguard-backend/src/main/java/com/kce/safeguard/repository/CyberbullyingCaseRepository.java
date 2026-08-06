package com.kce.safeguard.repository;

import com.kce.safeguard.entity.CyberbullyingCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CyberbullyingCaseRepository extends JpaRepository<CyberbullyingCase, Long> {

    List<CyberbullyingCase> findByStatus(String status);
}
