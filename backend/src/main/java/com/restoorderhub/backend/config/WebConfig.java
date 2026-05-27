package com.restoorderhub.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /images/** to uploads/images/ directory (user-uploaded images)
        Path uploadPath = Paths.get(uploadDir, "images");
        String uploadAbsolutePath = uploadPath.toAbsolutePath().toUri().toString();
        
        // Ensure the path ends with a slash
        if (!uploadAbsolutePath.endsWith("/")) {
            uploadAbsolutePath += "/";
        }

        // Serve both uploaded images and static resources (like placeholders)
        registry.addResourceHandler("/images/**")
                .addResourceLocations(
                    uploadAbsolutePath,
                    "classpath:/static/images/"
                );
    }
}
