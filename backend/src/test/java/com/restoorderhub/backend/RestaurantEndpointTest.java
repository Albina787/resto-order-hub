package com.restoorderhub.backend;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class RestaurantEndpointTest extends IntegrationTestBase {

    @Test
    void shouldCreateRestaurantAsAuthenticatedUser() {
        String email = "owner-" + System.currentTimeMillis() + "@example.com";
        String password = "Password1!";
        registerUser(email, password, "John", "Doe");
        String accessToken = getAccessToken(email, password);

        String url = baseUrl() + "/api/v1/restaurants";
        Map<String, Object> body = Map.of(
                "name", "Test Restaurant",
                "address", "123 Main St",
                "city", "Kyiv",
                "phone", "+380123456789",
                "email", email,
                "cuisineType", "Ukrainian",
                "capacity", 50
        );

        HttpHeaders headers = authHeaders(accessToken);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                url,
                new HttpEntity<>(body, headers),
                Map.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().get("name")).isEqualTo("Test Restaurant");
    }
}