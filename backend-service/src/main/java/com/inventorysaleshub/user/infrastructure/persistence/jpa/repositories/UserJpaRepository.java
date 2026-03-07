package com.inventorysaleshub.user.infrastructure.persistence.jpa.repositories;

import com.inventorysaleshub.user.infrastructure.persistence.jpa.entities.UserJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserJpaEntity, Long> {

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<UserJpaEntity> findByEmail(String email);
}
