package com.restoorderhub.backend.controller;

import com.restoorderhub.backend.BaseIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Інтеграційні тести для FileController")
class FileControllerIntegrationTest extends BaseIntegrationTest {

    private static final String UPLOAD_URL = "/api/v1/files/upload";
    private static final String DOWNLOAD_URL = "/api/v1/files/download";
    private static final String DELETE_URL = "/api/v1/files";

    @Nested
    @DisplayName("POST /api/v1/files/upload")
    class UploadTests {

        @Test
        @DisplayName("Завантаження файлу без авторизації - 403 Forbidden")
        void upload_WithoutAuth_Returns403() throws Exception {
            MockMultipartFile file = createTestFile("test.jpg", "image/jpeg");

            mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Завантаження валідного JPG - успішно")
        void upload_ValidJpg_ReturnsUrl() throws Exception {
            String token = getClientToken();
            MockMultipartFile file = createTestFile("test.jpg", "image/jpeg");

            MvcResult result = mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.url").exists())
                    .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.startsWith("/images/")))
                    .andExpect(jsonPath("$.fileName").value("test.jpg"))
                    .andExpect(jsonPath("$.contentType").value("image/jpeg"))
                    .andReturn();

            String response = result.getResponse().getContentAsString();
            assertThat(response).contains("\"url\"");
        }

        @Test
        @DisplayName("Завантаження PNG файлу - успішно")
        void upload_ValidPng_ReturnsUrl() throws Exception {
            String token = getClientToken();
            MockMultipartFile file = createTestFile("test.png", "image/png");

            mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.containsString(".png")))
                    .andExpect(jsonPath("$.contentType").value("image/png"));
        }

        @Test
        @DisplayName("Завантаження з директорією - успішно")
        void upload_WithDirectory_ReturnsUrlWithPath() throws Exception {
            String token = getClientToken();
            MockMultipartFile file = createTestFile("test.jpg", "image/jpeg");

            MvcResult result = mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .param("directory", "restaurants")
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.url").value(org.hamcrest.Matchers.containsString("/images/restaurants/")))
                    .andReturn();

            String response = result.getResponse().getContentAsString();
            assertThat(response).contains("/images/restaurants/");
        }

        @Test
        @DisplayName("Завантаження текстового файлу - 400 Bad Request")
        void upload_TextFile_Returns400() throws Exception {
            String token = getClientToken();
            MockMultipartFile file = createTestFile("test.txt", "text/plain");

            mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").exists());
        }

        @Test
        @DisplayName("Завантаження порожнього файлу - 400 Bad Request")
        void upload_EmptyFile_Returns400() throws Exception {
            String token = getClientToken();
            MockMultipartFile file = new MockMultipartFile(
                    "file", "empty.jpg", "image/jpeg", new byte[0]);

            mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Empty file"));
        }

        @Test
        @DisplayName("Завантаження WebP файлу - успішно")
        void upload_WebP_ReturnsUrl() throws Exception {
            String token = getClientToken();
            MockMultipartFile file = createTestFile("test.webp", "image/webp");

            mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.contentType").value("image/webp"));
        }

        @Test
        @DisplayName("Завантаження GIF файлу - успішно")
        void upload_Gif_ReturnsUrl() throws Exception {
            String token = getClientToken();
            MockMultipartFile file = createTestFile("test.gif", "image/gif");

            mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.contentType").value("image/gif"));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/files/download")
    class DownloadTests {

        @Test
        @DisplayName("Скачування без авторизації - успішно")
        void download_WithoutAuth_ReturnsFile() throws Exception {
            String token = getClientToken();
            MockMultipartFile file = createTestFile("test.jpg", "image/jpeg");

            MvcResult uploadResult = mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isCreated())
                    .andReturn();

            String url = extractUrl(uploadResult.getResponse().getContentAsString());

            mockMvc.perform(get(DOWNLOAD_URL)
                            .param("url", url))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType("image/jpeg"));
        }

        @Test
        @DisplayName("Скачування неіснуючого файлу - 400 Bad Request")
        void download_NonExistent_Returns400() throws Exception {
            mockMvc.perform(get(DOWNLOAD_URL)
                            .param("url", "/images/non-existent-file.jpg"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").exists());
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/files")
    class DeleteTests {

        @Test
        @DisplayName("Видалення без авторизації - 403 Forbidden")
        void delete_WithoutAuth_Returns403() throws Exception {
            mockMvc.perform(delete(DELETE_URL)
                            .param("url", "/images/test.jpg"))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("Видалення авторизованим користувачем без прав - 403 Forbidden")
        void delete_UnauthorizedRole_Returns403Or400() throws Exception {
            String token = getClientToken();
            MockMultipartFile file = createTestFile("unauthorized-delete.jpg", "image/jpeg");

            mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isCreated());

            mockMvc.perform(delete(DELETE_URL)
                            .param("url", "/images/unauthorized-delete.jpg")
                            .header("Authorization", "Bearer " + token))
                    .andExpect(result -> {
                        int status = result.getResponse().getStatus();
                        if (status != 403 && status != 400) {
                            throw new AssertionError("Expected 403 or 400, got " + status);
                        }
                    });
        }

        @Test
        @DisplayName("Видалення менеджером - успішно")
        void delete_AsManager_Returns204() throws Exception {
            String token = getManagerToken();
            MockMultipartFile file = createTestFile("to-delete.jpg", "image/jpeg");

            MvcResult uploadResult = mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isCreated())
                    .andReturn();

            String url = extractUrl(uploadResult.getResponse().getContentAsString());

            mockMvc.perform(delete(DELETE_URL)
                            .param("url", url)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("Видалення власником - успішно")
        void delete_AsOwner_Returns204() throws Exception {
            String token = getOwnerToken();
            MockMultipartFile file = createTestFile("to-delete2.jpg", "image/jpeg");

            MvcResult uploadResult = mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isCreated())
                    .andReturn();

            String url = extractUrl(uploadResult.getResponse().getContentAsString());

            mockMvc.perform(delete(DELETE_URL)
                            .param("url", url)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("Видалення неіснуючого файлу - 404 Not Found")
        void delete_NonExistent_Returns404() throws Exception {
            String token = getOwnerToken();

            mockMvc.perform(delete(DELETE_URL)
                            .param("url", "/images/non-existent.jpg")
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    @DisplayName("Ролі та авторизація")
    class AuthorizationTests {

        @Test
        @DisplayName("Завантаження кухарем - успішно")
        void upload_AsChef_Returns201() throws Exception {
            String token = getChefToken();
            MockMultipartFile file = createTestFile("chef.jpg", "image/jpeg");

            mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("Завантаження офіціантом - успішно")
        void upload_AsWaiter_Returns201() throws Exception {
            String token = getWaiterToken();
            MockMultipartFile file = createTestFile("waiter.jpg", "image/jpeg");

            mockMvc.perform(multipart(UPLOAD_URL)
                            .file(file)
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isCreated());
        }
    }

    private MockMultipartFile createTestFile(String filename, String contentType) {
        return new MockMultipartFile(
                "file",
                filename,
                contentType,
                new byte[]{
                        (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0,
                        0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
                }
        );
    }

    private String extractUrl(String response) {
        int start = response.indexOf("\"url\":\"") + 7;
        int end = response.indexOf("\"", start);
        return response.substring(start, end);
    }
}
