package com.inventorysaleshub.user.infrastructure.rest.mappers;

import com.inventorysaleshub.user.domain.entities.User;
import com.inventorysaleshub.user.infrastructure.rest.dto.UserResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserRestMapper {

    @Mapping(target = "token", ignore = true)
    UserResponse toResponse(User user);

    default UserResponse toResponseWithToken(User user, String token) {
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), token);
    }
}
