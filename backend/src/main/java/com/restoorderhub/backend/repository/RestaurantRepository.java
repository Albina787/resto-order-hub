package com.restoorderhub.backend.repository;

import com.restoorderhub.backend.model.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, UUID> {
    List<Restaurant> findByIsActiveTrue();
    List<Restaurant> findByOwnerId(UUID ownerId);
    List<Restaurant> findByCity(String city);
    
    @Query("SELECT r FROM Restaurant r WHERE r.isActive = true AND LOWER(r.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Restaurant> searchByName(String name);

    @Query("SELECT r FROM Restaurant r WHERE r.isActive = true " +
           "AND (:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:city IS NULL OR r.city = :city) " +
           "AND (:cuisineType IS NULL OR r.cuisineType = :cuisineType) " +
           "AND (:priceRange IS NULL OR r.priceRange = :priceRange)")
    org.springframework.data.domain.Page<Restaurant> findByFilters(
            String search, String city, String cuisineType, String priceRange,
            org.springframework.data.domain.Pageable pageable);
}