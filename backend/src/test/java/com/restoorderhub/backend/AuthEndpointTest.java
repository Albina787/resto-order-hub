package com.restoorderhub.backend;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class AuthEndpointTest extends IntegrationTestBase {

    @Test
    void shouldRegisterUser() {
        String email = "test-" + System.currentTimeMillis() + "@example.com";
        ResponseEntity<Map> response = registerUser(email, "Password1!", "John", "Doe");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).containsKey("accessToken");
        assertThat(response.getBody()).containsKey("refreshToken");
    }

    @Test
    void shouldRejectDuplicateEmail() {
        String email = "duplicate-" + System.currentTimeMillis() + "@example.com";
        registerUser(email, "Password1!", "John", "Doe");

        ResponseEntity<Map> response = registerUser(email, "Password1!", "John", "Doe");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void shouldRejectWeakPassword() {
        String email = "weak-" + System.currentTimeMillis() + "@example.com";
        ResponseEntity<Map> response = registerUser(email, "weak", "John", "Doe");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldLoginSuccessfully() {
        String email = "login-test-" + System.currentTimeMillis() + "@example.com";
        String password = "Password1!";
        registerUser(email, password, "John", "Doe");

        ResponseEntity<Map> response = login(email, password);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsKey("accessToken");
        assertThat(response.getBody()).containsKey("refreshToken");
    }

    @Test
    void shouldRejectInvalidCredentials() {
        ResponseEntity<Map> response = login("nonexistent@example.com", "Password1!");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void shouldRefreshToken() {
        String email = "refresh-test-" + System.currentTimeMillis() + "@example.com";
        String password = "Password1!";
        registerUser(email, password, "John", "Doe");

        ResponseEntity<Map> loginResponse = login(email, password);
        String refreshToken = loginResponse.getBody().get("refreshToken").toString();

        String url = baseUrl() + "/api/v1/auth/refresh";
        ResponseEntity<Map> response = restTemplate.postForEntity(
                url, 
                new HttpEntity<>(Map.of("refreshToken", refreshToken)), 
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsKey("accessToken");
    }

    @Test
    void shouldLogout() {
        String email = "logout-test-" + System.currentTimeMillis() + "@example.com";
        String password = "Password1!";
        registerUser(email, password, "John", "Doe");

        ResponseEntity<Map> loginResponse = login(email, password);
        String refreshToken = loginResponse.getBody().get("refreshToken").toString();

        String url = baseUrl() + "/api/v1/auth/logout";
        ResponseEntity<Void> response = restTemplate.postForEntity(
                url,
                new HttpEntity<>(Map.of("refreshToken", refreshToken)),
                Void.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
    }
}