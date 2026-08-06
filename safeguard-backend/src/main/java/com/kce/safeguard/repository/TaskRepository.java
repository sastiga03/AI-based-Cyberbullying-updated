package com.kce.safeguard.repository;

import com.kce.safeguard.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByVisible(boolean visible);

    List<Task> findByVisibleAndTitleContainingIgnoreCase(boolean visible, String title);
}
