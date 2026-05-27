package com.restoorderhub.backend.model.dto.response;

import com.restoorderhub.backend.model.enums.ConfirmationType;
import com.restoorderhub.backend.model.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponse {
    private UUID id;
    private UUID restaurantId;
    private String restaurantName;
    private UUID userId;
    private UUID tableId;
    private String tableNumber;
    private Integer guestCount;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private Integer duration;
    private ReservationStatus status;
    private ConfirmationType confirmationType;
    private String specialRequests;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime confirmedAt;
    private UUID confirmedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PreOrderItemResponse> preOrderItems;
}
