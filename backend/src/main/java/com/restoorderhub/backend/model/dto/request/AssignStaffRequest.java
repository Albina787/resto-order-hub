package com.restoorderhub.backend.model.dto.request;

import com.restoorderhub.backend.model.enums.StaffPosition;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class AssignStaffRequest {
    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Position is required")
    private StaffPosition position;
}
