package com.restoorderhub.backend.service;

import com.restoorderhub.backend.model.entity.Reservation;
import com.restoorderhub.backend.model.entity.RestaurantTable;
import com.restoorderhub.backend.model.enums.ReservationStatus;
import com.restoorderhub.backend.repository.ReservationRepository;
import com.restoorderhub.backend.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TableAvailabilityService {

    private final RestaurantTableRepository tableRepository;
    private final ReservationRepository reservationRepository;
    private final WorkingHoursService workingHoursService;

    public List<RestaurantTable> getAvailableTables(
            UUID restaurantId,
            LocalDate date,
            LocalTime time,
            Integer guestCount,
            Integer duration) {

        List<RestaurantTable> allTables = tableRepository.findByRestaurantIdAndActiveTrue(restaurantId);

        List<RestaurantTable> suitableTables = allTables.stream()
                .filter(table -> table.getMinCapacity() <= guestCount && table.getMaxCapacity() >= guestCount)
                .collect(Collectors.toList());

        List<RestaurantTable> availableTables = new ArrayList<>();
        for (RestaurantTable table : suitableTables) {
            if (isTableAvailable(table.getId(), date, time, duration)) {
                availableTables.add(table);
            }
        }

        log.info("Found {} available tables for restaurant {} on {} at {}",
                availableTables.size(), restaurantId, date, time);

        return availableTables;
    }

    public boolean isTableAvailable(UUID tableId, LocalDate date, LocalTime time, Integer duration) {
        LocalDateTime requestedStart = LocalDateTime.of(date, time);
        LocalDateTime requestedEnd = requestedStart.plusMinutes(duration);

        List<Reservation> existingReservations = reservationRepository
                .findByTableIdAndReservationDateAndStatusIn(
                        tableId,
                        date,
                        List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED)
                );

        for (Reservation reservation : existingReservations) {
            LocalDateTime existingStart = LocalDateTime.of(
                    reservation.getReservationDate(),
                    reservation.getReservationTime()
            );
            LocalDateTime existingEnd = existingStart.plusMinutes(reservation.getDuration());

            if (isTimeOverlapping(requestedStart, requestedEnd, existingStart, existingEnd)) {
                log.debug("Table {} is not available - conflicts with reservation {}",
                        tableId, reservation.getId());
                return false;
            }
        }

        return true;
    }

    private boolean isTimeOverlapping(
            LocalDateTime start1, LocalDateTime end1,
            LocalDateTime start2, LocalDateTime end2) {
        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    public RestaurantTable findOptimalTable(
            UUID restaurantId,
            LocalDate date,
            LocalTime time,
            Integer guestCount,
            Integer duration,
            String preferredLocation) {

        List<RestaurantTable> availableTables = getAvailableTables(
                restaurantId, date, time, guestCount, duration);

        if (availableTables.isEmpty()) {
            log.warn("No available tables found for {} guests on {} at {}", guestCount, date, time);
            return null;
        }

        return availableTables.stream()
                .sorted((t1, t2) -> {
                    if (preferredLocation != null && t1.getLocation() != null && t2.getLocation() != null) {
                        boolean t1Matches = t1.getLocation().name().equalsIgnoreCase(preferredLocation);
                        boolean t2Matches = t2.getLocation().name().equalsIgnoreCase(preferredLocation);
                        if (t1Matches && !t2Matches) return -1;
                        if (!t1Matches && t2Matches) return 1;
                    }
                    int diff1 = Math.abs(t1.getCapacity() - guestCount);
                    int diff2 = Math.abs(t2.getCapacity() - guestCount);
                    if (diff1 != diff2) return Integer.compare(diff1, diff2);
                    return Integer.compare(t1.getCapacity(), t2.getCapacity());
                })
                .findFirst()
                .orElse(null);
    }

    public List<LocalTime> getAvailableTimeSlots(
            UUID restaurantId,
            LocalDate date,
            Integer guestCount,
            Integer duration) {

        List<LocalTime> availableSlots = new ArrayList<>();
        LocalTime startTime = LocalTime.of(10, 0);
        LocalTime endTime = LocalTime.of(22, 0);

        LocalTime currentTime = startTime;
        while (currentTime.isBefore(endTime)) {
            if (isRestaurantOpen(restaurantId, date, currentTime)) {
                List<RestaurantTable> tables = getAvailableTables(
                        restaurantId, date, currentTime, guestCount, duration);
                if (!tables.isEmpty()) {
                    availableSlots.add(currentTime);
                }
            }
            currentTime = currentTime.plusMinutes(30);
        }

        log.info("Found {} available time slots for {} guests on {}",
                availableSlots.size(), guestCount, date);

        return availableSlots;
    }

    public boolean isRestaurantOpen(UUID restaurantId, LocalDate date, LocalTime time) {
        return workingHoursService.isRestaurantOpen(restaurantId, date.getDayOfWeek(), time);
    }
}