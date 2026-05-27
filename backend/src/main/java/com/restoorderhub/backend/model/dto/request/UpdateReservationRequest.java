package com.restoorderhub.backend.model.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateReservationRequest {

    @NotNull(message = "Кількість гостей обов'язкова")
    @Min(value = 1, message = "Мінімум 1 гість")
    private Integer guestCount;

    @NotNull(message = "Дата бронювання обов'язкова")
    @Future(message = "Дата бронювання повинна бути в майбутньому")
    private LocalDate reservationDate;

    @NotNull(message = "Час бронювання обов'язковий")
    private LocalTime reservationTime;

    private Integer duration;

    private String confirmationType;

    private String specialRequests;

    private String customerName;

    private String customerPhone;

    private String customerEmail;

    private UUID tableId;
}