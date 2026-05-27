package com.restoorderhub.backend.model.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class CallWaiterRequest {
    @NotNull
    private UUID restaurantId;
    @NotNull
    private UUID tableId;
    private String message;
}
