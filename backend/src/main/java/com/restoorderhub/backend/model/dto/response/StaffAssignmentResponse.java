package com.restoorderhub.backend.model.dto.response;

import com.restoorderhub.backend.model.enums.StaffPosition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffAssignmentResponse {
    private UUID id;

    // User info
    private UUID userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
    private String userPhone;
    private String userAvatar;

    // Assignment info
    private UUID restaurantId;
    private StaffPosition position;
    private Boolean isActive;
    private LocalDateTime assignedAt;

    // Who assigned
    private UUID assignedById;
    private String assignedByName;
}
