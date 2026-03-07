package com.inventorysaleshub.user.infrastructure.persistence.adapters;

import com.inventorysaleshub.user.application.ports.outbound.UserRepositoryPort;
import com.inventorysaleshub.user.domain.entities.User;
import com.inventorysaleshub.user.infrastructure.persistence.jpa.entities.UserJpaEntity;
import com.inventorysaleshub.user.infrastructure.persistence.jpa.mappers.UserPersistenceMapper;
import com.inventorysaleshub.user.infrastructure.persistence.jpa.repositories.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepositoryPort {

    private final UserJpaRepository userJpaRepository;
    private final UserPersistenceMapper userPersistenceMapper;

    @Override
    public User save(User user) {
        UserJpaEntity entityToSave = userPersistenceMapper.toJpaEntity(user);
        UserJpaEntity savedEntity = userJpaRepository.save(entityToSave);
        return userPersistenceMapper.toDomainEntity(savedEntity);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userJpaRepository.findByEmailAndIsActiveTrue(email)
                .map(userPersistenceMapper::toDomainEntity);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userJpaRepository.findByUsernameAndIsActiveTrue(username)
                .map(userPersistenceMapper::toDomainEntity);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userJpaRepository.existsByEmail(email);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userJpaRepository.existsByUsername(username);
    }
}