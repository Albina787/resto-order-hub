package com.restoorderhub.backend;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class IntegrationTestBase {

    @LocalServerPort
    private int port;

    protected TestRestTemplate restTemplate = new TestRestTemplate();

    protected String baseUrl() {
        return "http://localhost:" + port;
    }

    protected HttpHeaders authHeaders(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        return headers;
    }

    @SuppressWarnings("unchecked")
    protected ResponseEntity<Map> registerUser(String email, String password, String firstName, String lastName) {
        String url = baseUrl() + "/api/v1/auth/register";
        Map<String, String> body = Map.of(
                "email", email,
                "password", password,
                "firstName", firstName,
                "lastName", lastName
        );
        return restTemplate.postForEntity(url, new HttpEntity<>(body), Map.class);
    }

    @SuppressWarnings("unchecked")
    protected ResponseEntity<Map> login(String email, String password) {
        String url = baseUrl() + "/api/v1/auth/login";
        Map<String, String> body = Map.of(
                "email", email,
                "password", password
        );
        return restTemplate.postForEntity(url, new HttpEntity<>(body), Map.class);
    }

    @SuppressWarnings("unchecked")
    protected String getAccessToken(String email, String password) {
        ResponseEntity<Map> loginResponse = login(email, password);
        if (loginResponse.getStatusCode() != HttpStatusCode.valueOf(200)) {
            throw new RuntimeException("Login failed: " + loginResponse.getStatusCode());
        }
        return loginResponse.getBody().get("accessToken").toString();
    }
}