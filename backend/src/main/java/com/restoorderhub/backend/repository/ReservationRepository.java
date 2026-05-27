package com.restoorderhub.backend.repository;

import com.restoorderhub.backend.model.entity.Reservation;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.User;
import com.restoorderhub.backend.model.enums.ReservationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.restaurant WHERE r.restaurant = :restaurant")
    List<Reservation> findByRestaurant(@Param("restaurant") Restaurant restaurant);
    
    Page<Reservation> findByRestaurant(Restaurant restaurant, Pageable pageable);

    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.restaurant WHERE r.user = :user")
    List<Reservation> findByUser(@Param("user") User user);
    
    @Query(value = "SELECT r FROM Reservation r LEFT JOIN FETCH r.restaurant WHERE r.user = :user",
           countQuery = "SELECT COUNT(r) FROM Reservation r WHERE r.user = :user")
    Page<Reservation> findByUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.restaurant WHERE r.restaurant = :restaurant AND r.reservationDate = :date")
    List<Reservation> findByRestaurantAndReservationDate(@Param("restaurant") Restaurant restaurant, @Param("date") LocalDate date);

    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.restaurant WHERE r.restaurant = :restaurant AND r.status = :status")
    List<Reservation> findByRestaurantAndStatus(@Param("restaurant") Restaurant restaurant, @Param("status") ReservationStatus status);
    
    Page<Reservation> findByRestaurantAndStatus(Restaurant restaurant, ReservationStatus status, Pageable pageable);

    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.restaurant WHERE r.status = :status")
    List<Reservation> findByStatus(@Param("status") ReservationStatus status);

    @Query(value = "SELECT r FROM Reservation r LEFT JOIN FETCH r.restaurant WHERE r.user = :user AND r.status = :status",
           countQuery = "SELECT COUNT(r) FROM Reservation r WHERE r.user = :user AND r.status = :status")
    Page<Reservation> findByUserAndStatus(@Param("user") User user, @Param("status") ReservationStatus status, Pageable pageable);

    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.restaurant LEFT JOIN FETCH r.table WHERE r.id = :id")
    java.util.Optional<Reservation> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT r FROM Reservation r WHERE r.restaurant.id = :restaurantId AND r.reservationDate = :date AND r.status = :status")
    List<Reservation> findByRestaurantIdAndDateAndStatus(
            @Param("restaurantId") UUID restaurantId,
            @Param("date") LocalDate date,
            @Param("status") ReservationStatus status
    );

    @Query("SELECT r FROM Reservation r WHERE r.restaurant.id = :restaurantId AND r.reservationDate BETWEEN :startDate AND :endDate")
    List<Reservation> findByRestaurantIdAndDateBetween(
            @Param("restaurantId") UUID restaurantId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Reservation r WHERE r.table.id = :tableId AND r.reservationDate = :date AND r.status IN :statuses")
    List<Reservation> findByTableIdAndReservationDateAndStatusInForUpdate(
            @Param("tableId") UUID tableId,
            @Param("date") LocalDate date,
            @Param("statuses") List<ReservationStatus> statuses
    );

    @Query("SELECT r FROM Reservation r WHERE r.table.id = :tableId AND r.reservationDate = :date AND r.status IN :statuses")
    List<Reservation> findByTableIdAndReservationDateAndStatusIn(
            @Param("tableId") UUID tableId,
            @Param("date") LocalDate date,
            @Param("statuses") List<ReservationStatus> statuses
    );

    @Query("SELECT DISTINCT r FROM Reservation r " +
           "LEFT JOIN FETCH r.preOrderItems poi " +
           "WHERE r.status = 'CONFIRMED' " +
           "AND SIZE(r.preOrderItems) > 0 " +
           "AND FUNCTION('TIMESTAMP', r.reservationDate, r.reservationTime) BETWEEN :startTime AND :endTime")
    List<Reservation> findUpcomingReservationsWithPreOrders(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}