package com.mainservice.repository;

import com.mainservice.entity.CyberbullyingCase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CyberbullyingCaseRepository extends MongoRepository<CyberbullyingCase, String> {
    List<CyberbullyingCase> findByStatus(String status);
}
