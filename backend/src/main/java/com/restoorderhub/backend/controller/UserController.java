package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.model.dto.request.ChangePasswordRequest;
import com.restoorderhub.backend.model.dto.request.UpdateProfileRequest;
import com.restoorderhub.backend.model.dto.response.UserResponse;
import com.restoorderhub.backend.model.entity.User;
import com.restoorderhub.backend.model.enums.UserRole;
import com.restoorderhub.backend.security.SecurityUtils;
import com.restoorderhub.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUser() {
        return SecurityUtils.getCurrentUserEmail()
                .flatMap(userService::getUserByEmail)
                .map(user -> ResponseEntity.ok(toUserResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .isEmailVerified(user.getIsEmailVerified())
                .isActive(user.getIsActive())
                .authProvider(user.getAuthProvider())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> updateCurrentUser(@Valid @RequestBody UpdateProfileRequest request) {
        return SecurityUtils.getCurrentUserEmail()
                .flatMap(userService::getUserByEmail)
                .map(existing -> ResponseEntity.ok(toUserResponse(userService.updateProfile(existing.getId(), request))))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteCurrentUser() {
        SecurityUtils.getCurrentUserEmail()
                .flatMap(userService::getUserByEmail)
                .ifPresent(user -> userService.deactivateUser(user.getId()));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        SecurityUtils.getCurrentUserEmail()
                .flatMap(userService::getUserByEmail)
                .ifPresent(user -> userService.changePassword(user.getId(), request));
        return ResponseEntity.noContent().build();
    }

    // Admin-only endpoints
    @GetMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers().stream().map(this::toUserResponse).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return userService.getUserById(id)
                .map(u -> ResponseEntity.ok(toUserResponse(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable String role) {
        try {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            return ResponseEntity.ok(userService.getUsersByRole(userRole).stream().map(this::toUserResponse).toList());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID id) {
        if (userService.getUserById(id).isPresent()) {
            userService.deactivateUser(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<UserResponse> activateUser(@PathVariable UUID id) {
        if (userService.getUserById(id).isPresent()) {
            userService.activateUser(id);
            return userService.getUserById(id)
                    .map(u -> ResponseEntity.ok(toUserResponse(u)))
                    .orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.notFound().build();
    }
}