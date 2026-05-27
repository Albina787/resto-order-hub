package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.BaseIntegrationTest;
import com.restoorderhub.backend.model.entity.User;
import com.restoorderhub.backend.model.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Інтеграційні тести для UserController")
class UserControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Користувача можна отримати по email")
    void getUserByEmail() throws Exception {
        User user = createUser(UserRole.WAITER);

        mockMvc.perform(get("/api/v1/users/email/" + user.getEmail()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId().toString()));
    }

    @Test
    @DisplayName("Фільтрація користувачів по ролі працює")
    void getUsersByRole() throws Exception {
        createUser(UserRole.CHEF);

        mockMvc.perform(get("/api/v1/users/role/CHEF"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Оновлення профілю користувача працює")
    void updateUser() throws Exception {
        User user = createUser(UserRole.CLIENT);
        User update = User.builder()
                .firstName("Updated")
                .lastName("Profile")
                .phone("+380509999999")
                .avatar("avatar.png")
                .build();

        mockMvc.perform(put("/api/v1/users/" + user.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"));
    }

    @Test
    @DisplayName("Деактивацію і активацію користувача можна виконати послідовно")
    void deactivateAndActivateUser() throws Exception {
        User user = createUser(UserRole.CLIENT);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/v1/users/" + user.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(patch("/api/v1/users/" + user.getId() + "/activate"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(true));
    }

    @Test
    @DisplayName("Створення користувача через endpoint працює")
    void createUserViaEndpoint() throws Exception {
        User user = User.builder()
                .email("created-" + java.util.UUID.randomUUID() + "@test.com")
                .firstName("Created")
                .lastName("User")
                .phone("+380501234567")
                .role(UserRole.CLIENT)
                .build();

        mockMvc.perform(post("/api/v1/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(user)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(user.getEmail()));
    }

    // === Додаткові тести для повного покриття ===
// Примітка: /me endpoints не реалізовані в UserController

    @Test
    @DisplayName("Отримання неіснуючого користувача - помилка 404")
    void getUserById_NotFound() throws Exception {
        mockMvc.perform(get("/api/v1/users/00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Отримання користувачів по неіснуючій ролі - порожній масив")
    void getUsersByNonExistentRole() throws Exception {
        mockMvc.perform(get("/api/v1/users/role/NONEXISTENT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("Отримання всіх активних користувачів - успішно")
    void getActiveUsers() throws Exception {
        createUser(UserRole.CLIENT);

        mockMvc.perform(get("/api/v1/users/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
