package com.restoorderhub.backend.repository;

import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.WorkingHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkingHoursRepository extends JpaRepository<WorkingHours, UUID> {
    List<WorkingHours> findByRestaurant(Restaurant restaurant);

    Optional<WorkingHours> findByRestaurantAndDayOfWeek(Restaurant restaurant, DayOfWeek dayOfWeek);
}