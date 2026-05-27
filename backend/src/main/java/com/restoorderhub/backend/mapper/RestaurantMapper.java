package com.restoorderhub.backend.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.restoorderhub.backend.model.dto.request.CreateRestaurantRequest;
import com.restoorderhub.backend.model.dto.request.UpdateRestaurantRequest;
import com.restoorderhub.backend.model.dto.response.RestaurantResponse;
import com.restoorderhub.backend.model.entity.Restaurant;
import org.mapstruct.*;

import java.util.Collections;
import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RestaurantMapper {

    ObjectMapper MAPPER = new ObjectMapper();

    @Mapping(target = "ownerId", source = "owner.id")
    @Mapping(target = "images", expression = "java(parseImages(restaurant.getImages()))")
    RestaurantResponse toResponse(Restaurant restaurant);

    default List<String> parseImages(String imagesJson) {
        if (imagesJson == null || imagesJson.isBlank()) {
            return Collections.emptyList();
        }
        try {
            return MAPPER.readValue(imagesJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            System.err.println("Error parsing images JSON: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "workingHours", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Restaurant toEntity(CreateRestaurantRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "images", expression = "java(serializeImages(request.getImages()))")
    @Mapping(target = "workingHours", ignore = true)
    void updateEntity(UpdateRestaurantRequest request, @MappingTarget Restaurant restaurant);

    default String serializeImages(List<String> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }
        try {
            return MAPPER.writeValueAsString(images);
        } catch (Exception e) {
            System.err.println("Error serializing images: " + e.getMessage());
            return null;
        }
    }
}
