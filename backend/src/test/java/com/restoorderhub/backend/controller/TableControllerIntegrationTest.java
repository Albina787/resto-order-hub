package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.BaseIntegrationTest;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.RestaurantTable;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Інтеграційні тести для TableController")
class TableControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Менеджер може створити столик")
    void createTable_AsManager() throws Exception {
        TestUser manager = createAuthenticatedUser(com.restoorderhub.backend.model.enums.UserRole.MANAGER);
        Restaurant restaurant = createTestRestaurant(manager.user());

        RestaurantTable table = RestaurantTable.builder()
                .tableNumber("A1")
                .capacity(4)
                .minCapacity(2)
                .maxCapacity(4)
                .build();

        mockMvc.perform(post("/api/v1/restaurants/" + restaurant.getId() + "/tables")
                        .header("Authorization", "Bearer " + manager.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(table)))
                .andDo(result -> {
                    if (result.getResponse().getStatus() >= 400) {
                        System.err.println("Error: " + result.getResponse().getStatus());
                        System.err.println("Body: " + result.getResponse().getContentAsString());
                    }
                })
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tableNumber").value("A1"));
    }

    @Test
    @DisplayName("Клієнт не може переглянути всі столики")
    void getAllTables_AsClient_Forbidden() throws Exception {
        TestUser manager = createAuthenticatedUser(com.restoorderhub.backend.model.enums.UserRole.MANAGER);
        TestUser client = createAuthenticatedUser(com.restoorderhub.backend.model.enums.UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant(manager.user());
        createTestTable(restaurant);

        mockMvc.perform(get("/api/v1/restaurants/" + restaurant.getId() + "/tables")
                        .header("Authorization", "Bearer " + client.token()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Публічний endpoint доступних столиків повертає масив")
    void getAvailableTables_Public() throws Exception {
        Restaurant restaurant = createTestRestaurant();
        createTestTable(restaurant);

        mockMvc.perform(get("/api/v1/restaurants/" + restaurant.getId() + "/tables/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Менеджер може змінити доступність столика")
    void updateTableStatus() throws Exception {
        TestUser manager = createAuthenticatedUser(com.restoorderhub.backend.model.enums.UserRole.MANAGER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        RestaurantTable table = createTestTable(restaurant);

        mockMvc.perform(patch("/api/v1/restaurants/" + restaurant.getId() + "/tables/" + table.getId() + "/status")
                        .header("Authorization", "Bearer " + manager.token())
                        .param("isAvailable", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isAvailable").value(false));
    }

    // === Додаткові тести для повного покриття ===

    @Test
    @DisplayName("Отримання столика по ID менеджером - успішно")
    void getTableById_AsManager() throws Exception {
        TestUser manager = createAuthenticatedUser(com.restoorderhub.backend.model.enums.UserRole.MANAGER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        RestaurantTable table = createTestTable(restaurant);

        mockMvc.perform(get("/api/v1/restaurants/" + restaurant.getId() + "/tables/" + table.getId())
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tableNumber").value(table.getTableNumber()));
    }

    @Test
    @DisplayName("Отримання неіснуючого столика - помилка 404")
    void getTableById_NotFound() throws Exception {
        TestUser manager = createAuthenticatedUser(com.restoorderhub.backend.model.enums.UserRole.MANAGER);
        Restaurant restaurant = createTestRestaurant(manager.user());

        mockMvc.perform(get("/api/v1/restaurants/" + restaurant.getId() + "/tables/00000000-0000-0000-0000-000000000000")
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Оновлення столика менеджером - успішно")
    void updateTable_AsManager() throws Exception {
        TestUser manager = createAuthenticatedUser(com.restoorderhub.backend.model.enums.UserRole.MANAGER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        RestaurantTable table = createTestTable(restaurant);

        RestaurantTable updatedData = RestaurantTable.builder()
                .tableNumber("B2")
                .capacity(6)
                .minCapacity(4)
                .maxCapacity(8)
                .build();

        mockMvc.perform(put("/api/v1/restaurants/" + restaurant.getId() + "/tables/" + table.getId())
                        .header("Authorization", "Bearer " + manager.token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(updatedData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tableNumber").value("B2"))
                .andExpect(jsonPath("$.capacity").value(6));
    }

    @Test
    @DisplayName("Видалення столика менеджером - успішно")
    void deleteTable_AsManager() throws Exception {
        TestUser manager = createAuthenticatedUser(com.restoorderhub.backend.model.enums.UserRole.MANAGER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        RestaurantTable table = createTestTable(restaurant);

        mockMvc.perform(delete("/api/v1/restaurants/" + restaurant.getId() + "/tables/" + table.getId())
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Деактивація столика менеджером - успішно")
    void deactivateTable_AsManager() throws Exception {
        TestUser manager = createAuthenticatedUser(com.restoorderhub.backend.model.enums.UserRole.MANAGER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        RestaurantTable table = createTestTable(restaurant);

        mockMvc.perform(patch("/api/v1/restaurants/" + restaurant.getId() + "/tables/" + table.getId() + "/deactivate")
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));
    }

    @Test
    @DisplayName("Активація столика менеджером - успішно")
    void activateTable_AsManager() throws Exception {
        TestUser manager = createAuthenticatedUser(com.restoorderhub.backend.model.enums.UserRole.MANAGER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        RestaurantTable table = createTestTable(restaurant);

        // Спочатку деактивуємо
        mockMvc.perform(patch("/api/v1/restaurants/" + restaurant.getId() + "/tables/" + table.getId() + "/deactivate")
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isOk());

        // Потім активуємо
        mockMvc.perform(patch("/api/v1/restaurants/" + restaurant.getId() + "/tables/" + table.getId() + "/activate")
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("Створення столика без авторизації - помилка 403")
    void createTable_Unauthorized() throws Exception {
        Restaurant restaurant = createTestRestaurant();
        RestaurantTable table = RestaurantTable.builder()
                .tableNumber("C1")
                .capacity(4)
                .minCapacity(2)
                .maxCapacity(4)
                .build();

        mockMvc.perform(post("/api/v1/restaurants/" + restaurant.getId() + "/tables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(table)))
                .andExpect(status().isForbidden()); // 403 замість 401 бо JWT filter повертає 403
    }

    @Test
    @DisplayName("Видалення столика клієнтом - помилка 403")
    void deleteTable_AsClient_Forbidden() throws Exception {
        TestUser manager = createAuthenticatedUser(com.restoorderhub.backend.model.enums.UserRole.MANAGER);
        TestUser client = createAuthenticatedUser(com.restoorderhub.backend.model.enums.UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant(manager.user());
        RestaurantTable table = createTestTable(restaurant);

        mockMvc.perform(delete("/api/v1/restaurants/" + restaurant.getId() + "/tables/" + table.getId())
                        .header("Authorization", "Bearer " + client.token()))
                .andExpect(status().isForbidden());
    }
}
