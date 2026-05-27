package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.BaseIntegrationTest;
import com.restoorderhub.backend.model.entity.Category;
import com.restoorderhub.backend.model.entity.MenuItem;
import com.restoorderhub.backend.model.entity.Restaurant;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Інтеграційні тести для MenuItemController")
class MenuItemControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Створення страви з категорією працює")
    void createMenuItem() throws Exception {
        Restaurant restaurant = createTestRestaurant();
        Category category = createTestCategory(restaurant);
        MenuItem menuItem = MenuItem.builder()
                .name("Borscht")
                .description("Traditional soup")
                .price(new BigDecimal("180.00"))
                .preparationTime(15)
                .build();

        mockMvc.perform(post("/api/v1/menu-items")
                        .param("restaurantId", restaurant.getId().toString())
                        .param("categoryId", category.getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(menuItem)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Borscht"));
    }

    @Test
    @DisplayName("Оновлення ціни та опису страви працює")
    void updateMenuItem() throws Exception {
        Restaurant restaurant = createTestRestaurant();
        Category category = createTestCategory(restaurant);
        MenuItem menuItem = createTestMenuItem(restaurant, category);

        MenuItem update = MenuItem.builder()
                .name(menuItem.getName())
                .description("Updated description")
                .price(new BigDecimal("210.00"))
                .preparationTime(25)
                .available(true)
                .popular(false)
                .build();

        mockMvc.perform(put("/api/v1/menu-items/" + menuItem.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.price").value(210.00))
                .andExpect(jsonPath("$.description").value("Updated description"));
    }

    @Test
    @DisplayName("Toggle availability змінює прапорець доступності")
    void toggleAvailability() throws Exception {
        Restaurant restaurant = createTestRestaurant();
        Category category = createTestCategory(restaurant);
        MenuItem menuItem = createTestMenuItem(restaurant, category);

        mockMvc.perform(patch("/api/v1/menu-items/" + menuItem.getId() + "/toggle-availability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isAvailable").value(false));
    }

    @Test
    @DisplayName("Популярні страви повертаються по ресторану")
    void getPopularMenuItems() throws Exception {
        Restaurant restaurant = createTestRestaurant();
        Category category = createTestCategory(restaurant);
        MenuItem menuItem = createTestMenuItem(restaurant, category);
        menuItem.setPopular(true);
        menuItemRepository.saveAndFlush(menuItem);

        mockMvc.perform(get("/api/v1/menu-items/restaurant/" + restaurant.getId() + "/popular"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(menuItem.getId().toString()));
    }
}
