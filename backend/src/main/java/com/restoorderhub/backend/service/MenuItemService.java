package com.restoorderhub.backend.service;

import com.restoorderhub.backend.exception.ResourceNotFoundException;
import com.restoorderhub.backend.model.entity.*;
import com.restoorderhub.backend.model.enums.SpicyLevel;
import com.restoorderhub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuItemService {
    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<MenuItem> getAllMenuItems(Pageable pageable) {
        return menuItemRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<MenuItem> getMenuItemById(UUID id) {
        return menuItemRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getMenuItemsByRestaurant(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return menuItemRepository.findByRestaurant(restaurant);
    }

    @Transactional(readOnly = true)
    public Page<MenuItem> getMenuItemsByRestaurant(UUID restaurantId, Pageable pageable) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return menuItemRepository.findByRestaurant(restaurant, pageable);
    }

    @Transactional(readOnly = true)
    public Page<MenuItem> getMenuItemsByCategory(UUID categoryId, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Категорію не знайдено"));
        return menuItemRepository.findByCategory(category, pageable);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getAvailableMenuItems(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return menuItemRepository.findByRestaurantAndAvailableTrue(restaurant);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getPopularMenuItems(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        return menuItemRepository.findByRestaurantAndPopularTrue(restaurant);
    }

    @Transactional(readOnly = true)
    public List<MenuItem> getMenuItemsByCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Категорію не знайдено"));
        return menuItemRepository.findByCategory(category);
    }

    @Transactional
    public MenuItem createMenuItem(UUID restaurantId, UUID categoryId, MenuItem menuItem) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан не знайдено"));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Категорію не знайдено"));

        menuItem.setRestaurant(restaurant);
        menuItem.setCategory(category);
        menuItem.setAvailable(true);

        return menuItemRepository.save(menuItem);
    }

    @Transactional
    public MenuItem updateMenuItem(UUID id, MenuItem updatedMenuItem) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Страва не знайдена"));

        menuItem.setName(updatedMenuItem.getName());
        menuItem.setDescription(updatedMenuItem.getDescription());
        menuItem.setPrice(updatedMenuItem.getPrice());
        menuItem.setImages(updatedMenuItem.getImages());
        menuItem.setIngredients(updatedMenuItem.getIngredients());
        menuItem.setAllergens(updatedMenuItem.getAllergens());
        menuItem.setIsVegetarian(updatedMenuItem.getIsVegetarian());
        menuItem.setIsVegan(updatedMenuItem.getIsVegan());
        menuItem.setIsGlutenFree(updatedMenuItem.getIsGlutenFree());
        menuItem.setSpicyLevel(updatedMenuItem.getSpicyLevel());
        menuItem.setPreparationTime(updatedMenuItem.getPreparationTime());
        menuItem.setCalories(updatedMenuItem.getCalories());
        menuItem.setAvailable(updatedMenuItem.getAvailable());
        menuItem.setPopular(updatedMenuItem.getPopular());
        menuItem.setDisplayOrder(updatedMenuItem.getDisplayOrder());

        return menuItemRepository.save(menuItem);
    }

    @Transactional
    public void toggleAvailability(UUID id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Страва не знайдена"));

        Boolean currentValue = menuItem.getAvailable();
        menuItem.setAvailable(currentValue == null || !currentValue);
        menuItemRepository.save(menuItem);
    }

    @Transactional
    public void togglePopular(UUID id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Страва не знайдена"));

        Boolean currentValue = menuItem.getPopular();
        menuItem.setPopular(currentValue != null && currentValue);
        menuItemRepository.save(menuItem);
    }

    @Transactional
    public void deleteMenuItem(UUID id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Страва не знайдена"));

        menuItemRepository.delete(menuItem);
    }
}