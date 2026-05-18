package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserDao extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByUsernameAndIdNot(String username, Long id);
    User findByEmail(String email);
    List<User> findAllByTenantId(Long tenantId);
    Page<User> findAllByTenantId(Long tenantId, Pageable pageable);
    Page<User> findAll(Pageable pageable);
    Optional<User> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByUsernameAndIdNotAndTenantId(String username, Long id, Long tenantId);
    boolean existsByEmailAndIdNotAndTenantId(String email, Long id, Long tenantId);
}
