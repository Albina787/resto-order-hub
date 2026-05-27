package com.restoorderhub.backend.mapper;

import com.restoorderhub.backend.model.dto.response.OrderItemResponse;
import com.restoorderhub.backend.model.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface OrderItemMapper {
    
    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "menuItemId", source = "menuItem.id")
    @Mapping(target = "menuItemName", source = "menuItem.name")
    OrderItemResponse toResponse(OrderItem orderItem);
}
