package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.exceptions.EmployeeException;
import com.inventory_sales_hub.app.model.dto.CreateEmployeeParams;
import com.inventory_sales_hub.app.model.dto.PaginatedResponse;
import com.inventory_sales_hub.app.model.dto.PatchEmployeeRoleParams;
import com.inventory_sales_hub.app.model.dto.UpdateEmployeeParams;
import com.inventory_sales_hub.app.model.dto.UserProfile;
import com.inventory_sales_hub.app.model.entities.Role;
import com.inventory_sales_hub.app.model.entities.User;
import com.inventory_sales_hub.app.model.persistence.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeManager {

    @Autowired private UserDao userDao;
    @Autowired private RefreshTokenDao refreshTokenDao;
    @Autowired private PasswordResetTokenDao passwordResetTokenDao;
    @Autowired private PasswordEncoder passwordEncoder;

    public PaginatedResponse<UserProfile> getAll(Long tenantId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("username"));
        Page<User> p = tenantId != null
                ? userDao.findAllByTenantId(tenantId, pageable)
                : userDao.findAll(pageable);
        List<UserProfile> data = p.getContent().stream().map(this::toProfile).toList();
        return new PaginatedResponse<>(data, p.getTotalElements(), page, size);
    }

    public UserProfile getById(Long id, Long tenantId) {
        return (tenantId != null
                ? userDao.findByIdAndTenantId(id, tenantId)
                : userDao.findById(id))
                .map(this::toProfile)
                .orElseThrow(() -> new EmployeeException("Employee not found"));
    }

    @Transactional
    public UserProfile create(CreateEmployeeParams params, Long tenantId) {
        if (userDao.existsByUsername(params.username())) {
            throw new EmployeeException("Username already in use");
        }
        if (userDao.existsByEmail(params.email())) {
            throw new EmployeeException("Email already in use");
        }
        Role role;
        try {
            role = Role.valueOf(params.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new EmployeeException("Invalid role: " + params.role());
        }
        // Prevent granting ADMIN role through employee creation
        if (role == Role.ADMIN) throw new EmployeeException("Cannot assign ADMIN role via employee management");

        User user = new User();
        user.setUsername(params.username());
        user.setEmail(params.email());
        user.setPassword(passwordEncoder.encode(params.password()));
        user.setRole(role);
        user.setTenantId(tenantId);
        return toProfile(userDao.save(user));
    }

    @Transactional
    public UserProfile update(Long id, UpdateEmployeeParams params, Long tenantId) {
        User user = (tenantId != null
                ? userDao.findByIdAndTenantId(id, tenantId)
                : userDao.findById(id))
                .orElseThrow(() -> new EmployeeException("Employee not found"));

        if (userDao.existsByUsernameAndIdNot(params.username(), id)) {
            throw new EmployeeException("Username already in use");
        }
        if (userDao.existsByEmailAndIdNot(params.email(), id)) {
            throw new EmployeeException("Email already in use");
        }
        user.setUsername(params.username());
        user.setEmail(params.email());
        return toProfile(userDao.save(user));
    }

    @Transactional
    public void delete(Long id, Long tenantId) {
        User user = (tenantId != null
                ? userDao.findByIdAndTenantId(id, tenantId)
                : userDao.findById(id))
                .orElseThrow(() -> new EmployeeException("Employee not found"));
        refreshTokenDao.deleteByUser(user);
        passwordResetTokenDao.deleteByUser(user);
        userDao.delete(user);
    }

    @Transactional
    public UserProfile patchRole(Long id, PatchEmployeeRoleParams params, Long tenantId) {
        User user = (tenantId != null
                ? userDao.findByIdAndTenantId(id, tenantId)
                : userDao.findById(id))
                .orElseThrow(() -> new EmployeeException("Employee not found"));
        Role role;
        try {
            role = Role.valueOf(params.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new EmployeeException("Invalid role: " + params.role());
        }
        if (role == Role.ADMIN) throw new EmployeeException("Cannot assign ADMIN role via employee management");
        user.setRole(role);
        return toProfile(userDao.save(user));
    }

    private UserProfile toProfile(User u) {
        return new UserProfile(u.getId(), u.getUsername(), u.getEmail(), u.getRole().name());
    }
}
