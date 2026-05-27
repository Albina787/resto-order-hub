package com.restoorderhub.backend.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.restoorderhub.backend.model.dto.request.CreateMenuItemRequest;
import com.restoorderhub.backend.model.dto.request.UpdateMenuItemRequest;
import com.restoorderhub.backend.model.dto.response.MenuItemResponse;
import com.restoorderhub.backend.model.entity.MenuItem;
import org.mapstruct.*;

import java.util.Collections;
import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface MenuItemMapper {

    ObjectMapper MAPPER = new ObjectMapper();

    @Mapping(target = "restaurantId", source = "restaurant.id")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "isAvailable", source = "available")
    @Mapping(target = "isPopular", source = "popular")
    @Mapping(target = "images", expression = "java(parseJsonList(menuItem.getImages()))")
    @Mapping(target = "ingredients", expression = "java(parseJsonList(menuItem.getIngredients()))")
    @Mapping(target = "allergens", expression = "java(parseJsonList(menuItem.getAllergens()))")
    MenuItemResponse toResponse(MenuItem menuItem);

    default List<String> parseJsonList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return MAPPER.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "restaurant", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "ingredients", ignore = true)
    @Mapping(target = "allergens", ignore = true)
    MenuItem toEntity(CreateMenuItemRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "restaurant", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "available", source = "isAvailable")
    @Mapping(target = "popular", source = "isPopular")
    @Mapping(target = "images", expression = "java(serializeJsonList(request.getImages()))")
    @Mapping(target = "ingredients", expression = "java(serializeJsonList(request.getIngredients()))")
    @Mapping(target = "allergens", expression = "java(serializeJsonList(request.getAllergens()))")
    void updateEntity(UpdateMenuItemRequest request, @MappingTarget MenuItem menuItem);

    default String serializeJsonList(List<String> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        try {
            return MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            System.err.println("Error serializing list: " + e.getMessage());
            return null;
        }
    }
}
