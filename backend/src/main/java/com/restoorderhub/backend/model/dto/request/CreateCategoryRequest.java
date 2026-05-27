package com.restoorderhub.backend.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCategoryRequest {

    @NotBlank(message = "Назва категорії обов'язкова")
    @Size(min = 2, max = 50, message = "Назва повинна бути від 2 до 50 символів")
    private String name;

    @Size(max = 255, message = "Опис повинен бути до 255 символів")
    private String description;

    private String imageUrl;

    private Integer displayOrder;

    private UUID restaurantId;
}