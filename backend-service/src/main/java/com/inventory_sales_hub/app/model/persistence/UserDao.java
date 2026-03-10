package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDao extends JpaRepository<User, Long> {
        boolean existsByEmail(String email);
        boolean existsByUsername(String username);
        User findByEmail(String email);
}
