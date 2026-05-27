package com.restoorderhub.backend.model.dto.response;

import com.restoorderhub.backend.model.enums.SpicyLevel;
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
public class MenuItemResponse {
    private UUID id;
    private UUID restaurantId;
    private UUID categoryId;
    private String categoryName;
    private String name;
    private String description;
    private BigDecimal price;
    private List<String> images;
    private List<String> ingredients;
    private List<String> allergens;
    private Boolean isVegetarian;
    private Boolean isVegan;
    private Boolean isGlutenFree;
    private SpicyLevel spicyLevel;
    private Integer preparationTime;
    private Integer calories;
    private Boolean isAvailable;
    private Boolean isPopular;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
