package com.restoorderhub.backend.mapper;

import com.restoorderhub.backend.model.dto.response.UserResponse;
import com.restoorderhub.backend.model.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {
    UserResponse toResponse(User user);
}
