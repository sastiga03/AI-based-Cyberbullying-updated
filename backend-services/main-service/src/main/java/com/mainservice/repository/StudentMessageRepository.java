package com.mainservice.repository;

import com.mainservice.entity.StudentMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentMessageRepository extends MongoRepository<StudentMessage, String> {
    List<StudentMessage> findAllByOrderByIdDesc();
}
