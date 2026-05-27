package com.restoorderhub.backend.repository;

import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.StaffAssignment;
import com.restoorderhub.backend.model.entity.User;
import com.restoorderhub.backend.model.enums.StaffPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffAssignmentRepository extends JpaRepository<StaffAssignment, UUID> {
    List<StaffAssignment> findByUser(User user);

    @Query("SELECT s FROM StaffAssignment s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH s.assignedBy " +
           "WHERE s.restaurant = :restaurant")
    List<StaffAssignment> findByRestaurant(@Param("restaurant") Restaurant restaurant);

    @Query("SELECT s FROM StaffAssignment s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH s.assignedBy " +
           "WHERE s.restaurant = :restaurant AND s.isActive = true")
    List<StaffAssignment> findByRestaurantAndIsActiveTrue(@Param("restaurant") Restaurant restaurant);

    List<StaffAssignment> findByUserAndIsActiveTrue(User user);

    List<StaffAssignment> findByRestaurantAndPosition(Restaurant restaurant, StaffPosition position);

    @Query("SELECT s FROM StaffAssignment s " +
           "LEFT JOIN FETCH s.user " +
           "LEFT JOIN FETCH s.assignedBy " +
           "WHERE s.id = :id")
    Optional<StaffAssignment> findByIdWithDetails(@Param("id") UUID id);
}