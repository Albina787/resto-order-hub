package com.restoorderhub.backend.mapper;

import com.restoorderhub.backend.model.dto.request.CreateTableRequest;
import com.restoorderhub.backend.model.dto.response.TableResponse;
import com.restoorderhub.backend.model.entity.RestaurantTable;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TableMapper {

    @Mapping(target = "restaurantId", source = "restaurant.id")
    @Mapping(target = "isActive", source = "active")
    @Mapping(target = "isAvailable", source = "available")
    TableResponse toResponse(RestaurantTable table);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "restaurant", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "available", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    RestaurantTable toEntity(CreateTableRequest request);
}
