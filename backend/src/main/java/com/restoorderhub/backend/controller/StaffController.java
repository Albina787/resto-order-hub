package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.exception.UnauthorizedException;
import com.restoorderhub.backend.model.dto.request.AssignStaffRequest;
import com.restoorderhub.backend.model.dto.response.StaffAssignmentResponse;
import com.restoorderhub.backend.model.entity.StaffAssignment;
import com.restoorderhub.backend.security.SecurityUtils;
import com.restoorderhub.backend.service.StaffService;
import com.restoorderhub.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<List<StaffAssignmentResponse>> getStaff(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(
                staffService.getStaffByRestaurant(restaurantId)
                        .stream().map(this::toResponse).toList());
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<List<StaffAssignmentResponse>> getActiveStaff(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(
                staffService.getActiveStaffByRestaurant(restaurantId)
                        .stream().map(this::toResponse).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<StaffAssignmentResponse> getStaffAssignment(@PathVariable UUID id) {
        return ResponseEntity.ok(toResponse(staffService.getStaffAssignmentById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<StaffAssignmentResponse> assignStaff(
            @PathVariable UUID restaurantId,
            @Valid @RequestBody AssignStaffRequest request) {
        UUID assignedBy = SecurityUtils.getCurrentUserEmail()
                .flatMap(userService::getUserByEmail)
                .map(user -> user.getId())
                .orElseThrow(() -> new UnauthorizedException("Не авторизовано"));

        StaffAssignment assignment = new StaffAssignment();
        assignment.setPosition(request.getPosition());

        StaffAssignment created = staffService.assignStaff(
                restaurantId, request.getUserId(), assignment, assignedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Void> removeStaffAssignment(@PathVariable UUID id) {
        staffService.removeStaffAssignment(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<StaffAssignmentResponse> deactivateStaff(@PathVariable UUID id) {
        return ResponseEntity.ok(toResponse(staffService.deactivateStaffAssignment(id)));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<StaffAssignmentResponse> activateStaff(@PathVariable UUID id) {
        return ResponseEntity.ok(toResponse(staffService.activateStaffAssignment(id)));
    }

    private StaffAssignmentResponse toResponse(StaffAssignment s) {
        var user       = s.getUser();
        var assignedBy = s.getAssignedBy();
        return StaffAssignmentResponse.builder()
                .id(s.getId())
                .userId(user != null ? user.getId() : null)
                .userFirstName(user != null ? user.getFirstName() : null)
                .userLastName(user != null ? user.getLastName() : null)
                .userEmail(user != null ? user.getEmail() : null)
                .userPhone(user != null ? user.getPhone() : null)
                .userAvatar(user != null ? user.getAvatar() : null)
                .restaurantId(s.getRestaurant() != null ? s.getRestaurant().getId() : null)
                .position(s.getPosition())
                .isActive(s.getIsActive())
                .assignedAt(s.getAssignedAt())
                .assignedById(assignedBy != null ? assignedBy.getId() : null)
                .assignedByName(assignedBy != null
                        ? assignedBy.getFirstName() + " " + assignedBy.getLastName()
                        : null)
                .build();
    }
}
