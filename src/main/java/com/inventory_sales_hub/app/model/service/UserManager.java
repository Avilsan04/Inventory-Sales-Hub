package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.model.dto.UserResponse;
import com.inventory_sales_hub.app.model.entities.User;
import com.inventory_sales_hub.app.exceptions.UserException;
import com.inventory_sales_hub.app.model.persistence.UserDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserManager {
    @Autowired
    private UserDao userDao;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtManager jwtManager;

    public UserResponse registerUser(User user) {
        if (userDao.existsByEmail(user.getEmail())) {
            throw new UserException("This email already exists");
        }
        if (userDao.existsByUsername(user.getUsername())) {
            throw new UserException("This username already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User userSaved = userDao.save(user);
        String token = jwtManager.generateToken(userSaved.getUsername(), userSaved.getId());
        return new UserResponse(userSaved.getId(), userSaved.getUsername(), userSaved.getEmail(), token);
    }

    public String loginUser(String email, String password){
        User user = userDao.findByEmail(email);
        if (user != null){
            boolean correctPassword = passwordEncoder.matches(password, user.getPassword());
            if (correctPassword) {
                return jwtManager.generateToken(user.getUsername(), user.getId());
            } else {
                throw new UserException("The password or email is incorrect");
            }
        } else{
            throw new UserException("The password or email is incorrect");
        }
    }
}