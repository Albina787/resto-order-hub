package com.restoorderhub.backend.service;

import com.restoorderhub.backend.exception.ResourceNotFoundException;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.WorkingHours;
import com.restoorderhub.backend.repository.RestaurantRepository;
import com.restoorderhub.backend.repository.WorkingHoursRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkingHoursService {

    private final WorkingHoursRepository workingHoursRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional(readOnly = true)
    public List<WorkingHours> getWorkingHoursByRestaurant(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return workingHoursRepository.findByRestaurant(restaurant);
    }

    @Transactional(readOnly = true)
    public Optional<WorkingHours> getWorkingHoursForDay(UUID restaurantId, DayOfWeek dayOfWeek) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return workingHoursRepository.findByRestaurantAndDayOfWeek(restaurant, dayOfWeek);
    }

    @Transactional
    public WorkingHours createOrUpdateWorkingHours(UUID restaurantId, DayOfWeek dayOfWeek, WorkingHours workingHours) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));

        Optional<WorkingHours> existing = workingHoursRepository.findByRestaurantAndDayOfWeek(restaurant, dayOfWeek);
        
        if (existing.isPresent()) {
            WorkingHours wh = existing.get();
            wh.setOpenTime(workingHours.getOpenTime());
            wh.setCloseTime(workingHours.getCloseTime());
            wh.setIsClosed(workingHours.getIsClosed());
            return workingHoursRepository.save(wh);
        } else {
            workingHours.setRestaurant(restaurant);
            workingHours.setDayOfWeek(dayOfWeek);
            return workingHoursRepository.save(workingHours);
        }
    }

    @Transactional
    public void deleteWorkingHours(UUID workingHoursId) {
        WorkingHours workingHours = workingHoursRepository.findById(workingHoursId)
                .orElseThrow(() -> new ResourceNotFoundException("Робочі години", "id", workingHoursId));
        workingHoursRepository.delete(workingHours);
    }

    @Transactional(readOnly = true)
    public boolean isRestaurantOpen(UUID restaurantId, DayOfWeek dayOfWeek, java.time.LocalTime time) {
        Optional<WorkingHours> opt = getWorkingHoursForDay(restaurantId, dayOfWeek);
        if (opt.isEmpty()) {
            return false;
        }
        WorkingHours wh = opt.get();
        if (wh.getIsClosed()) {
            return false;
        }
        return !time.isBefore(wh.getOpenTime()) && !time.isAfter(wh.getCloseTime());
    }
}