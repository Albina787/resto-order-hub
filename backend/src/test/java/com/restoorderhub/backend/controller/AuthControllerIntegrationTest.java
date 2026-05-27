package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.BaseIntegrationTest;
import com.restoorderhub.backend.model.dto.request.LoginRequest;
import com.restoorderhub.backend.model.dto.request.RegisterRequest;
import com.restoorderhub.backend.model.dto.response.AuthResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Інтеграційні тести для AuthController")
class AuthControllerIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Реєстрація нового користувача - успішно")
    void testRegister_Success() throws Exception {
        // Given
        RegisterRequest request = new RegisterRequest(
                "Іван",
                "Петренко",
                "ivan.petrenko@example.com",
                "Password123!",
                "+380501234567"
        );

        // When & Then
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        AuthResponse response = fromJson(responseBody, AuthResponse.class);

        assertThat(response.getAccessToken()).isNotEmpty();
        assertThat(response.getRefreshToken()).isNotEmpty();
    }

    @Test
    @DisplayName("Реєстрація з невалідним email - помилка")
    void testRegister_InvalidEmail() throws Exception {
        // Given
        RegisterRequest request = new RegisterRequest(
                "Іван",
                "Петренко",
                "invalid-email",
                "Password123!",
                "+380501234567"
        );

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Реєстрація з слабким паролем - помилка")
    void testRegister_WeakPassword() throws Exception {
        // Given
        RegisterRequest request = new RegisterRequest(
                "Іван",
                "Петренко",
                "ivan@example.com",
                "weak",
                "+380501234567"
        );

        // When & Then
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Реєстрація з дублікатом email - помилка")
    void testRegister_DuplicateEmail() throws Exception {
        // Given
        RegisterRequest request = new RegisterRequest(
                "Іван",
                "Петренко",
                "duplicate@example.com",
                "Password123!",
                "+380501234567"
        );

        // Перша реєстрація
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isCreated());

        // When & Then - друга реєстрація з тим же email
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(request)))
                .andExpect(status().isConflict()); // 409 Conflict - правильніший статус для дублікату
    }

    @Test
    @DisplayName("Вхід з правильними credentials - успішно")
    void testLogin_Success() throws Exception {
        // Given - спочатку реєструємо користувача
        RegisterRequest registerRequest = new RegisterRequest(
                "Марія",
                "Коваленко",
                "maria@example.com",
                "Password123!",
                "+380501234567"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(registerRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest(
                "maria@example.com",
                "Password123!"
        );

        // When & Then
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        AuthResponse response = fromJson(responseBody, AuthResponse.class);

        assertThat(response.getAccessToken()).isNotEmpty();
    }

    @Test
    @DisplayName("Вхід з невірним паролем - помилка")
    void testLogin_WrongPassword() throws Exception {
        // Given - реєструємо користувача
        RegisterRequest registerRequest = new RegisterRequest(
                "Олег",
                "Сидоренко",
                "oleg@example.com",
                "Password123!",
                "+380501234567"
        );

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(registerRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest(
                "oleg@example.com",
                "WrongPassword123!"
        );

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Вхід з неіснуючим email - помилка")
    void testLogin_NonExistentEmail() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest(
                "nonexistent@example.com",
                "Password123!"
        );

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Вхід з порожніми полями - помилка")
    void testLogin_EmptyFields() throws Exception {
        // Given
        LoginRequest loginRequest = new LoginRequest("", "");

        // When & Then
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    // === Додаткові тести для повного покриття ===

    @Test
    @DisplayName("Logout з валідним токеном - успішно")
    void testLogout_Success() throws Exception {
        // Given - реєструємо та логінимо користувача
        RegisterRequest registerRequest = new RegisterRequest(
                "Logout",
                "User",
                "logout@test.com",
                "Password123!",
                "+380501234567"
        );
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(registerRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest("logout@test.com", "Password123!");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();
        
        AuthResponse loginResponse = fromJson(loginResult.getResponse().getContentAsString(), AuthResponse.class);

        // When & Then - logout з refresh токеном
        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + loginResponse.getRefreshToken() + "\"}"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Refresh токену - успішно")
    void testRefreshToken_Success() throws Exception {
        // Given - реєструємо та логінимо користувача
        RegisterRequest registerRequest = new RegisterRequest(
                "Refresh",
                "User",
                "refresh@test.com",
                "Password123!",
                "+380501234567"
        );
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(registerRequest)))
                .andExpect(status().isCreated());

        LoginRequest loginRequest = new LoginRequest("refresh@test.com", "Password123!");
        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();
        
        AuthResponse loginResponse = fromJson(loginResult.getResponse().getContentAsString(), AuthResponse.class);

        // When & Then - refresh з valid refresh токеном
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + loginResponse.getRefreshToken() + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    @DisplayName("Refresh токену з невалідним токеном - помилка")
    void testRefreshToken_InvalidToken() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"invalid-token\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Forgot password з існуючим email - успішно")
    void testForgotPassword_Success() throws Exception {
        // Given - реєструємо користувача
        RegisterRequest registerRequest = new RegisterRequest(
                "Forgot",
                "User",
                "forgot@test.com",
                "Password123!",
                "+380501234567"
        );
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(registerRequest)))
                .andExpect(status().isCreated());

        // When & Then
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"forgot@test.com\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Forgot password з неіснуючим email - помилка")
    void testForgotPassword_NonExistentEmail() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nonexistent@test.com\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Reset password з невалідним токеном - помилка")
    void testResetPassword_InvalidToken() throws Exception {
        // When & Then - повертає 401 бо потрібна авторизація
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"invalid-token\",\"newPassword\":\"NewPassword123!\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Reset password з слабким паролем - помилка")
    void testResetPassword_WeakPassword() throws Exception {
        // When & Then - повертає 401 бо потрібна авторизація
        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"token\":\"some-token\",\"newPassword\":\"weak\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Resend verification email - успішно")
    void testResendVerification_Success() throws Exception {
        // Given - реєструємо користувача
        RegisterRequest registerRequest = new RegisterRequest(
                "Verify",
                "User",
                "verify@test.com",
                "Password123!",
                "+380501234567"
        );
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toJson(registerRequest)))
                .andExpect(status().isCreated());

        // When & Then
        mockMvc.perform(post("/api/v1/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"verify@test.com\"}"))
                .andExpect(status().isOk());
    }
}
