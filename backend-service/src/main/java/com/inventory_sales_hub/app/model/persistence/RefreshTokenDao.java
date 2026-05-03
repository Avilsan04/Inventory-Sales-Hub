package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.RefreshToken;
import com.inventory_sales_hub.app.model.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenDao extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByToken(String token);
    void deleteByUser(User user);
}
