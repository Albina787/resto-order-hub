package com.restoorderhub.backend.service;

import com.restoorderhub.backend.exception.ResourceNotFoundException;
import com.restoorderhub.backend.model.entity.*;
import com.restoorderhub.backend.model.enums.ReservationStatus;
import com.restoorderhub.backend.model.enums.OrderStatus;
import com.restoorderhub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantService {
    private final RestaurantRepository restaurantRepository;
    private final WorkingHoursRepository workingHoursRepository;
    private final RestaurantTableRepository tableRepository;
    private final FloorPlanRepository floorPlanRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final ReservationRepository reservationRepository;
    private final OrderRepository orderRepository;
    private final StaffAssignmentRepository staffAssignmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Restaurant> getAllRestaurants(Pageable pageable) {
        return restaurantRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Restaurant> searchRestaurants(String search, String city, String cuisineType, String priceRange, Pageable pageable) {
        return restaurantRepository.findByFilters(search, city, cuisineType, priceRange, pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Restaurant> getRestaurantById(UUID id) {
        return restaurantRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Restaurant> getActiveRestaurants() {
        return restaurantRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<Restaurant> getMyRestaurants() {
        User currentUser = getCurrentUser();
        
        // Якщо власник - повертаємо всі його ресторани
        if (currentUser.getRole() == com.restoorderhub.backend.model.enums.UserRole.OWNER) {
            return restaurantRepository.findByOwnerId(currentUser.getId());
        }
        
        // Якщо персонал - повертаємо ресторани з призначень
        List<StaffAssignment> assignments = staffAssignmentRepository.findByUserAndIsActiveTrue(currentUser);
        return assignments.stream()
                .map(StaffAssignment::getRestaurant)
                .distinct()
                .toList();
    }

    private User getCurrentUser() {
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new com.restoorderhub.backend.exception.UnauthorizedException("Користувач не авторизований");
        }
        
        String email = authentication.getName();
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("Користувач", "email", email));
    }

    @Transactional
    public Restaurant createRestaurant(Restaurant restaurant) {
        restaurant.setIsActive(true);
        return restaurantRepository.save(restaurant);
    }

    @Transactional
    public Restaurant updateRestaurant(UUID id, Restaurant updatedRestaurant) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", id));

        restaurant.setName(updatedRestaurant.getName());
        restaurant.setDescription(updatedRestaurant.getDescription());
        restaurant.setAddress(updatedRestaurant.getAddress());
        restaurant.setCity(updatedRestaurant.getCity());
        restaurant.setPhone(updatedRestaurant.getPhone());
        restaurant.setEmail(updatedRestaurant.getEmail());
        restaurant.setCuisineType(updatedRestaurant.getCuisineType());
        restaurant.setPriceRange(updatedRestaurant.getPriceRange());
        restaurant.setCapacity(updatedRestaurant.getCapacity());
        restaurant.setImages(updatedRestaurant.getImages());

        return restaurantRepository.save(restaurant);
    }

    @Transactional
    public void deactivateRestaurant(UUID id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", id));
        restaurant.setIsActive(false);
        restaurantRepository.save(restaurant);
    }

    @Transactional
    public void activateRestaurant(UUID id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", id));
        restaurant.setIsActive(true);
        restaurantRepository.save(restaurant);
    }

    @Transactional(readOnly = true)
    public List<WorkingHours> getWorkingHours(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return workingHoursRepository.findByRestaurant(restaurant);
    }

    @Transactional
    public WorkingHours updateWorkingHours(UUID restaurantId, DayOfWeek dayOfWeek, WorkingHours hours) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));

        Optional<WorkingHours> existing = workingHoursRepository.findByRestaurantAndDayOfWeek(restaurant, dayOfWeek);
        if (existing.isPresent()) {
            WorkingHours wh = existing.get();
            wh.setOpenTime(hours.getOpenTime());
            wh.setCloseTime(hours.getCloseTime());
            wh.setIsClosed(hours.getIsClosed());
            return workingHoursRepository.save(wh);
        } else {
            hours.setRestaurant(restaurant);
            hours.setDayOfWeek(dayOfWeek);
            return workingHoursRepository.save(hours);
        }
    }

    @Transactional(readOnly = true)
    public List<RestaurantTable> getTables(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return tableRepository.findByRestaurant(restaurant);
    }

    @Transactional(readOnly = true)
    public List<RestaurantTable> getAvailableTables(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return tableRepository.findByRestaurantAndAvailableTrue(restaurant);
    }

    @Transactional
    public RestaurantTable createTable(UUID restaurantId, RestaurantTable table) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        table.setRestaurant(restaurant);
        table.setActive(true);
        table.setAvailable(true);
        return tableRepository.save(table);
    }

    @Transactional(readOnly = true)
    public List<Category> getCategories(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return categoryRepository.findByRestaurantOrderByDisplayOrder(restaurant);
    }

    @Transactional
    public Category createCategory(UUID restaurantId, Category category) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        category.setRestaurant(restaurant);
        category.setIsActive(true);
        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getMenuItems(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return menuItemRepository.findByRestaurant(restaurant);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getAvailableMenuItems(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return menuItemRepository.findByRestaurantAndAvailableTrue(restaurant);
    }

    @Transactional
    public MenuItem createMenuItem(UUID restaurantId, UUID categoryId, MenuItem menuItem) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Категорія", "id", categoryId));

        menuItem.setRestaurant(restaurant);
        menuItem.setCategory(category);
        menuItem.setAvailable(true);
        return menuItemRepository.save(menuItem);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getRestaurantStats(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));

        Map<String, Object> stats = new HashMap<>();

        long totalTables = tableRepository.findByRestaurant(restaurant).size();
        long availableTables = tableRepository.findByRestaurantAndAvailableTrue(restaurant).size();

        long totalReservations = reservationRepository.findByRestaurant(restaurant).size();
        long confirmedReservations = reservationRepository.findByRestaurantAndStatus(restaurant, ReservationStatus.CONFIRMED).size();
        long completedReservations = reservationRepository.findByRestaurantAndStatus(restaurant, ReservationStatus.COMPLETED).size();

        long totalOrders = orderRepository.findByRestaurant(restaurant).size();
        long activeOrders = orderRepository.findByRestaurantAndStatus(restaurant, OrderStatus.PREPARING).size();
        long completedOrders = orderRepository.findByRestaurantAndStatus(restaurant, OrderStatus.COMPLETED).size();

        long totalStaff = staffAssignmentRepository.findByRestaurant(restaurant).size();

        stats.put("restaurantId", restaurant.getId());
        stats.put("restaurantName", restaurant.getName());
        stats.put("totalTables", totalTables);
        stats.put("availableTables", availableTables);
        stats.put("totalReservations", totalReservations);
        stats.put("confirmedReservations", confirmedReservations);
        stats.put("completedReservations", completedReservations);
        stats.put("totalOrders", totalOrders);
        stats.put("activeOrders", activeOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("totalStaff", totalStaff);

        return stats;
    }
}