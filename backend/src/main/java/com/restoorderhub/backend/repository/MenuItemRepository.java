package com.restoorderhub.backend.repository;

import com.restoorderhub.backend.model.entity.Category;
import com.restoorderhub.backend.model.entity.MenuItem;
import com.restoorderhub.backend.model.entity.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {
    List<MenuItem> findByRestaurant(Restaurant restaurant);
    Page<MenuItem> findByRestaurant(Restaurant restaurant, Pageable pageable);

    List<MenuItem> findByCategory(Category category);
    Page<MenuItem> findByCategory(Category category, Pageable pageable);

    List<MenuItem> findByRestaurantAndAvailableTrue(Restaurant restaurant);

    List<MenuItem> findByRestaurantAndPopularTrue(Restaurant restaurant);

    @Query("SELECT m FROM MenuItem m WHERE m.restaurant.id = :restaurantId AND m.category.id = :categoryId")
    List<MenuItem> findByRestaurantIdAndCategoryId(
            @Param("restaurantId") UUID restaurantId,
            @Param("categoryId") UUID categoryId
    );

    @Query("SELECT m FROM MenuItem m WHERE m.restaurant.id = :restaurantId AND m.available = true ORDER BY m.displayOrder")
    List<MenuItem> findAvailableByRestaurantId(@Param("restaurantId") UUID restaurantId);
}
