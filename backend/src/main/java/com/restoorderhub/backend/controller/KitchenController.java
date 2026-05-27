package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.mapper.OrderMapper;
import com.restoorderhub.backend.model.dto.response.KitchenStatsResponse;
import com.restoorderhub.backend.model.dto.response.OrderResponse;
import com.restoorderhub.backend.model.entity.Order;
import com.restoorderhub.backend.model.enums.OrderItemStatus;
import com.restoorderhub.backend.model.enums.OrderStatus;
import com.restoorderhub.backend.service.KitchenService;
import com.restoorderhub.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/kitchen")
@RequiredArgsConstructor
public class KitchenController {

    private final OrderService orderService;
    private final KitchenService kitchenService;
    private final OrderMapper orderMapper;

    @GetMapping("/orders")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'OWNER')")
    public ResponseEntity<List<OrderResponse>> getActiveOrders(@RequestParam UUID restaurantId) {
        List<Order> activeOrders = kitchenService.getActiveKitchenOrders(restaurantId);
        List<OrderResponse> responses = activeOrders.stream()
                .map(orderMapper::toResponse)
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/orders/critical")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'OWNER')")
    public ResponseEntity<List<OrderResponse>> getCriticalOrders(@RequestParam UUID restaurantId) {
        List<Order> criticalOrders = kitchenService.getCriticalOrders(restaurantId);
        List<OrderResponse> responses = criticalOrders.stream()
                .map(orderMapper::toResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'OWNER')")
    public ResponseEntity<OrderResponse> getOrderDetails(@PathVariable UUID orderId) {
        return orderService.getOrderById(orderId)
                .map(o -> ResponseEntity.ok(orderMapper.toResponse(o)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/orders/{orderId}/status")
    @PreAuthorize("hasAnyRole('WAITER', 'CHEF', 'MANAGER', 'OWNER')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderMapper.toResponse(orderService.updateOrderStatus(orderId, status)));
    }

    @PatchMapping("/orders/{orderId}/items/{itemId}/status")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'OWNER')")
    public ResponseEntity<OrderResponse> updateOrderItemStatus(
            @PathVariable UUID orderId,
            @PathVariable UUID itemId,
            @RequestParam OrderItemStatus status) {
        Order updated = orderService.updateOrderItemStatus(orderId, itemId, status);
        return ResponseEntity.ok(orderMapper.toResponse(updated));
    }

    @PostMapping("/orders/{orderId}/mark-all-ready")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'OWNER')")
    public ResponseEntity<OrderResponse> markAllItemsReady(@PathVariable UUID orderId) {
        Order updated = kitchenService.markAllItemsReady(orderId);
        return ResponseEntity.ok(orderMapper.toResponse(updated));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'OWNER')")
    public ResponseEntity<KitchenStatsResponse> getKitchenStats(@RequestParam UUID restaurantId) {
        return ResponseEntity.ok(kitchenService.getKitchenStats(restaurantId));
    }

    @PostMapping("/items/bulk-update")
    @PreAuthorize("hasAnyRole('CHEF', 'MANAGER', 'OWNER')")
    public ResponseEntity<Void> bulkUpdateItemStatus(
            @RequestBody BulkUpdateRequest request) {
        kitchenService.bulkUpdateItemStatus(request.getItemIds(), request.getStatus());
        return ResponseEntity.ok().build();
    }

    @lombok.Data
    public static class BulkUpdateRequest {
        private List<UUID> itemIds;
        private OrderItemStatus status;
    }
}
