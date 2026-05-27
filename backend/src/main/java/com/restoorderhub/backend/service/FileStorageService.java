package com.restoorderhub.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path storageLocation;
    private final long maxSize;
    private final List<String> allowedTypes;

    public FileStorageService(
            @Value("${file.upload-dir:uploads}") String uploadDir,
            @Value("${file.max-size:5242880}") long maxSize,
            @Value("${file.allowed-types:image/jpeg,image/jpg,image/png,image/gif,image/webp}") String allowedTypes) {
        this.storageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxSize = maxSize;
        this.allowedTypes = Arrays.asList(allowedTypes.toLowerCase().split(","));
        try {
            if (!Files.exists(this.storageLocation)) {
                Files.createDirectories(this.storageLocation);
            }
            System.out.println("File storage: " + this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Cannot create upload directory", e);
        }
    }

    public String upload(MultipartFile file, String subDir) {
        validate(file);

        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "." + ext;

        try {
            // Always store files in uploads/images/{subDir}/ to match WebConfig mapping
            Path imagesDir = this.storageLocation.resolve("images");
            Path targetDir = subDir != null
                    ? Files.createDirectories(imagesDir.resolve(subDir))
                    : imagesDir;
            
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }
            
            Path target = targetDir.resolve(filename);

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            String url = subDir != null
                    ? "/images/" + subDir + "/" + filename
                    : "/images/" + filename;

            System.out.println("Uploaded: " + file.getOriginalFilename() + " -> " + url + " (stored at: " + target + ")");
            return url;

        } catch (IOException e) {
            throw new RuntimeException("Upload failed: " + file.getOriginalFilename(), e);
        }
    }

    public String upload(MultipartFile file) {
        return upload(file, null);
    }

    public Resource getAsResource(String url) {
        try {
            // Extract path from URL: /images/menu/file.jpg -> menu/file.jpg
            String path = url.startsWith("/images/")
                    ? url.substring("/images/".length())
                    : url;
            
            // Resolve to uploads/images/{path}
            Path filePath = this.storageLocation.resolve("images").resolve(path).normalize();

            // Security: ensure resolved path is inside storageLocation/images
            Path imagesDir = this.storageLocation.resolve("images");
            if (!filePath.startsWith(imagesDir)) {
                throw new RuntimeException("Access denied: path traversal attempt");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
            throw new RuntimeException("File not found: " + url);
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid path: " + url, e);
        }
    }

    public boolean delete(String url) {
        try {
            // Extract path from URL: /images/menu/file.jpg -> menu/file.jpg
            String path = url.startsWith("/images/")
                    ? url.substring("/images/".length())
                    : url;
            
            // Resolve to uploads/images/{path}
            Path filePath = this.storageLocation.resolve("images").resolve(path).normalize();

            // Security: ensure resolved path is inside storageLocation/images
            Path imagesDir = this.storageLocation.resolve("images");
            if (!filePath.startsWith(imagesDir)) {
                throw new RuntimeException("Access denied: path traversal attempt");
            }

            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Delete failed: " + url);
            return false;
        }
    }

    private void validate(MultipartFile file) {
        if (file.isEmpty()) throw new RuntimeException("Empty file");
        if (file.getSize() > maxSize) throw new RuntimeException("Max " + (maxSize / 1024 / 1024) + "MB");
        String type = file.getContentType();
        if (type == null || !allowedTypes.contains(type.toLowerCase())) {
            throw new RuntimeException("Only " + allowedTypes + " allowed");
        }
    }

    private String getExtension(String name) {
        if (name == null) return "jpg";
        int i = name.lastIndexOf('.');
        return i > 0 ? name.substring(i + 1).toLowerCase() : "jpg";
    }
}
