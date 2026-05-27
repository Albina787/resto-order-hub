package com.restoorderhub.backend.service;

import com.restoorderhub.backend.exception.ResourceNotFoundException;
import com.restoorderhub.backend.model.dto.response.KitchenStatsResponse;
import com.restoorderhub.backend.model.entity.Order;
import com.restoorderhub.backend.model.entity.OrderItem;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.enums.OrderItemStatus;
import com.restoorderhub.backend.model.enums.OrderStatus;
import com.restoorderhub.backend.repository.OrderItemRepository;
import com.restoorderhub.backend.repository.OrderRepository;
import com.restoorderhub.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KitchenService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final RestaurantRepository restaurantRepository;

    /**
     * Отримати всі активні замовлення для кухні (CONFIRMED, PREPARING, READY)
     */
    @Transactional(readOnly = true)
    public List<Order> getActiveKitchenOrders(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));

        List<OrderStatus> activeStatuses = Arrays.asList(
                OrderStatus.CONFIRMED,
                OrderStatus.PREPARING,
                OrderStatus.READY
        );

        return orderRepository.findByRestaurantAndStatusIn(restaurant, activeStatuses);
    }

    /**
     * Отримати статистику кухні за поточний день
     */
    @Transactional(readOnly = true)
    public KitchenStatsResponse getKitchenStats(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));

        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        List<Order> todayOrders = orderRepository.findByRestaurantAndCreatedAtBetween(
                restaurant, startOfDay, endOfDay);

        // Підрахунок статистики
        long totalOrders = todayOrders.size();
        long completedOrders = todayOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED || o.getStatus() == OrderStatus.SERVED)
                .count();
        long activeOrders = todayOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CONFIRMED ||
                        o.getStatus() == OrderStatus.PREPARING ||
                        o.getStatus() == OrderStatus.READY)
                .count();

        // Середній час приготування (для завершених замовлень)
        double avgPreparationTime = todayOrders.stream()
                .filter(o -> o.getCompletedAt() != null)
                .mapToLong(o -> Duration.between(o.getCreatedAt(), o.getCompletedAt()).toMinutes())
                .average()
                .orElse(0.0);

        // Найпопулярніші страви за сьогодні
        Map<String, Long> popularItems = todayOrders.stream()
                .flatMap(o -> o.getOrderItems().stream())
                .collect(Collectors.groupingBy(
                        item -> item.getMenuItem().getName(),
                        Collectors.counting()
                ));

        List<KitchenStatsResponse.PopularItem> topItems = popularItems.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> new KitchenStatsResponse.PopularItem(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return KitchenStatsResponse.builder()
                .totalOrders(totalOrders)
                .completedOrders(completedOrders)
                .activeOrders(activeOrders)
                .averagePreparationTime(avgPreparationTime)
                .topItems(topItems)
                .build();
    }

    /**
     * Отримати всі позиції, які потребують приготування
     */
    @Transactional(readOnly = true)
    public List<OrderItem> getPendingItems(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));

        List<Order> activeOrders = getActiveKitchenOrders(restaurantId);

        return activeOrders.stream()
                .flatMap(order -> order.getOrderItems().stream())
                .filter(item -> item.getStatus() == OrderItemStatus.PENDING ||
                        item.getStatus() == OrderItemStatus.PREPARING)
                .sorted(Comparator.comparing(OrderItem::getCreatedAt))
                .collect(Collectors.toList());
    }

    /**
     * Масове оновлення статусу позицій
     */
    @Transactional
    public void bulkUpdateItemStatus(List<UUID> itemIds, OrderItemStatus newStatus) {
        List<OrderItem> items = orderItemRepository.findAllById(itemIds);

        if (items.size() != itemIds.size()) {
            throw new ResourceNotFoundException("Деякі позиції не знайдено");
        }

        items.forEach(item -> item.setStatus(newStatus));
        orderItemRepository.saveAll(items);

        // Оновити статуси замовлень
        items.stream()
                .map(OrderItem::getOrder)
                .distinct()
                .forEach(this::autoUpdateOrderStatus);
    }

    /**
     * Позначити всі позиції замовлення як готові
     */
    @Transactional
    public Order markAllItemsReady(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Замовлення не знайдено"));

        order.getOrderItems().forEach(item -> {
            if (item.getStatus() != OrderItemStatus.SERVED) {
                item.setStatus(OrderItemStatus.READY);
            }
        });

        orderItemRepository.saveAll(order.getOrderItems());
        autoUpdateOrderStatus(order);

        return orderRepository.findById(orderId).orElseThrow();
    }

    /**
     * Автоматичне оновлення статусу замовлення на основі статусів позицій
     */
    private void autoUpdateOrderStatus(Order order) {
        List<OrderItem> items = order.getOrderItems();
        if (items.isEmpty()) return;

        boolean allServed = items.stream().allMatch(i -> i.getStatus() == OrderItemStatus.SERVED);
        boolean allReady = items.stream().allMatch(i ->
                i.getStatus() == OrderItemStatus.READY || i.getStatus() == OrderItemStatus.SERVED);
        boolean anyPreparing = items.stream().anyMatch(i -> i.getStatus() == OrderItemStatus.PREPARING);

        if (allServed) {
            order.setStatus(OrderStatus.SERVED);
        } else if (allReady) {
            order.setStatus(OrderStatus.READY);
        } else if (anyPreparing) {
            order.setStatus(OrderStatus.PREPARING);
        }

        orderRepository.save(order);
    }

    /**
     * Отримати час очікування для замовлення
     */
    public long getWaitingTime(Order order) {
        return Duration.between(order.getCreatedAt(), LocalDateTime.now()).toMinutes();
    }

    /**
     * Отримати критичні замовлення (очікують більше 30 хвилин)
     */
    @Transactional(readOnly = true)
    public List<Order> getCriticalOrders(UUID restaurantId) {
        List<Order> activeOrders = getActiveKitchenOrders(restaurantId);
        LocalDateTime thirtyMinutesAgo = LocalDateTime.now().minusMinutes(30);

        return activeOrders.stream()
                .filter(order -> order.getCreatedAt().isBefore(thirtyMinutesAgo))
                .filter(order -> order.getStatus() != OrderStatus.READY)
                .sorted(Comparator.comparing(Order::getCreatedAt))
                .collect(Collectors.toList());
    }
}
