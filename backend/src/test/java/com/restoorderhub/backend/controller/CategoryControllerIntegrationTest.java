package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.BaseIntegrationTest;
import com.restoorderhub.backend.model.dto.request.CreateCategoryRequest;
import com.restoorderhub.backend.model.entity.Category;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Інтеграційні тести для CategoryController")
class CategoryControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Менеджер може створити категорію")
    void createCategory_AsManager() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        CreateCategoryRequest request = CreateCategoryRequest.builder()
                .name("Desserts")
                .description("Sweet dishes")
                .displayOrder(2)
                .restaurantId(restaurant.getId())
                .build();

        mockMvc.perform(post("/api/v1/categories")
                        .header("Authorization", "Bearer " + manager.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Desserts"))
                .andExpect(jsonPath("$.restaurantId").value(restaurant.getId().toString()));
    }

    @Test
    @DisplayName("Клієнт не може створити категорію")
    void createCategory_AsClient_Forbidden() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        CreateCategoryRequest request = CreateCategoryRequest.builder()
                .name("Soups")
                .restaurantId(restaurant.getId())
                .build();

        mockMvc.perform(post("/api/v1/categories")
                        .header("Authorization", "Bearer " + client.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Деактивація категорії змінює прапорець isActive")
    void deactivateCategory() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        Category category = createTestCategory(restaurant);

        mockMvc.perform(patch("/api/v1/categories/" + category.getId() + "/deactivate")
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    @DisplayName("Список категорій ресторану доступний публічно")
    void getCategoriesByRestaurant() throws Exception {
        Restaurant restaurant = createTestRestaurant();
        createTestCategory(restaurant);

        mockMvc.perform(get("/api/v1/categories/restaurant/" + restaurant.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
