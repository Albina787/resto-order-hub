package com.restoorderhub.backend.model.dto.response;

import com.restoorderhub.backend.model.enums.TableLocation;
import com.restoorderhub.backend.model.enums.TableShape;
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
public class TableResponse {
    private UUID id;
    private UUID restaurantId;
    private String tableNumber;
    private Integer capacity;
    private Integer minCapacity;
    private Integer maxCapacity;
    private TableLocation location;
    private TableShape shape;
    private Integer positionX;
    private Integer positionY;
    private Boolean isActive;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
