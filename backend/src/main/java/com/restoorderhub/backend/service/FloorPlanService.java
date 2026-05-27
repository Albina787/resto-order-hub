package com.restoorderhub.backend.service;

import com.restoorderhub.backend.exception.ResourceNotFoundException;
import com.restoorderhub.backend.model.entity.FloorPlan;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.repository.FloorPlanRepository;
import com.restoorderhub.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FloorPlanService {

    private final FloorPlanRepository floorPlanRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional(readOnly = true)
    public List<FloorPlan> getByRestaurant(UUID restaurantId) {
        Restaurant restaurant = getRestaurant(restaurantId);
        return floorPlanRepository.findByRestaurant(restaurant);
    }

    @Transactional(readOnly = true)
    public List<FloorPlan> getActiveByRestaurant(UUID restaurantId) {
        Restaurant restaurant = getRestaurant(restaurantId);
        return floorPlanRepository.findByRestaurantAndIsActiveTrue(restaurant);
    }

    @Transactional(readOnly = true)
    public FloorPlan getById(UUID id) {
        return floorPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("План залу", "id", id));
    }

    @Transactional
    public FloorPlan create(UUID restaurantId, FloorPlan floorPlan) {
        Restaurant restaurant = getRestaurant(restaurantId);
        floorPlan.setRestaurant(restaurant);
        floorPlan.setIsActive(true);
        return floorPlanRepository.save(floorPlan);
    }

    @Transactional
    public FloorPlan update(UUID id, FloorPlan updated) {
        FloorPlan existing = getById(id);
        existing.setName(updated.getName());
        existing.setWidth(updated.getWidth());
        existing.setHeight(updated.getHeight());
        if (updated.getBackgroundImage() != null) {
            existing.setBackgroundImage(updated.getBackgroundImage());
        }
        return floorPlanRepository.save(existing);
    }

    @Transactional
    public void delete(UUID id) {
        FloorPlan plan = getById(id);
        plan.setIsActive(false);
        floorPlanRepository.save(plan);
    }

    private Restaurant getRestaurant(UUID restaurantId) {
        return restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
    }
}
