package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.BaseIntegrationTest;
import com.restoorderhub.backend.model.entity.Restaurant;
import com.restoorderhub.backend.model.entity.StaffAssignment;
import com.restoorderhub.backend.model.enums.StaffPosition;
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

@DisplayName("Інтеграційні тести для StaffController")
class StaffControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Менеджер може призначити офіціанта")
    void assignStaff_AsManager() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser waiter = createAuthenticatedUser(UserRole.WAITER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        StaffAssignment assignment = StaffAssignment.builder()
                .position(StaffPosition.WAITER)
                .build();

        mockMvc.perform(post("/api/v1/restaurants/" + restaurant.getId() + "/staff")
                        .header("Authorization", "Bearer " + manager.token())
                        .param("userId", waiter.user().getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(assignment)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.position").value("WAITER"))
                .andExpect(jsonPath("$.assignedBy.id").value(manager.user().getId().toString()));
    }

    @Test
    @DisplayName("Клієнт не може призначати персонал")
    void assignStaff_AsClient_Forbidden() throws Exception {
        TestUser client = createAuthenticatedUser(UserRole.CLIENT);
        TestUser waiter = createAuthenticatedUser(UserRole.WAITER);
        Restaurant restaurant = createTestRestaurant();
        StaffAssignment assignment = StaffAssignment.builder()
                .position(StaffPosition.WAITER)
                .build();

        mockMvc.perform(post("/api/v1/restaurants/" + restaurant.getId() + "/staff")
                        .header("Authorization", "Bearer " + client.token())
                        .param("userId", waiter.user().getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(assignment)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Деактивація призначення персоналу працює")
    void deactivateStaffAssignment() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser waiter = createAuthenticatedUser(UserRole.WAITER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        StaffAssignment assignment = createTestStaffAssignment(restaurant, waiter.user(), manager.user(), StaffPosition.WAITER, true);

        mockMvc.perform(patch("/api/v1/restaurants/" + restaurant.getId() + "/staff/" + assignment.getId() + "/deactivate")
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));
    }

    // === Додаткові тести для повного покриття ===

    @Test
    @DisplayName("Отримання списку персоналу ресторану - успішно")
    void getStaffList() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser waiter = createAuthenticatedUser(UserRole.WAITER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        createTestStaffAssignment(restaurant, waiter.user(), manager.user(), StaffPosition.WAITER, true);

        mockMvc.perform(get("/api/v1/restaurants/" + restaurant.getId() + "/staff")
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Отримання активного персоналу ресторану - успішно")
    void getActiveStaffList() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser waiter = createAuthenticatedUser(UserRole.WAITER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        createTestStaffAssignment(restaurant, waiter.user(), manager.user(), StaffPosition.WAITER, true);

        mockMvc.perform(get("/api/v1/restaurants/" + restaurant.getId() + "/staff/active")
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Отримання призначення персоналу по ID - успішно")
    void getStaffAssignmentById() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser waiter = createAuthenticatedUser(UserRole.WAITER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        StaffAssignment assignment = createTestStaffAssignment(restaurant, waiter.user(), manager.user(), StaffPosition.WAITER, true);

        mockMvc.perform(get("/api/v1/restaurants/" + restaurant.getId() + "/staff/" + assignment.getId())
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.position").value("WAITER"));
    }

    @Test
    @DisplayName("Призначення кухаря до ресторану - успішно")
    void assignChef_AsManager() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser chef = createAuthenticatedUser(UserRole.CHEF);
        Restaurant restaurant = createTestRestaurant(manager.user());
        StaffAssignment assignment = StaffAssignment.builder()
                .position(StaffPosition.CHEF)
                .build();

        mockMvc.perform(post("/api/v1/restaurants/" + restaurant.getId() + "/staff")
                        .header("Authorization", "Bearer " + manager.token())
                        .param("userId", chef.user().getId().toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(assignment)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.position").value("CHEF"));
    }

    @Test
    @DisplayName("Активація призначення персоналу - успішно")
    void activateStaffAssignment() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser waiter = createAuthenticatedUser(UserRole.WAITER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        StaffAssignment assignment = createTestStaffAssignment(restaurant, waiter.user(), manager.user(), StaffPosition.WAITER, false);

        mockMvc.perform(patch("/api/v1/restaurants/" + restaurant.getId() + "/staff/" + assignment.getId() + "/activate")
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("Видалення призначення персоналу - успішно")
    void deleteStaffAssignment() throws Exception {
        TestUser manager = createAuthenticatedUser(UserRole.MANAGER);
        TestUser waiter = createAuthenticatedUser(UserRole.WAITER);
        Restaurant restaurant = createTestRestaurant(manager.user());
        StaffAssignment assignment = createTestStaffAssignment(restaurant, waiter.user(), manager.user(), StaffPosition.WAITER, true);

        mockMvc.perform(delete("/api/v1/restaurants/" + restaurant.getId() + "/staff/" + assignment.getId())
                        .header("Authorization", "Bearer " + manager.token()))
                .andExpect(status().isNoContent());
    }
}
