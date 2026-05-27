package com.restoorderhub.backend.model.dto.request;

import com.restoorderhub.backend.model.enums.OrderType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {
    @NotNull(message = "Restaurant ID is required")
    private UUID restaurantId;

    private UUID reservationId;

    private UUID tableId;

    @NotNull(message = "Order type is required")
    private OrderType orderType;

    private String notes;

    @NotNull(message = "Order items are required")
    private List<OrderItemRequest> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemRequest {
        @NotNull(message = "Menu item ID is required")
        private UUID menuItemId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        private String specialInstructions;
    }
}
