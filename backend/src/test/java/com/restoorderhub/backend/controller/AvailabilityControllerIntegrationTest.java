package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.BaseIntegrationTest;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.RestaurantTable;
import com.restoorderhub.backend.model.enums.ReservationStatus;
import com.restoorderhub.backend.model.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Інтеграційні тести для AvailabilityController")
class AvailabilityControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Перевірка доступності повертає оптимальний столик")
    void checkAvailability() throws Exception {
        Restaurant restaurant = createTestRestaurant();
        RestaurantTable table = createTestTable(restaurant);

        mockMvc.perform(get("/api/v1/restaurants/" + restaurant.getId() + "/availability")
                        .param("date", LocalDate.now().plusDays(1).toString())
                        .param("time", "18:00:00")
                        .param("guestCount", "4")
                        .param("duration", "120"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.optimalTable.id").value(table.getId().toString()));
    }

    @Test
    @DisplayName("Доступні часові слоти повертаються масивом")
    void getAvailableTimeSlots() throws Exception {
        Restaurant restaurant = createTestRestaurant();
        createTestTable(restaurant);

        mockMvc.perform(get("/api/v1/restaurants/" + restaurant.getId() + "/availability/time-slots")
                        .param("date", LocalDate.now().plusDays(1).toString())
                        .param("guestCount", "2")
                        .param("duration", "120"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Зайнятий столик позначається як недоступний")
    void checkTableAvailability_WhenReserved() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        RestaurantTable table = createTestTable(restaurant);
        createTestReservation(restaurant, client.user(), table, ReservationStatus.CONFIRMED);

        mockMvc.perform(get("/api/v1/restaurants/" + restaurant.getId() + "/tables/" + table.getId() + "/availability")
                        .param("date", LocalDate.now().plusDays(1).toString())
                        .param("time", LocalTime.of(18, 30).toString())
                        .param("duration", "60"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(false));
    }
}
