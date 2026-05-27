package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.mapper.TableMapper;
import com.restoorderhub.backend.model.dto.request.CreateTableRequest;
import com.restoorderhub.backend.model.dto.response.TableResponse;
import com.restoorderhub.backend.model.entity.RestaurantTable;
import com.restoorderhub.backend.service.TableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/restaurants/{restaurantId}/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;
    private final TableMapper tableMapper;

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER', 'WAITER')")
    public ResponseEntity<List<TableResponse>> getAllTables(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(
                tableService.getAllTablesByRestaurant(restaurantId)
                        .stream().map(tableMapper::toResponse).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER', 'WAITER')")
    public ResponseEntity<TableResponse> getTableById(@PathVariable UUID id) {
        return ResponseEntity.ok(tableMapper.toResponse(tableService.getTableById(id)));
    }

    @GetMapping("/available")
    public ResponseEntity<List<TableResponse>> getAvailableTables(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(
                tableService.getAvailableTables(restaurantId)
                        .stream().map(tableMapper::toResponse).toList());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<TableResponse> createTable(
            @PathVariable UUID restaurantId,
            @Valid @RequestBody CreateTableRequest request) {
        RestaurantTable table = tableMapper.toEntity(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(tableMapper.toResponse(tableService.createTable(restaurantId, table)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<TableResponse> updateTable(
            @PathVariable UUID id,
            @Valid @RequestBody CreateTableRequest request) {
        RestaurantTable table = tableMapper.toEntity(request);
        return ResponseEntity.ok(tableMapper.toResponse(tableService.updateTable(id, table)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Void> deleteTable(@PathVariable UUID id) {
        tableService.deactivateTable(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER', 'WAITER')")
    public ResponseEntity<TableResponse> updateTableStatus(
            @PathVariable UUID id,
            @RequestParam Boolean isAvailable) {
        return ResponseEntity.ok(tableMapper.toResponse(tableService.updateTableStatus(id, isAvailable)));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<TableResponse> activateTable(@PathVariable UUID id) {
        return ResponseEntity.ok(tableMapper.toResponse(tableService.activateTable(id)));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<TableResponse> deactivateTable(@PathVariable UUID id) {
        return ResponseEntity.ok(tableMapper.toResponse(tableService.deactivateTable(id)));
    }
}
