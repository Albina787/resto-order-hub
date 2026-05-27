package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.model.dto.request.CallWaiterRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/waiter-calls")
@Slf4j
public class WaiterCallController {

    // In-memory store for active calls (in production would use Redis/DB)
    private final ConcurrentHashMap<String, Map<String, Object>> activeCalls = new ConcurrentHashMap<>();

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> callWaiter(@Valid @RequestBody CallWaiterRequest request) {
        String callId = UUID.randomUUID().toString();
        Map<String, Object> call = new ConcurrentHashMap<>();
        call.put("id", callId);
        call.put("restaurantId", request.getRestaurantId().toString());
        call.put("tableId", request.getTableId().toString());
        call.put("message", request.getMessage() != null ? request.getMessage() : "Клієнт викликає офіціанта");
        call.put("status", "PENDING");
        call.put("createdAt", LocalDateTime.now().toString());

        activeCalls.put(callId, call);
        log.info("Waiter called for table {} in restaurant {}", request.getTableId(), request.getRestaurantId());

        return ResponseEntity.ok(call);
    }

    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasAnyRole('WAITER', 'MANAGER', 'OWNER')")
    public ResponseEntity<Collection<Map<String, Object>>> getActiveCalls(
            @PathVariable UUID restaurantId) {
        var calls = activeCalls.values().stream()
                .filter(c -> restaurantId.toString().equals(c.get("restaurantId")))
                .filter(c -> "PENDING".equals(c.get("status")))
                .toList();
        return ResponseEntity.ok(calls);
    }

    @PatchMapping("/{callId}/resolve")
    @PreAuthorize("hasAnyRole('WAITER', 'MANAGER', 'OWNER')")
    public ResponseEntity<Void> resolveCall(@PathVariable String callId) {
        Map<String, Object> call = activeCalls.get(callId);
        if (call != null) {
            call.put("status", "RESOLVED");
            activeCalls.remove(callId);
        }
        return ResponseEntity.noContent().build();
    }
}
