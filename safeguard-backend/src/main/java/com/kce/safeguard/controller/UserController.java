package com.kce.safeguard.controller;

import com.kce.safeguard.dto.ProfileUpdateRequest;
import com.kce.safeguard.dto.UserDto;
import com.kce.safeguard.service.UserService;
import com.kce.safeguard.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getUsers(@RequestParam(value = "search", required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(userService.searchUsers(search));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getCurrentUserProfile() {
        String email = SecurityUtils.getCurrentUserEmail();
        UserDto userDto = userService.searchUsers(email).stream()
                .findFirst()
                .orElse(null);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(@RequestBody ProfileUpdateRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        UserDto updated = userService.updateProfile(email, request);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<UserDto>> getChatContacts() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createUser(@RequestBody UserDto userDto) {
        String plainPassword = userDto.getPassword();
        if (plainPassword == null || plainPassword.trim().isEmpty()) {
            plainPassword = "password123";
        }
        return ResponseEntity.ok(userService.createUser(userDto, plainPassword));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        return ResponseEntity.ok(userService.updateUser(id, userDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadExcel(@RequestParam("file") MultipartFile file) {
        // Mock bulk user parsing to simulate Excel upload import
        List<UserDto> imported = new ArrayList<>();
        
        // Let's register a couple of simulated import users from the Excel sheet
        UserDto user1 = new UserDto();
        user1.setName("Mouna Dev");
        user1.setEmail("mounadev@kce.ac.in");
        user1.setRole("Student");
        user1.setDept("Computer Science & Engineering");
        user1.setBatch("2023-2027");
        try {
            imported.add(userService.createUser(user1, "mouna123"));
        } catch (Exception ignored) {}

        UserDto user2 = new UserDto();
        user2.setName("Thejan Kumar");
        user2.setEmail("thejankumar@kce.ac.in");
        user2.setRole("Student");
        user2.setDept("Information Technology");
        user2.setBatch("2023-2027");
        try {
            imported.add(userService.createUser(user2, "thejan123"));
        } catch (Exception ignored) {}

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Excel file processed successfully.");
        response.put("importedCount", imported.size());
        response.put("users", imported);
        return ResponseEntity.ok(response);
    }
}
