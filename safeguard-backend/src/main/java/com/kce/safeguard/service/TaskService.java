package com.kce.safeguard.service;

import com.kce.safeguard.dto.TaskRequest;
import com.kce.safeguard.entity.Task;
import com.kce.safeguard.exception.ResourceNotFoundException;
import com.kce.safeguard.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;

    @Autowired
    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> getActiveTasks() {
        return taskRepository.findByVisible(true);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> searchTasks(String title) {
        return taskRepository.findByVisibleAndTitleContainingIgnoreCase(true, title);
    }

    @Transactional
    public Task createTask(TaskRequest request, String teacherName) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDesc());
        task.setDueDate(request.getDueDate());
        task.setInstructor(teacherName);
        task.setVisible(request.isVisible());
        task.setFileUrl(request.getFileUrl());

        return taskRepository.save(task);
    }

    @Transactional
    public Task publishHiddenTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
        task.setVisible(true);
        return taskRepository.save(task);
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));
    }
}
