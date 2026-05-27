package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.model.entity.FloorPlan;
import com.restoorderhub.backend.service.FloorPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/floor-plans")
@RequiredArgsConstructor
public class FloorPlanController {

    private final FloorPlanService floorPlanService;

    @GetMapping
    public ResponseEntity<List<FloorPlan>> getFloorPlans(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(floorPlanService.getActiveByRestaurant(restaurantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FloorPlan> getFloorPlan(@PathVariable UUID id) {
        return ResponseEntity.ok(floorPlanService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<FloorPlan> createFloorPlan(
            @PathVariable UUID restaurantId,
            @Valid @RequestBody FloorPlan floorPlan) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(floorPlanService.create(restaurantId, floorPlan));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<FloorPlan> updateFloorPlan(
            @PathVariable UUID id,
            @Valid @RequestBody FloorPlan floorPlan) {
        return ResponseEntity.ok(floorPlanService.update(id, floorPlan));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Void> deleteFloorPlan(@PathVariable UUID id) {
        floorPlanService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
