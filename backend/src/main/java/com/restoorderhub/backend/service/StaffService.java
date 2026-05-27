package com.restoorderhub.backend.service;

import com.restoorderhub.backend.exception.ResourceNotFoundException;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.StaffAssignment;
import com.restoorderhub.backend.model.entity.User;
import com.restoorderhub.backend.repository.RestaurantRepository;
import com.restoorderhub.backend.repository.StaffAssignmentRepository;
import com.restoorderhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffAssignmentRepository staffAssignmentRepository;
    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<StaffAssignment> getStaffByRestaurant(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return staffAssignmentRepository.findByRestaurant(restaurant);
    }

    @Transactional(readOnly = true)
    public List<StaffAssignment> getActiveStaffByRestaurant(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return staffAssignmentRepository.findByRestaurantAndIsActiveTrue(restaurant);
    }

    @Transactional(readOnly = true)
    public StaffAssignment getStaffAssignmentById(UUID id) {
        return staffAssignmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Призначення персоналу", "id", id));
    }

    @Transactional
    public StaffAssignment assignStaff(UUID restaurantId, UUID userId, StaffAssignment assignment, UUID assignedBy) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Користувач", "id", userId));
        
        User assignedByUser = userRepository.findById(assignedBy)
                .orElseThrow(() -> new ResourceNotFoundException("Користувач", "id", assignedBy));

        assignment.setRestaurant(restaurant);
        assignment.setUser(user);
        assignment.setAssignedBy(assignedByUser);
        assignment.setIsActive(true);

        return staffAssignmentRepository.save(assignment);
    }

    @Transactional
    public void removeStaffAssignment(UUID id) {
        StaffAssignment assignment = staffAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Призначення персоналу", "id", id));
        staffAssignmentRepository.delete(assignment);
    }

    @Transactional
    public StaffAssignment deactivateStaffAssignment(UUID id) {
        StaffAssignment assignment = staffAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Призначення персоналу", "id", id));
        assignment.setIsActive(false);
        return staffAssignmentRepository.save(assignment);
    }

    @Transactional
    public StaffAssignment activateStaffAssignment(UUID id) {
        StaffAssignment assignment = staffAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Призначення персоналу", "id", id));
        assignment.setIsActive(true);
        return staffAssignmentRepository.save(assignment);
    }
}
