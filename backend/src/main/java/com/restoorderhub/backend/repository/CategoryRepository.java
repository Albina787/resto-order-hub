package com.restoorderhub.backend.repository;

import com.restoorderhub.backend.model.entity.Category;
import com.restoorderhub.backend.model.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByRestaurant(Restaurant restaurant);

    List<Category> findByRestaurantAndIsActiveTrue(Restaurant restaurant);

    List<Category> findByRestaurantOrderByDisplayOrder(Restaurant restaurant);
}