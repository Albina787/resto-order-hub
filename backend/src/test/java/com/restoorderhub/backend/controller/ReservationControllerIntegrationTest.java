package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.BaseIntegrationTest;
import com.restoorderhub.backend.model.entity.Reservation;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.RestaurantTable;
import com.restoorderhub.backend.model.enums.ConfirmationType;
import com.restoorderhub.backend.model.enums.ReservationStatus;
import com.restoorderhub.backend.model.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Інтеграційні тести для ReservationController")
class ReservationControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Створення бронювання може автоматично підтвердитись")
    void createReservation_AutoConfirmed() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        createTestTable(restaurant);

        Reservation reservation = Reservation.builder()
                .guestCount(4)
                .reservationDate(LocalDate.now().plusDays(1))
                .reservationTime(LocalTime.of(18, 0))
                .duration(120)
                .confirmationType(ConfirmationType.AUTO)
                .customerName("Client User")
                .customerPhone("+380501234567")
                .customerEmail(client.user().getEmail())
                .build();

        mockMvc.perform(post("/api/v1/reservations")
                        .param("restaurantId", restaurant.getId().toString())
                        .param("userId", client.user().getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(reservation)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.table").exists());
    }

    @Test
    @DisplayName("Бронювання менш ніж за годину відхиляється")
    void createReservation_TooSoon_BadRequest() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();

        Reservation reservation = Reservation.builder()
                .guestCount(2)
                .reservationDate(LocalDate.now())
                .reservationTime(LocalTime.now().plusMinutes(30))
                .duration(120)
                .confirmationType(ConfirmationType.AUTO)
                .customerName("Late Client")
                .customerPhone("+380501234567")
                .customerEmail(client.user().getEmail())
                .build();

        mockMvc.perform(post("/api/v1/reservations")
                        .param("restaurantId", restaurant.getId().toString())
                        .param("userId", client.user().getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(reservation)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Підтвердження бронювання менеджером працює")
    void confirmReservation() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        UserRole role = UserRole.CLIENT;
        TestUser client = createAuthenticatedUser(role);
        Restaurant restaurant = createTestRestaurant(manager.user());
        Reservation reservation = createTestReservation(restaurant, client.user());

        mockMvc.perform(patch("/api/v1/reservations/" + reservation.getId() + "/confirm")
                        .param("confirmedBy", manager.user().getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    @DisplayName("Бронювання користувача можна отримати списком")
    void getReservationsByUser() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        createTestReservation(restaurant, client.user(), null, ReservationStatus.PENDING);

        mockMvc.perform(get("/api/v1/reservations/user/" + client.user().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    // === Додаткові тести для повного покриття ===

    @Test
    @DisplayName("Скасування бронювання менеджером - успішно")
    void cancelReservation_AsManager() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant(manager.user());
        Reservation reservation = createTestReservation(restaurant, client.user(), null, ReservationStatus.CONFIRMED);

        mockMvc.perform(patch("/api/v1/reservations/" + reservation.getId() + "/cancel")
                        .param("reason", "Клієнт відмовився"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    @DisplayName("Призначення столика до бронювання - успішно")
    void assignTableToReservation() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant(manager.user());
        RestaurantTable table = createTestTable(restaurant);
        Reservation reservation = createTestReservation(restaurant, client.user(), null, ReservationStatus.CONFIRMED);

        mockMvc.perform(patch("/api/v1/reservations/" + reservation.getId() + "/assign-table")
                        .param("tableId", table.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.table").exists());
    }

    @Test
    @DisplayName("Отримання бронювання по ID - успішно")
    void getReservationById() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant();
        Reservation reservation = createTestReservation(restaurant, client.user());

        mockMvc.perform(get("/api/v1/reservations/" + reservation.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reservation.getId().toString()));
    }

    @Test
    @DisplayName("Отримання бронювань по ресторану - успішно")
    void getReservationsByRestaurant() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant(manager.user());
        createTestReservation(restaurant, client.user());

        mockMvc.perform(get("/api/v1/reservations/restaurant/" + restaurant.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Отримання бронювань по статусу - успішно")
    void getReservationsByStatus() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant(manager.user());
        createTestReservation(restaurant, client.user(), null, ReservationStatus.PENDING);

        mockMvc.perform(get("/api/v1/reservations/restaurant/" + restaurant.getId() + "/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Отримання бронювань по даті - успішно")
    void getReservationsByDate() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        Restaurant restaurant = createTestRestaurant(manager.user());
        createTestReservation(restaurant, client.user());

        String date = java.time.LocalDate.now().plusDays(1).toString();
        mockMvc.perform(get("/api/v1/reservations/restaurant/" + restaurant.getId() + "/date/" + date))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
