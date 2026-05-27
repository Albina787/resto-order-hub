package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.exception.ForbiddenException;
import com.restoorderhub.backend.model.dto.request.CreateReservationRequest;
import com.restoorderhub.backend.model.dto.response.ReservationResponse;
import com.restoorderhub.backend.mapper.ReservationMapper;
import com.restoorderhub.backend.model.entity.Reservation;
import com.restoorderhub.backend.model.entity.User;
import com.restoorderhub.backend.model.enums.ReservationStatus;
import com.restoorderhub.backend.model.enums.UserRole;
import com.restoorderhub.backend.security.SecurityUtils;
import com.restoorderhub.backend.service.ReservationService;
import com.restoorderhub.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final ReservationMapper reservationMapper;
    private final UserService userService;

    // Client: get own reservations
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ReservationResponse>> getMyReservations(
            @RequestParam(required = false) ReservationStatus status,
            Pageable pageable) {
        User currentUser = getCurrentUser();
        Page<Reservation> reservations;
        if (status != null) {
            reservations = reservationService.getReservationsByUserAndStatus(currentUser.getId(), status, pageable);
        } else {
            reservations = reservationService.getReservationsByUser(currentUser.getId(), pageable);
        }
        return ResponseEntity.ok(reservations.map(reservationMapper::toResponse));
    }

    // Manager/Owner: get reservations for a restaurant
    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER', 'WAITER')")
    public ResponseEntity<List<ReservationResponse>> getReservationsByRestaurant(
            @PathVariable UUID restaurantId) {
        return ResponseEntity.ok(
                reservationService.getReservationsByRestaurant(restaurantId)
                        .stream().map(reservationMapper::toResponse).toList()
        );
    }

    @GetMapping("/restaurant/{restaurantId}/date/{date}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER', 'WAITER')")
    public ResponseEntity<List<ReservationResponse>> getReservationsByRestaurantAndDate(
            @PathVariable UUID restaurantId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(
                reservationService.getReservationsByRestaurantAndDate(restaurantId, date)
                        .stream().map(reservationMapper::toResponse).toList()
        );
    }

    @GetMapping("/restaurant/{restaurantId}/status/{status}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER', 'WAITER')")
    public ResponseEntity<List<ReservationResponse>> getReservationsByRestaurantAndStatus(
            @PathVariable UUID restaurantId,
            @PathVariable ReservationStatus status) {
        return ResponseEntity.ok(
                reservationService.getReservationsByRestaurantAndStatus(restaurantId, status)
                        .stream().map(reservationMapper::toResponse).toList()
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReservationResponse> getReservationById(@PathVariable UUID id) {
        return reservationService.getReservationById(id)
                .map(reservation -> {
                    User currentUser = getCurrentUser();
                    // Client can only see own reservations; staff can see all
                    if (currentUser.getRole() == UserRole.CLIENT &&
                            !reservation.getUser().getId().equals(currentUser.getId())) {
                        throw new ForbiddenException("Доступ заборонено");
                    }
                    return ResponseEntity.ok(reservationMapper.toResponse(reservation));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'MANAGER', 'OWNER')")
    public ResponseEntity<ReservationResponse> createReservation(
            @Valid @RequestBody CreateReservationRequest request) {
        User currentUser = getCurrentUser();
        Reservation reservation = reservationMapper.toEntity(request);

        Reservation created;
        if (request.getPreOrderItems() != null && !request.getPreOrderItems().isEmpty()) {
            created = reservationService.createReservationWithPreOrder(
                    reservation,
                    request.getRestaurantId(),
                    currentUser.getId(),
                    request.getPreOrderItems()
            );
        } else {
            created = reservationService.createReservation(reservation, request.getRestaurantId(), currentUser.getId());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(reservationMapper.toResponse(created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENT', 'MANAGER', 'OWNER')")
    public ResponseEntity<ReservationResponse> updateReservation(
            @PathVariable UUID id,
            @Valid @RequestBody CreateReservationRequest request) {
        User currentUser = getCurrentUser();
        return reservationService.getReservationById(id)
                .map(existing -> {
                    // Client can only update own reservations
                    if (currentUser.getRole() == UserRole.CLIENT &&
                            !existing.getUser().getId().equals(currentUser.getId())) {
                        throw new ForbiddenException("Доступ заборонено");
                    }
                    Reservation updated = reservationMapper.toEntity(request);
                    return ResponseEntity.ok(reservationMapper.toResponse(
                            reservationService.updateReservation(id, updated)));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason) {
        User currentUser = getCurrentUser();
        return reservationService.getReservationById(id)
                .map(existing -> {
                    if (currentUser.getRole() == UserRole.CLIENT &&
                            !existing.getUser().getId().equals(currentUser.getId())) {
                        throw new ForbiddenException("Доступ заборонено");
                    }
                    reservationService.cancelReservation(id, currentUser, reason);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Manager actions
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<ReservationResponse> confirmReservation(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        return reservationService.getReservationById(id)
                .map(r -> ResponseEntity.ok(reservationMapper.toResponse(
                        reservationService.confirmReservation(id, currentUser.getId()))))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<ReservationResponse> cancelReservationByManager(
            @PathVariable UUID id,
            @RequestParam(required = false) String reason) {
        User currentUser = getCurrentUser();
        return reservationService.getReservationById(id)
                .map(r -> ResponseEntity.ok(reservationMapper.toResponse(
                        reservationService.cancelReservation(id, currentUser, reason))))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER', 'WAITER')")
    public ResponseEntity<ReservationResponse> completeReservation(@PathVariable UUID id) {
        return reservationService.getReservationById(id)
                .map(r -> ResponseEntity.ok(reservationMapper.toResponse(
                        reservationService.completeReservation(id))))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/no-show")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<ReservationResponse> markNoShow(@PathVariable UUID id) {
        return reservationService.getReservationById(id)
                .map(r -> ResponseEntity.ok(reservationMapper.toResponse(
                        reservationService.markNoShow(id))))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/assign-table")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<ReservationResponse> assignTable(
            @PathVariable UUID id,
            @RequestParam UUID tableId) {
        return reservationService.getReservationById(id)
                .map(r -> ResponseEntity.ok(reservationMapper.toResponse(
                        reservationService.assignTable(id, tableId))))
                .orElse(ResponseEntity.notFound().build());
    }

    private User getCurrentUser() {
        return SecurityUtils.getCurrentUserEmail()
                .flatMap(userService::getUserByEmail)
                .orElseThrow(() -> new com.restoorderhub.backend.exception.UnauthorizedException("Не авторизовано"));
    }
}
