package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/restaurants/{restaurantId}/analytics/overview")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Map<String, Object>> getRestaurantOverview(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(analyticsService.getRestaurantOverview(restaurantId));
    }

    @GetMapping("/restaurants/{restaurantId}/analytics/reservations")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Map<String, Object>> getReservationAnalytics(
            @PathVariable UUID restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getReservationAnalytics(restaurantId, startDate, endDate));
    }

    @GetMapping("/restaurants/{restaurantId}/analytics/orders")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Map<String, Object>> getOrderAnalytics(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(analyticsService.getOrderAnalytics(restaurantId));
    }

    @GetMapping("/restaurants/{restaurantId}/analytics/popular-items")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Map<String, Object>> getPopularItems(@PathVariable UUID restaurantId) {
        return ResponseEntity.ok(analyticsService.getPopularItems(restaurantId));
    }

    @GetMapping("/restaurants/{restaurantId}/analytics/occupancy")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Map<String, Object>> getOccupancyAnalytics(
            @PathVariable UUID restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(analyticsService.getOccupancyAnalytics(restaurantId, date));
    }

    @GetMapping("/analytics/network/overview")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Map<String, Object>> getNetworkOverview() {
        return ResponseEntity.ok(analyticsService.getNetworkOverview());
    }

    @GetMapping("/analytics/network/comparison")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Map<String, Object>> getNetworkComparison(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getNetworkComparison(startDate, endDate));
    }

    @GetMapping("/analytics/network/trends")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<Map<String, Object>> getNetworkTrends(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getNetworkTrends(days));
    }

    @GetMapping("/restaurants/{restaurantId}/analytics/revenue")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER')")
    public ResponseEntity<Map<String, Object>> getRevenueAnalytics(
            @PathVariable UUID restaurantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getRevenueAnalytics(restaurantId, startDate, endDate));
    }
}
