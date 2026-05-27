package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.exception.ForbiddenException;
import com.restoorderhub.backend.mapper.OrderMapper;
import com.restoorderhub.backend.model.dto.request.CreateOrderRequest;
import com.restoorderhub.backend.model.dto.response.OrderResponse;
import com.restoorderhub.backend.model.entity.Order;
import com.restoorderhub.backend.model.entity.User;
import com.restoorderhub.backend.model.enums.OrderItemStatus;
import com.restoorderhub.backend.model.enums.OrderStatus;
import com.restoorderhub.backend.model.enums.UserRole;
import com.restoorderhub.backend.security.SecurityUtils;
import com.restoorderhub.backend.service.OrderService;
import com.restoorderhub.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;
    private final UserService userService;

    // Client: get own orders
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            @RequestParam(required = false) OrderStatus status,
            Pageable pageable) {
        User currentUser = getCurrentUser();
        Page<Order> orders;
        if (status != null) {
            orders = orderService.getOrdersByUserAndStatus(currentUser.getId(), status, pageable);
        } else {
            orders = orderService.getOrdersByUser(currentUser.getId(), pageable);
        }
        return ResponseEntity.ok(orders.map(orderMapper::toResponse));
    }

    // Staff: get orders for a restaurant
    @GetMapping("/restaurant/{restaurantId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'OWNER', 'WAITER', 'CHEF')")
    public ResponseEntity<List<OrderResponse>> getOrdersByRestaurant(
            @PathVariable UUID restaurantId,
            @RequestParam(required = false) OrderStatus status) {
        List<Order> orders = status != null
                ? orderService.getOrdersByRestaurantAndStatus(restaurantId, status)
                : orderService.getOrdersByRestaurant(restaurantId);
        return ResponseEntity.ok(orders.stream().map(orderMapper::toResponse).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID id) {
        return orderService.getOrderById(id)
                .map(order -> {
                    User currentUser = getCurrentUser();
                    if (currentUser.getRole() == UserRole.CLIENT &&
                            !order.getUser().getId().equals(currentUser.getId())) {
                        throw new ForbiddenException("Доступ заборонено");
                    }
                    return ResponseEntity.ok(orderMapper.toResponse(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENT', 'WAITER', 'MANAGER', 'OWNER')")
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        User currentUser = getCurrentUser();
        Order created = orderService.createOrderFromRequest(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(orderMapper.toResponse(created));
    }

    // Add items to existing order
    @PostMapping("/{id}/items")
    @PreAuthorize("hasAnyRole('CLIENT', 'WAITER', 'MANAGER', 'OWNER')")
    public ResponseEntity<OrderResponse> addOrderItems(
            @PathVariable UUID id,
            @Valid @RequestBody List<CreateOrderRequest.OrderItemRequest> items) {
        User currentUser = getCurrentUser();
        return orderService.getOrderById(id)
                .map(order -> {
                    if (currentUser.getRole() == UserRole.CLIENT &&
                            !order.getUser().getId().equals(currentUser.getId())) {
                        throw new ForbiddenException("Доступ заборонено");
                    }
                    Order updated = orderService.addOrderItems(id, items);
                    return ResponseEntity.ok(orderMapper.toResponse(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('WAITER', 'CHEF', 'MANAGER', 'OWNER')")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable UUID id,
            @RequestParam OrderStatus status) {
        return orderService.getOrderById(id)
                .map(o -> ResponseEntity.ok(orderMapper.toResponse(
                        orderService.updateOrderStatus(id, status))))
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/items/{itemId}/status")
    @PreAuthorize("hasAnyRole('CHEF', 'WAITER', 'MANAGER', 'OWNER')")
    public ResponseEntity<OrderResponse> updateOrderItemStatus(
            @PathVariable UUID id,
            @PathVariable UUID itemId,
            @RequestParam OrderItemStatus status) {
        Order updated = orderService.updateOrderItemStatus(id, itemId, status);
        return ResponseEntity.ok(orderMapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> cancelOrder(@PathVariable UUID id) {
        User currentUser = getCurrentUser();
        return orderService.getOrderById(id)
                .map(order -> {
                    if (currentUser.getRole() == UserRole.CLIENT &&
                            !order.getUser().getId().equals(currentUser.getId())) {
                        throw new ForbiddenException("Доступ заборонено");
                    }
                    orderService.cancelOrder(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private User getCurrentUser() {
        return SecurityUtils.getCurrentUserEmail()
                .flatMap(userService::getUserByEmail)
                .orElseThrow(() -> new com.restoorderhub.backend.exception.UnauthorizedException("Не авторизовано"));
    }
}
