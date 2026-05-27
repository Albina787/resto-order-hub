package com.restoorderhub.backend.model.dto.request;

import com.restoorderhub.backend.model.enums.PriceRange;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRestaurantRequest {

    @Size(min = 2, max = 255, message = "Назва повинна бути від 2 до 255 символів")
    private String name;

    @Size(max = 2000, message = "Опис не може перевищувати 2000 символів")
    private String description;

    @Size(max = 500, message = "Адреса не може перевищувати 500 символів")
    private String address;

    @Size(max = 100, message = "Місто не може перевищувати 100 символів")
    private String city;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Невірний формат номера телефону")
    private String phone;

    @Email(message = "Невірний формат email")
    private String email;

    @Size(max = 100)
    private String cuisineType;

    private PriceRange priceRange;

    @Min(value = 1, message = "Місткість повинна бути >= 1")
    private Integer capacity;

    private List<String> images;

    private Boolean isActive;
}
