package com.restoorderhub.backend.model.dto.response;

import com.restoorderhub.backend.model.enums.AuthProvider;
import com.restoorderhub.backend.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String avatar;
    private UserRole role;
    private Boolean isEmailVerified;
    private Boolean isActive;
    private AuthProvider authProvider;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
