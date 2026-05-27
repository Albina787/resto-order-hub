package com.restoorderhub.backend.service;

import com.restoorderhub.backend.exception.ResourceNotFoundException;
import com.restoorderhub.backend.model.entity.Category;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.repository.CategoryRepository;
import com.restoorderhub.backend.repository.RestaurantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;

    @Transactional(readOnly = true)
    public List<Category> getAllCategoriesByRestaurant(UUID restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        return categoryRepository.findByRestaurantOrderByDisplayOrder(restaurant);
    }

    @Transactional(readOnly = true)
    public Category getCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Категорія", "id", id));
    }

    @Transactional
    public Category createCategory(UUID restaurantId, Category category) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Ресторан", "id", restaurantId));
        
        category.setRestaurant(restaurant);
        category.setIsActive(true);
        
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(UUID id, Category updatedCategory) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Категорія", "id", id));

        category.setName(updatedCategory.getName());
        category.setDescription(updatedCategory.getDescription());
        category.setDisplayOrder(updatedCategory.getDisplayOrder());

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Категорія", "id", id));
        categoryRepository.delete(category);
    }

    @Transactional
    public Category activateCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Категорія", "id", id));
        category.setIsActive(true);
        return categoryRepository.save(category);
    }

    @Transactional
    public Category deactivateCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Категорія", "id", id));
        category.setIsActive(false);
        return categoryRepository.save(category);
    }
}
