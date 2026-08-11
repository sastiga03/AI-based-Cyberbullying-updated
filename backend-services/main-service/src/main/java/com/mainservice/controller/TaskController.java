package com.mainservice.controller;

import com.mainservice.entity.Task;
import com.mainservice.repository.TaskRepository;
import com.mainservice.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping
    public ResponseEntity<List<Task>> getTasks(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "all", required = false, defaultValue = "false") boolean all) {
        if (all) {
            return ResponseEntity.ok(taskRepository.findAll());
        }
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(taskRepository.findByVisibleAndTitleContainingIgnoreCase(true, search));
        }
        return ResponseEntity.ok(taskRepository.findByVisible(true));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found with id: " + id));
        return ResponseEntity.ok(task);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        String teacherEmail = SecurityUtils.getCurrentUserEmail();
        String instructorName = "teacher";
        if (teacherEmail != null) {
            instructorName = teacherEmail.split("@")[0];
        } else {
            String teacherName = SecurityUtils.getCurrentUserName();
            if (teacherName != null) {
                instructorName = teacherName;
            }
        }
        task.setInstructor(instructorName);
        if (task.getDueDate() == null) {
            task.setDueDate(LocalDate.now().plusDays(7));
        }
        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Task> publishTask(@PathVariable String id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found with id: " + id));
        task.setVisible(true);
        Task saved = taskRepository.save(task);
        return ResponseEntity.ok(saved);
    }
}
