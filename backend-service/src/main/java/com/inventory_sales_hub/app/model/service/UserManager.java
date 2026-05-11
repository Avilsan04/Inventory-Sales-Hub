package com.inventory_sales_hub.app.model.service;

import com.inventory_sales_hub.app.exceptions.UserException;
import com.inventory_sales_hub.app.model.dto.*;
import com.inventory_sales_hub.app.model.entities.PasswordResetToken;
import com.inventory_sales_hub.app.model.entities.RefreshToken;
import com.inventory_sales_hub.app.model.entities.User;
import com.inventory_sales_hub.app.model.persistence.PasswordResetTokenDao;
import com.inventory_sales_hub.app.model.persistence.RefreshTokenDao;
import com.inventory_sales_hub.app.model.persistence.UserDao;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
public class UserManager {
    private static final long REFRESH_TOKEN_EXPIRY_DAYS = 7;
    private static final long RESET_TOKEN_EXPIRY_MINUTES = 60;

    @Autowired private UserDao userDao;
    @Autowired private RefreshTokenDao refreshTokenDao;
    @Autowired private PasswordResetTokenDao passwordResetTokenDao;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtManager jwtManager;

    public UserResponse registerUser(RegisterParams params) {
        if (userDao.existsByEmail(params.email())) throw new UserException("This email already exists");
        if (userDao.existsByUsername(params.username())) throw new UserException("This username already exists");

        User user = new User();
        user.setUsername(params.username());
        user.setEmail(params.email());
        user.setPassword(passwordEncoder.encode(params.password()));

        User saved = userDao.save(user);
        String accessToken = jwtManager.generateToken(saved.getUsername(), saved.getId(), saved.getRole().name());
        String refreshToken = createRefreshToken(saved);
        return new UserResponse(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getRole().name(), accessToken, refreshToken);
    }

    public UserResponse loginUser(String email, String password) {
        User user = userDao.findByEmail(email);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            throw new UserException("The password or email is incorrect");
        }
        String accessToken = jwtManager.generateToken(user.getUsername(), user.getId(), user.getRole().name());
        String refreshToken = createRefreshToken(user);
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole().name(), accessToken, refreshToken);
    }

    @Transactional
    public void logout(String refreshToken) {
        refreshTokenDao.deleteByToken(refreshToken);
    }

    public UserProfile getMe(Long userId) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new UserException("User not found"));
        return new UserProfile(user.getId(), user.getUsername(), user.getEmail(), user.getRole().name());
    }

    @Transactional
    public UserResponse refreshToken(String refreshToken) {
        RefreshToken stored = refreshTokenDao.findByToken(refreshToken)
                .orElseThrow(() -> new UserException("Invalid refresh token"));

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenDao.delete(stored);
            throw new UserException("Refresh token expired");
        }

        User user = stored.getUser();
        refreshTokenDao.delete(stored);

        String newAccessToken = jwtManager.generateToken(user.getUsername(), user.getId(), user.getRole().name());
        String newRefreshToken = createRefreshToken(user);
        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole().name(), newAccessToken, newRefreshToken);
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userDao.findByEmail(email);
        if (user == null) return;

        passwordResetTokenDao.deleteByUser(user);

        String tokenValue = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(tokenValue);
        resetToken.setUser(user);
        resetToken.setExpiresAt(Instant.now().plus(RESET_TOKEN_EXPIRY_MINUTES, ChronoUnit.MINUTES));
        passwordResetTokenDao.save(resetToken);

        // TODO: Send email with reset link -> /api/auth/reset-password?token={tokenValue}
        log.info("Password reset token generated for {}: {}", email, tokenValue);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenDao.findByToken(token)
                .orElseThrow(() -> new UserException("Invalid or expired reset token"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new UserException("Invalid or expired reset token");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userDao.save(user);

        resetToken.setUsed(true);
        passwordResetTokenDao.save(resetToken);
    }

    @Transactional
    public UserProfile updateProfile(Long userId, UpdateProfileParams params) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new UserException("User not found"));

        if (params.username() != null && !params.username().equals(user.getUsername())) {
            if (userDao.existsByUsername(params.username())) throw new UserException("This username already exists");
            user.setUsername(params.username());
        }
        if (params.email() != null && !params.email().equals(user.getEmail())) {
            if (userDao.existsByEmail(params.email())) throw new UserException("This email already exists");
            user.setEmail(params.email());
        }

        User saved = userDao.save(user);
        return new UserProfile(saved.getId(), saved.getUsername(), saved.getEmail(), saved.getRole().name());
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userDao.findById(userId)
                .orElseThrow(() -> new UserException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new UserException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userDao.save(user);
    }

    private String createRefreshToken(User user) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUser(user);
        refreshToken.setExpiresAt(Instant.now().plus(REFRESH_TOKEN_EXPIRY_DAYS, ChronoUnit.DAYS));
        return refreshTokenDao.save(refreshToken).getToken();
    }
}
