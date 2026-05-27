package com.restoorderhub.backend.model.dto.request;

import com.restoorderhub.backend.model.enums.TableLocation;
import com.restoorderhub.backend.model.enums.TableShape;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTableRequest {

    @NotBlank(message = "Номер столика обов'язковий")
    private String tableNumber;

    @NotNull(message = "Місткість обов'язкова")
    @Min(value = 1, message = "Місткість повинна бути >= 1")
    @Max(value = 50, message = "Місткість повинна бути <= 50")
    private Integer capacity;

    @NotNull(message = "Мінімальна місткість обов'язкова")
    @Min(value = 1)
    private Integer minCapacity;

    @NotNull(message = "Максимальна місткість обов'язкова")
    @Min(value = 1)
    private Integer maxCapacity;

    private TableLocation location;
    private TableShape shape;
    private Integer positionX;
    private Integer positionY;
}
