package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.PasswordResetToken;
import com.inventory_sales_hub.app.model.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordResetTokenDao extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByUser(User user);
}
