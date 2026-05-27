package com.restoorderhub.backend.mapper;

import com.restoorderhub.backend.model.dto.request.CreateReservationRequest;
import com.restoorderhub.backend.model.dto.request.UpdateReservationRequest;
import com.restoorderhub.backend.model.dto.response.PreOrderItemResponse;
import com.restoorderhub.backend.model.dto.response.ReservationResponse;
import com.restoorderhub.backend.model.entity.PreOrderItem;
import com.restoorderhub.backend.model.entity.Reservation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ReservationMapper {
    
    @Mapping(target = "restaurantId", source = "restaurant.id")
    @Mapping(target = "restaurantName", source = "restaurant.name")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "tableId", source = "table.id")
    @Mapping(target = "tableNumber", source = "table.tableNumber")
    @Mapping(target = "confirmedBy", source = "confirmedBy.id")
    @Mapping(target = "preOrderItems", source = "preOrderItems")
    ReservationResponse toResponse(Reservation reservation);
    
    @Mapping(target = "menuItemId", source = "menuItem.id")
    @Mapping(target = "menuItemName", source = "menuItem.name")
    @Mapping(target = "price", source = "price")
    PreOrderItemResponse toPreOrderItemResponse(PreOrderItem preOrderItem);
    
    List<PreOrderItemResponse> toPreOrderItemResponseList(List<PreOrderItem> preOrderItems);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "restaurant", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "table", ignore = true)
    @Mapping(target = "confirmedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "cancelledAt", ignore = true)
    @Mapping(target = "confirmedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "confirmationType", ignore = true)
    @Mapping(target = "cancellationReason", ignore = true)
    @Mapping(target = "preOrderItems", ignore = true)
    Reservation toEntity(CreateReservationRequest request);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "restaurant", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "table", ignore = true)
    @Mapping(target = "confirmedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "cancelledAt", ignore = true)
    @Mapping(target = "confirmedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "confirmationType", ignore = true)
    @Mapping(target = "cancellationReason", ignore = true)
    @Mapping(target = "preOrderItems", ignore = true)
    void updateEntity(UpdateReservationRequest request, @MappingTarget Reservation reservation);
}
