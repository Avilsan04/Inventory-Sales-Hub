package com.inventorysaleshub.user.application.usecases;

import com.inventorysaleshub.user.application.ports.inbound.RegisterUserPort;
import com.inventorysaleshub.user.application.ports.outbound.PasswordEncoderPort;
import com.inventorysaleshub.user.application.ports.outbound.UserRepositoryPort;
import com.inventorysaleshub.user.domain.entities.User;
import com.inventorysaleshub.user.domain.exceptions.UserAlreadyExistsException;
import org.springframework.stereotype.Service;

@Service
public class RegisterUserUseCase implements RegisterUserPort {

    private final UserRepositoryPort userRepository;
    private final PasswordEncoderPort passwordEncoder;

    public RegisterUserUseCase(UserRepositoryPort userRepository, PasswordEncoderPort passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User register(String username, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("This email already exists");
        }
        if (userRepository.existsByUsername(username)) {
            throw new UserAlreadyExistsException("This username already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));

        return userRepository.save(user);
    }
}
