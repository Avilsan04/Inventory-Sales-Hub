package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.exceptions.EmployeeException;
import com.inventory_sales_hub.app.model.dto.CreateEmployeeParams;
import com.inventory_sales_hub.app.model.dto.PatchEmployeeRoleParams;
import com.inventory_sales_hub.app.model.dto.UpdateEmployeeParams;
import com.inventory_sales_hub.app.model.dto.UserProfile;
import com.inventory_sales_hub.app.model.entities.Role;
import com.inventory_sales_hub.app.model.entities.User;
import com.inventory_sales_hub.app.model.persistence.PasswordResetTokenDao;
import com.inventory_sales_hub.app.model.persistence.RefreshTokenDao;
import com.inventory_sales_hub.app.model.persistence.UserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmployeeManager {

    @Autowired
    private UserDao userDao;
    @Autowired
    private RefreshTokenDao refreshTokenDao;
    @Autowired
    private PasswordResetTokenDao passwordResetTokenDao;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserProfile> getAll() {
        return userDao.findAll().stream().map(this::toProfile).toList();
    }

    public UserProfile getById(Long id) {
        return userDao.findById(id)
                .map(this::toProfile)
                .orElseThrow(() -> new EmployeeException("Employee not found"));
    }

    @Transactional
    public UserProfile create(CreateEmployeeParams params) {
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
        User user = new User();
        user.setUsername(params.username());
        user.setEmail(params.email());
        user.setPassword(passwordEncoder.encode(params.password()));
        user.setRole(role);
        return toProfile(userDao.save(user));
    }

    @Transactional
    public UserProfile update(Long id, UpdateEmployeeParams params) {
        User user = userDao.findById(id)
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
    public void delete(Long id) {
        User user = userDao.findById(id)
                .orElseThrow(() -> new EmployeeException("Employee not found"));
        refreshTokenDao.deleteByUser(user);
        passwordResetTokenDao.deleteByUser(user);
        userDao.delete(user);
    }

    @Transactional
    public UserProfile patchRole(Long id, PatchEmployeeRoleParams params) {
        User user = userDao.findById(id)
                .orElseThrow(() -> new EmployeeException("Employee not found"));
        Role role;
        try {
            role = Role.valueOf(params.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new EmployeeException("Invalid role: " + params.role());
        }
        user.setRole(role);
        return toProfile(userDao.save(user));
    }

    private UserProfile toProfile(User u) {
        return new UserProfile(u.getId(), u.getUsername(), u.getEmail(), u.getRole().name());
    }
}
