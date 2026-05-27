package com.restoorderhub.backend.model.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 1, max = 100, message = "Ім'я має бути від 1 до 100 символів")
    private String firstName;

    @Size(min = 1, max = 100, message = "Прізвище має бути від 1 до 100 символів")
    private String lastName;

    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Невірний формат номера телефону")
    private String phone;

    private String avatar;
}
