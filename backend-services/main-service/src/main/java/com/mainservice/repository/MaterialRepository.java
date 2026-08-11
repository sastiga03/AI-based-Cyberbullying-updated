package com.mainservice.repository;

import com.mainservice.entity.Material;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterialRepository extends MongoRepository<Material, String> {
    List<Material> findAllByOrderByIdDesc();
}
