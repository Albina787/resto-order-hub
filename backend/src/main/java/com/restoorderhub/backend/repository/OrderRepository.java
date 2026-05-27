package com.restoorderhub.backend.repository;

import com.restoorderhub.backend.model.entity.Order;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.User;
import com.restoorderhub.backend.model.enums.OrderStatus;
import com.restoorderhub.backend.model.enums.OrderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.restaurant = :restaurant")
    List<Order> findByRestaurant(@Param("restaurant") Restaurant restaurant);
    
    Page<Order> findByRestaurant(Restaurant restaurant, Pageable pageable);

    List<Order> findByUser(User user);
    Page<Order> findByUser(User user, Pageable pageable);
    Page<Order> findByUserAndStatus(User user, OrderStatus status, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.restaurant = :restaurant AND o.status = :status")
    List<Order> findByRestaurantAndStatus(@Param("restaurant") Restaurant restaurant, @Param("status") OrderStatus status);
    
    Page<Order> findByRestaurantAndStatus(Restaurant restaurant, OrderStatus status, Pageable pageable);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByRestaurantAndCreatedAtBetween(Restaurant restaurant,
                                                    LocalDateTime start, LocalDateTime end);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems WHERE o.restaurant = :restaurant AND o.status IN :statuses")
    List<Order> findByRestaurantAndStatusIn(@Param("restaurant") Restaurant restaurant, @Param("statuses") List<OrderStatus> statuses);

    boolean existsByReservationIdAndOrderType(UUID reservationId, OrderType orderType);
}