package com.restoorderhub.backend.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreOrderItemResponse {
    private UUID menuItemId;
    private String menuItemName;
    private BigDecimal price;
    private Integer quantity;
    private String specialInstructions;
}
