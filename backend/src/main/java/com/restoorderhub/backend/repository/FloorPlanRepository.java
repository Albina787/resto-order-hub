package com.restoorderhub.backend.repository;

import com.restoorderhub.backend.model.entity.FloorPlan;
import com.restoorderhub.backend.model.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FloorPlanRepository extends JpaRepository<FloorPlan, UUID> {
    List<FloorPlan> findByRestaurant(Restaurant restaurant);

    List<FloorPlan> findByRestaurantAndIsActiveTrue(Restaurant restaurant);
}