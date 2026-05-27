package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.model.entity.RestaurantTable;
import com.restoorderhub.backend.service.TableAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}")
@RequiredArgsConstructor
public class AvailabilityController {

    private final TableAvailabilityService availabilityService;

    @GetMapping("/availability")
    public ResponseEntity<AvailabilityResponse> checkAvailability(
            @PathVariable UUID restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
            @RequestParam Integer guestCount,
            @RequestParam(defaultValue = "120") Integer duration) {

        List<RestaurantTable> availableTables = availabilityService.getAvailableTables(
                restaurantId, date, time, guestCount, duration);

        RestaurantTable optimalTable = availabilityService.findOptimalTable(
                restaurantId, date, time, guestCount, duration, null);

        AvailabilityResponse response = new AvailabilityResponse(
                !availableTables.isEmpty(),
                availableTables.size(),
                availableTables,
                optimalTable
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/availability/time-slots")
    public ResponseEntity<List<LocalTime>> getAvailableTimeSlots(
            @PathVariable UUID restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Integer guestCount,
            @RequestParam(defaultValue = "120") Integer duration) {

        List<LocalTime> timeSlots = availabilityService.getAvailableTimeSlots(
                restaurantId, date, guestCount, duration);

        return ResponseEntity.ok(timeSlots);
    }

    @GetMapping("/tables/{tableId}/availability")
    public ResponseEntity<Boolean> checkTableAvailability(
            @PathVariable UUID restaurantId,
            @PathVariable UUID tableId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time,
            @RequestParam(defaultValue = "120") Integer duration) {

        boolean isAvailable = availabilityService.isTableAvailable(tableId, date, time, duration);

        return ResponseEntity.ok(isAvailable);
    }

    // Inner DTO
    public record AvailabilityResponse(
            boolean available,
            int availableTablesCount,
            List<RestaurantTable> availableTables,
            RestaurantTable optimalTable
    ) {}
}
