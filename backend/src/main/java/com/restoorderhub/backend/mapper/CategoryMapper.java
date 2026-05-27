package com.restoorderhub.backend.mapper;

import com.restoorderhub.backend.model.dto.request.CreateCategoryRequest;
import com.restoorderhub.backend.model.dto.response.CategoryResponse;
import com.restoorderhub.backend.model.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CategoryMapper {
    
    @Mapping(target = "restaurantId", source = "restaurant.id")
    CategoryResponse toResponse(Category category);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "restaurant", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Category toEntity(CreateCategoryRequest request);
}
