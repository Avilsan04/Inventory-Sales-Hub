package com.inventorysaleshub.user.application.ports.outbound;

import com.inventorysaleshub.user.domain.entities.User;

import java.util.Optional;

public interface UserRepositoryPort {

    User save(User user);

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
