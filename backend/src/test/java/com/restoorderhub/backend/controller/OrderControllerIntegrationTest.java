package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.BaseIntegrationTest;
import com.restoorderhub.backend.model.entity.Order;
import com.restoorderhub.backend.model.entity.Reservation;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.RestaurantTable;
import com.restoorderhub.backend.model.enums.OrderStatus;
import com.restoorderhub.backend.model.enums.OrderType;
import com.restoorderhub.backend.model.enums.ReservationStatus;
import com.restoorderhub.backend.model.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Інтеграційні тести для OrderController")
class OrderControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Створення DINE_IN замовлення працює")
    void createOrder() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();

        Order order = Order.builder()
                .notes("Near the window")
                .build();

        mockMvc.perform(post("/api/v1/orders")
                        .param("restaurantId", restaurant.getId().toString())
                        .param("userId", client.user().getId().toString())
                        .param("orderType", OrderType.DINE_IN.name())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(order)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.orderType").value("DINE_IN"));
    }

    @Test
    @DisplayName("Статус замовлення оновлюється")
    void updateOrderStatus() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        Order order = createTestOrder(restaurant, client.user(), null, null, OrderStatus.PENDING, OrderType.DINE_IN);

        mockMvc.perform(patch("/api/v1/orders/" + order.getId() + "/status")
                        .param("status", OrderStatus.CONFIRMED.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    @DisplayName("Пошук замовлення за номером працює")
    void getOrderByNumber() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        Order order = createTestOrder(restaurant, client.user(), null, null, OrderStatus.PENDING, OrderType.PRE_ORDER);

        mockMvc.perform(get("/api/v1/orders/number/" + order.getOrderNumber()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(order.getId().toString()));
    }

    @Test
    @DisplayName("Скасування замовлення повертає 204")
    void cancelOrder() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        RestaurantTable table = createTestTable(restaurant);
        Reservation reservation = createTestReservation(restaurant, client.user(), table, ReservationStatus.CONFIRMED);
        Order order = createTestOrder(restaurant, client.user(), table, reservation, OrderStatus.PENDING, OrderType.PRE_ORDER);

        mockMvc.perform(delete("/api/v1/orders/" + order.getId()))
                .andExpect(status().isNoContent());
    }

    // === Додаткові тести для повного покриття ===

    @Test
    @DisplayName("Отримання замовлення по ID - успішно")
    void getOrderById() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        Order order = createTestOrder(restaurant, client.user(), null, null, OrderStatus.PENDING, OrderType.DINE_IN);

        mockMvc.perform(get("/api/v1/orders/" + order.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(order.getId().toString()));
    }

    @Test
    @DisplayName("Отримання замовлень по ресторану - успішно")
    void getOrdersByRestaurant() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        createTestOrder(restaurant, client.user(), null, null, OrderStatus.PENDING, OrderType.DINE_IN);

        mockMvc.perform(get("/api/v1/orders/restaurant/" + restaurant.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Отримання замовлень по користувачу - успішно")
    void getOrdersByUser() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        createTestOrder(restaurant, client.user(), null, null, OrderStatus.PENDING, OrderType.DINE_IN);

        mockMvc.perform(get("/api/v1/orders/user/" + client.user().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Отримання замовлень по статусу - успішно")
    void getOrdersByStatus() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        createTestOrder(restaurant, client.user(), null, null, OrderStatus.PENDING, OrderType.DINE_IN);

        mockMvc.perform(get("/api/v1/orders/restaurant/" + restaurant.getId() + "/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Призначення столика до замовлення - успішно")
    void assignTableToOrder() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        RestaurantTable table = createTestTable(restaurant);
        Order order = createTestOrder(restaurant, client.user(), null, null, OrderStatus.PENDING, OrderType.DINE_IN);

        mockMvc.perform(patch("/api/v1/orders/" + order.getId() + "/assign-table")
                        .param("tableId", table.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.table").exists());
    }

    @Test
    @DisplayName("Оновлення статусу замовлення на COMPLETED - успішно")
    void updateOrderStatusToCompleted() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        Order order = createTestOrder(restaurant, client.user(), null, null, OrderStatus.SERVED, OrderType.DINE_IN);

        mockMvc.perform(patch("/api/v1/orders/" + order.getId() + "/status")
                        .param("status", OrderStatus.COMPLETED.name()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    @Test
    @DisplayName("Отримання неіснуючого замовлення - помилка 404")
    void getOrderById_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/orders/00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound());
    }
}
