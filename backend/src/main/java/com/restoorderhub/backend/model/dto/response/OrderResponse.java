package com.restoorderhub.backend.model.dto.response;

import com.restoorderhub.backend.model.enums.OrderStatus;
import com.restoorderhub.backend.model.enums.OrderType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private UUID id;
    private UUID restaurantId;
    private String restaurantName;
    private UUID reservationId;
    private UUID tableId;
    private String tableNumber;
    private UUID userId;
    private String orderNumber;
    private OrderType orderType;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private String notes;
    private UUID createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    private List<OrderItemResponse> items;
}
