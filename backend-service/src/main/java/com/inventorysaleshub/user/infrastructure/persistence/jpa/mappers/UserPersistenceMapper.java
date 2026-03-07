package com.inventorysaleshub.user.infrastructure.persistence.jpa.mappers;

import com.inventorysaleshub.user.domain.entities.User;
import com.inventorysaleshub.user.infrastructure.persistence.jpa.entities.UserJpaEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserPersistenceMapper {

    // Converts Database Entity -> Pure Domain Entity
    User toDomainEntity(UserJpaEntity entity);

    // Converts Pure Domain Entity -> Database Entity
    // Version is ignored because Hibernate Optimistic Locking manages it automatically
    @Mapping(target = "version", ignore = true)
    UserJpaEntity toJpaEntity(User domain);
}