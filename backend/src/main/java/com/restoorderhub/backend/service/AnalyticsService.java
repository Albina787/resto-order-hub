package com.restoorderhub.backend.service;

import com.restoorderhub.backend.exception.ResourceNotFoundException;
import com.restoorderhub.backend.model.entity.Order;
import com.restoorderhub.backend.model.entity.Reservation;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final RestaurantRepository restaurantRepository;
    private final ReservationRepository reservationRepository;
    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getRestaurantOverview(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));

        var allReservations = reservationRepository.findByRestaurant(restaurant);
        var allOrders       = orderRepository.findByRestaurant(restaurant);

        long totalReservations     = allReservations.size();
        long confirmedReservations = allReservations.stream()
                .filter(r -> r.getStatus() == com.restoorderhub.backend.model.enums.ReservationStatus.CONFIRMED).count();
        long completedReservations = allReservations.stream()
                .filter(r -> r.getStatus() == com.restoorderhub.backend.model.enums.ReservationStatus.COMPLETED).count();
        long cancelledReservations = allReservations.stream()
                .filter(r -> r.getStatus() == com.restoorderhub.backend.model.enums.ReservationStatus.CANCELLED).count();
        long noShowReservations    = allReservations.stream()
                .filter(r -> r.getStatus() == com.restoorderhub.backend.model.enums.ReservationStatus.NO_SHOW).count();

        long totalOrders = allOrders.size();
        var completedOrders = allOrders.stream()
                .filter(o -> o.getStatus() == com.restoorderhub.backend.model.enums.OrderStatus.COMPLETED)
                .toList();

        BigDecimal totalRevenue = completedOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageCheck = completedOrders.isEmpty() ? BigDecimal.ZERO :
                totalRevenue.divide(BigDecimal.valueOf(completedOrders.size()), 2, java.math.RoundingMode.HALF_UP);

        Map<String, Object> overview = new HashMap<>();
        overview.put("restaurantId",          restaurantId);
        overview.put("restaurantName",         restaurant.getName());
        overview.put("totalReservations",      totalReservations);
        overview.put("confirmedReservations",  confirmedReservations);
        overview.put("completedReservations",  completedReservations);
        overview.put("cancelledReservations",  cancelledReservations);
        overview.put("noShowReservations",     noShowReservations);
        overview.put("totalOrders",            totalOrders);
        overview.put("completedOrders",        completedOrders.size());
        overview.put("totalRevenue",           totalRevenue);
        overview.put("averageCheck",           averageCheck);
        return overview;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReservationAnalytics(UUID restaurantId, LocalDate startDate, LocalDate endDate) {
        restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));

        var reservations = reservationRepository.findByRestaurantIdAndDateBetween(restaurantId, startDate, endDate);

        long total     = reservations.size();
        long confirmed = reservations.stream()
                .filter(r -> r.getStatus() == com.restoorderhub.backend.model.enums.ReservationStatus.CONFIRMED).count();
        long completed = reservations.stream()
                .filter(r -> r.getStatus() == com.restoorderhub.backend.model.enums.ReservationStatus.COMPLETED).count();
        long cancelled = reservations.stream()
                .filter(r -> r.getStatus() == com.restoorderhub.backend.model.enums.ReservationStatus.CANCELLED).count();
        long noShow    = reservations.stream()
                .filter(r -> r.getStatus() == com.restoorderhub.backend.model.enums.ReservationStatus.NO_SHOW).count();
        long pending   = reservations.stream()
                .filter(r -> r.getStatus() == com.restoorderhub.backend.model.enums.ReservationStatus.PENDING).count();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalReservations",     total);
        analytics.put("confirmedReservations", confirmed);
        analytics.put("completedReservations", completed);
        analytics.put("cancelledReservations", cancelled);
        analytics.put("noShowReservations",    noShow);
        analytics.put("pendingReservations",   pending);
        analytics.put("period", Map.of("start", startDate, "end", endDate));
        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOrderAnalytics(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));

        var allOrders = orderRepository.findByRestaurant(restaurant);
        var completedOrders = allOrders.stream()
                .filter(o -> o.getStatus() == com.restoorderhub.backend.model.enums.OrderStatus.COMPLETED)
                .toList();

        BigDecimal totalRevenue = completedOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgOrderValue = completedOrders.isEmpty() ? BigDecimal.ZERO :
                totalRevenue.divide(BigDecimal.valueOf(completedOrders.size()), 2, java.math.RoundingMode.HALF_UP);

        // Count by status
        long pending   = allOrders.stream().filter(o -> o.getStatus() == com.restoorderhub.backend.model.enums.OrderStatus.PENDING).count();
        long preparing = allOrders.stream().filter(o -> o.getStatus() == com.restoorderhub.backend.model.enums.OrderStatus.PREPARING).count();
        long ready     = allOrders.stream().filter(o -> o.getStatus() == com.restoorderhub.backend.model.enums.OrderStatus.READY).count();
        long served    = allOrders.stream().filter(o -> o.getStatus() == com.restoorderhub.backend.model.enums.OrderStatus.SERVED).count();
        long cancelled = allOrders.stream().filter(o -> o.getStatus() == com.restoorderhub.backend.model.enums.OrderStatus.CANCELLED).count();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalOrders",      allOrders.size());
        analytics.put("completedOrders",  completedOrders.size());
        analytics.put("pendingOrders",    pending);
        analytics.put("preparingOrders",  preparing);
        analytics.put("readyOrders",      ready);
        analytics.put("servedOrders",     served);
        analytics.put("cancelledOrders",  cancelled);
        analytics.put("totalRevenue",     totalRevenue);
        analytics.put("averageOrderValue", avgOrderValue);
        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPopularItems(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));

        // Get items ordered by order count (from order_items table)
        var popularMenuItems = menuItemRepository.findByRestaurantAndPopularTrue(restaurant);

        // Build response with name + count from order_items
        var items = popularMenuItems.stream()
                .map(item -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",    item.getId());
                    m.put("name",  item.getName());
                    m.put("price", item.getPrice());
                    m.put("count", 0); // will be enriched below
                    return m;
                })
                .collect(java.util.stream.Collectors.toList());

        // Count actual orders per item
        var orderItems = orderItemRepository.findAll().stream()
                .filter(oi -> oi.getMenuItem() != null
                        && oi.getMenuItem().getRestaurant().getId().equals(restaurantId))
                .collect(java.util.stream.Collectors.groupingBy(
                        oi -> oi.getMenuItem().getId(),
                        java.util.stream.Collectors.summingInt(
                                oi -> oi.getQuantity())));

        // Merge counts
        items.forEach(item -> {
            UUID id = (UUID) item.get("id");
            item.put("count", orderItems.getOrDefault(id, 0));
        });

        // Sort by count desc
        items.sort((a, b) -> Integer.compare((int) b.get("count"), (int) a.get("count")));

        Map<String, Object> result = new HashMap<>();
        result.put("items", items);
        result.put("count", items.size());
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getOccupancyAnalytics(UUID restaurantId, LocalDate date) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));

        var reservations = reservationRepository.findByRestaurantAndReservationDate(restaurant, date);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("date", date);
        analytics.put("totalReservations", reservations.size());
        analytics.put("restaurantCapacity", restaurant.getCapacity());
        
        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getNetworkOverview() {
        List<Restaurant> restaurants = restaurantRepository.findAll();

        long totalRestaurants = restaurants.size();
        long activeRestaurants = restaurants.stream().filter(Restaurant::getIsActive).count();

        List<Reservation> allReservations = reservationRepository.findAll();
        List<Order> allOrders = orderRepository.findAll();

        long totalReservationsCount = allReservations.size();
        long totalOrdersCount = allOrders.size();

        BigDecimal totalRevenue = allOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Map<String, Object>> restaurantStats = new ArrayList<>();

        for (Restaurant restaurant : restaurants) {
            Map<String, Object> stats = new HashMap<>();
            stats.put("id", restaurant.getId().toString());
            stats.put("name", restaurant.getName());

            long reservations = allReservations.stream()
                    .filter(r -> r.getRestaurant() != null && r.getRestaurant().getId().equals(restaurant.getId()))
                    .count();
            stats.put("reservations", reservations);

            List<Order> restaurantOrders = allOrders.stream()
                    .filter(o -> o.getRestaurant() != null && o.getRestaurant().getId().equals(restaurant.getId()))
                    .toList();
            stats.put("orders", restaurantOrders.size());

            BigDecimal revenue = restaurantOrders.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            stats.put("revenue", revenue);

            restaurantStats.add(stats);
        }

        long assignedOrders = restaurantStats.stream()
                .mapToLong(s -> ((Number) s.get("orders")).longValue())
                .sum();
        long orphanedOrders = totalOrdersCount - assignedOrders;

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalRestaurants", totalRestaurants);
        overview.put("activeRestaurants", activeRestaurants);
        overview.put("totalReservations", totalReservationsCount);
        overview.put("totalOrders", totalOrdersCount);
        overview.put("totalRevenue", totalRevenue);
        overview.put("restaurants", restaurantStats);
        if (orphanedOrders > 0) {
            overview.put("orphanedOrders", orphanedOrders);
        }

        return overview;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getNetworkComparison(LocalDate startDate, LocalDate endDate) {
        List<Restaurant> restaurants = restaurantRepository.findByIsActiveTrue();
        List<Map<String, Object>> comparison = new ArrayList<>();

        for (Restaurant restaurant : restaurants) {
            var reservations = reservationRepository
                    .findByRestaurantIdAndDateBetween(restaurant.getId(), startDate, endDate);
            var orders = orderRepository.findByRestaurantAndCreatedAtBetween(
                    restaurant, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

            BigDecimal revenue = orders.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> stats = new HashMap<>();
            stats.put("restaurantId", restaurant.getId());
            stats.put("restaurantName", restaurant.getName());
            stats.put("reservations", reservations.size());
            stats.put("orders", orders.size());
            stats.put("revenue", revenue);
            stats.put("avgOrderValue", orders.isEmpty() ? BigDecimal.ZERO :
                    revenue.divide(BigDecimal.valueOf(orders.size()), 2, java.math.RoundingMode.HALF_UP));
            comparison.add(stats);
        }

        comparison.sort((a, b) ->
                ((BigDecimal) b.get("revenue")).compareTo((BigDecimal) a.get("revenue")));

        Map<String, Object> result = new HashMap<>();
        result.put("period", Map.of("start", startDate, "end", endDate));
        result.put("restaurants", comparison);
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getNetworkTrends(int days) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(days);

        List<Map<String, Object>> dailyTrends = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            final LocalDate d = date;
            var allReservations = reservationRepository.findAll().stream()
                    .filter(r -> r.getReservationDate().equals(d)).toList();
            var allOrders = orderRepository.findAll().stream()
                    .filter(o -> o.getCreatedAt().toLocalDate().equals(d)).toList();

            BigDecimal revenue = allOrders.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> day = new HashMap<>();
            day.put("date", d);
            day.put("reservations", allReservations.size());
            day.put("orders", allOrders.size());
            day.put("revenue", revenue);
            dailyTrends.add(day);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("days", days);
        result.put("trends", dailyTrends);
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRevenueAnalytics(UUID restaurantId, LocalDate startDate, LocalDate endDate) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));

        var orders = orderRepository.findByRestaurantAndCreatedAtBetween(
                restaurant, startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        BigDecimal totalRevenue = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal avgOrderValue = orders.isEmpty() ? BigDecimal.ZERO :
                totalRevenue.divide(BigDecimal.valueOf(orders.size()), 2, java.math.RoundingMode.HALF_UP);

        List<Map<String, Object>> daily = new ArrayList<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            final LocalDate d = date;
            var dayOrders = orders.stream()
                    .filter(o -> o.getCreatedAt().toLocalDate().equals(d)).toList();
            BigDecimal dayRevenue = dayOrders.stream()
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            daily.add(Map.of("date", d, "orders", dayOrders.size(), "revenue", dayRevenue));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("restaurantId", restaurantId);
        result.put("period", Map.of("start", startDate, "end", endDate));
        result.put("totalRevenue", totalRevenue);
        result.put("totalOrders", orders.size());
        result.put("avgOrderValue", avgOrderValue);
        result.put("daily", daily);
        return result;
    }
}
