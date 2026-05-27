package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.BaseIntegrationTest;
import com.restoorderhub.backend.model.entity.Order;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.enums.OrderStatus;
import com.restoorderhub.backend.model.enums.OrderType;
import com.restoorderhub.backend.model.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Інтеграційні тести для KitchenController")
class KitchenControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Кухар бачить активні замовлення ресторану")
    void getActiveOrders_AsChef() throws Exception {
        TestUser chef = createAuthenticatedUser(UserRole.CHEF);
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        createTestOrder(restaurant, client.user(), null, null, OrderStatus.CONFIRMED, OrderType.DINE_IN);
        createTestOrder(restaurant, client.user(), null, null, OrderStatus.PREPARING, OrderType.DINE_IN);
        createTestOrder(restaurant, client.user(), null, null, OrderStatus.CANCELLED, OrderType.DINE_IN);

        mockMvc.perform(get("/api/v1/kitchen/orders")
                        .header("Authorization", "Bearer " + chef.token())
                        .param("restaurantId", restaurant.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("Клієнт не має доступу до кухонного списку замовлень")
    void getActiveOrders_AsClient_Forbidden() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();

        mockMvc.perform(get("/api/v1/kitchen/orders")
                        .header("Authorization", "Bearer " + client.token())
                        .param("restaurantId", restaurant.getId().toString()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Кухар може змінити статус замовлення")
    void updateOrderStatus() throws Exception {
        TestUser chef = createAuthenticatedUser(UserRole.CHEF);
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        Order order = createTestOrder(restaurant, client.user(), null, null, OrderStatus.CONFIRMED, OrderType.DINE_IN);

        mockMvc.perform(patch("/api/v1/kitchen/orders/" + order.getId() + "/status")
                        .header("Authorization", "Bearer " + chef.token())
                        .param("status", OrderStatus.READY.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READY"));
    }
}
