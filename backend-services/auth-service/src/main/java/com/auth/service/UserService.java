package com.auth.service;

import com.auth.dto.LoginRequest;
import com.auth.dto.LoginResponse;
import com.auth.dto.ProfileUpdateRequest;
import com.auth.dto.UserDto;
import com.auth.entity.User;
import com.auth.repository.UserRepository;
import com.auth.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Autowired
    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    public LoginResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email: " + loginRequest.getEmail()));

        return new LoginResponse(jwt, new UserDto(user));
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    public List<UserDto> searchUsers(String query) {
        return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query).stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + id));
        return new UserDto(user);
    }

    @Transactional
    public UserDto createUser(UserDto userDto, String plainPassword) {
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email Address already in use!");
        }

        User user = new User();
        user.setName(userDto.getName());
        user.setEmail(userDto.getEmail());
        user.setPassword(passwordEncoder.encode(plainPassword != null ? plainPassword : "password123"));
        user.setRole(userDto.getRole());
        user.setAge(userDto.getAge() != null ? userDto.getAge() : 20);
        user.setPhone(userDto.getPhone());
        user.setAddress(userDto.getAddress());
        user.setDept(userDto.getDept());
        user.setBatch(userDto.getBatch());
        user.setSubjects(userDto.getSubjects());
        user.setProfilePhotoUrl(userDto.getProfilePhotoUrl());

        User savedUser = userRepository.save(user);
        return new UserDto(savedUser);
    }

    @Transactional
    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + id));

        user.setName(userDto.getName());
        user.setEmail(userDto.getEmail());
        user.setRole(userDto.getRole());
        if (userDto.getAge() != null) user.setAge(userDto.getAge());
        if (userDto.getPhone() != null) user.setPhone(userDto.getPhone());
        if (userDto.getAddress() != null) user.setAddress(userDto.getAddress());
        if (userDto.getDept() != null) user.setDept(userDto.getDept());
        if (userDto.getBatch() != null) user.setBatch(userDto.getBatch());
        if (userDto.getSubjects() != null) user.setSubjects(userDto.getSubjects());
        if (userDto.getProfilePhotoUrl() != null) user.setProfilePhotoUrl(userDto.getProfilePhotoUrl());
        if (userDto.getPassword() != null && !userDto.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        User updatedUser = userRepository.save(user);
        return new UserDto(updatedUser);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + id));
        userRepository.delete(user);
    }

    @Transactional
    public UserDto updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email: " + email));

        if (request.getAge() != null) user.setAge(request.getAge());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getDept() != null) user.setDept(request.getDept());
        if (request.getBatch() != null) user.setBatch(request.getBatch());
        if (request.getSubjects() != null) user.setSubjects(request.getSubjects());
        if (request.getProfilePhotoUrl() != null) user.setProfilePhotoUrl(request.getProfilePhotoUrl());

        User updatedUser = userRepository.save(user);
        return new UserDto(updatedUser);
    }
}
