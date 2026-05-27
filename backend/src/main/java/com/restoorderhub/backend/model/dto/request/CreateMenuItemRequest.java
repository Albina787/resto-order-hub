package com.restoorderhub.backend.model.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMenuItemRequest {
    @NotNull(message = "Restaurant ID is required")
    private UUID restaurantId;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    @NotBlank(message = "Menu item name is required")
    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    private List<String> images;
    private List<String> ingredients;
    private List<String> allergens;

    private Boolean isVegetarian = false;
    private Boolean isVegan = false;
    private Boolean isGlutenFree = false;

    private String spicyLevel = "NONE";

    @Min(value = 1, message = "Preparation time must be at least 1 minute")
    private Integer preparationTime;

    @Min(value = 0, message = "Calories cannot be negative")
    private Integer calories;

    private Integer displayOrder = 0;
}
