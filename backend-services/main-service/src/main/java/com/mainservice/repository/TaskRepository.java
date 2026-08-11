package com.mainservice.repository;

import com.mainservice.entity.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByVisible(boolean visible);
    List<Task> findByVisibleAndTitleContainingIgnoreCase(boolean visible, String title);
}
