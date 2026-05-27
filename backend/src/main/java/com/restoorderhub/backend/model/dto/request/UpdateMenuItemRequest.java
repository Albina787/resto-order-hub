package com.restoorderhub.backend.model.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMenuItemRequest {

    @NotBlank(message = "Назва страви обов'язкова")
    @Size(min = 2, max = 100, message = "Назва повинна бути від 2 до 100 символів")
    private String name;

    @Size(max = 500, message = "Опис повинен бути до 500 символів")
    private String description;

    @DecimalMin(value = "0.01", message = "Ціна повинна бути більше 0")
    private BigDecimal price;

    private List<String> images;

    private List<String> ingredients;

    private List<String> allergens;

    private Boolean isVegetarian;

    private Boolean isVegan;

    private Boolean isGlutenFree;

    private String spicyLevel;

    private Integer preparationTime;

    @Min(value = 0, message = "Калорійність не може бути від'ємною")
    private Integer calories;

    private Boolean isAvailable;

    private Boolean isPopular;

    private Integer displayOrder;

    private UUID categoryId;
}