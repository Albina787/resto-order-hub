package com.restoorderhub.backend.repository;

import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, UUID> {
    List<RestaurantTable> findByRestaurant(Restaurant restaurant);

    List<RestaurantTable> findByRestaurantAndActiveTrue(Restaurant restaurant);

    List<RestaurantTable> findByRestaurantAndAvailableTrue(Restaurant restaurant);

    @Query("SELECT t FROM RestaurantTable t WHERE t.restaurant.id = :restaurantId AND t.capacity >= :minCapacity AND t.capacity <= :maxCapacity AND t.active = true")
    List<RestaurantTable> findAvailableTablesForCapacity(
            @Param("restaurantId") UUID restaurantId,
            @Param("minCapacity") Integer minCapacity,
            @Param("maxCapacity") Integer maxCapacity
    );

    @Query("SELECT t FROM RestaurantTable t WHERE t.restaurant.id = :restaurantId AND t.active = true ORDER BY t.tableNumber")
    List<RestaurantTable> findActiveByRestaurantId(@Param("restaurantId") UUID restaurantId);

    List<RestaurantTable> findByRestaurantIdAndActiveTrue(UUID restaurantId);
}