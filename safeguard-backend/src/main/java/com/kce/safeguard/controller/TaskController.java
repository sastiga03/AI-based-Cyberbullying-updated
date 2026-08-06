package com.kce.safeguard.controller;

import com.kce.safeguard.dto.TaskRequest;
import com.kce.safeguard.entity.Task;
import com.kce.safeguard.service.TaskService;
import com.kce.safeguard.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    @Autowired
    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<Task>> getTasks(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "all", required = false, defaultValue = "false") boolean all) {
        
        // Teachers see all tasks (including hidden ones), students see only active ones
        if (all) {
            return ResponseEntity.ok(taskService.getAllTasks());
        }
        
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(taskService.searchTasks(search));
        }
        
        return ResponseEntity.ok(taskService.getActiveTasks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskRequest request) {
        String teacherName = SecurityUtils.getCurrentUserName();
        if (teacherName == null) teacherName = "Prof. Anand Kumar";
        
        Task created = taskService.createTask(request, teacherName);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Task> publishTask(@PathVariable Long id) {
        Task published = taskService.publishHiddenTask(id);
        return ResponseEntity.ok(published);
    }
}
