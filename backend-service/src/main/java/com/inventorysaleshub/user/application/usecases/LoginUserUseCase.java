package com.inventorysaleshub.user.application.usecases;

import com.inventorysaleshub.user.application.ports.inbound.LoginUserPort;
import com.inventorysaleshub.user.application.ports.outbound.PasswordEncoderPort;
import com.inventorysaleshub.user.application.ports.outbound.TokenProviderPort;
import com.inventorysaleshub.user.application.ports.outbound.UserRepositoryPort;
import com.inventorysaleshub.user.domain.entities.User;
import com.inventorysaleshub.user.domain.exceptions.InvalidCredentialsException;
import org.springframework.stereotype.Service;

@Service
public class LoginUserUseCase implements LoginUserPort {

    private final UserRepositoryPort userRepository;
    private final PasswordEncoderPort passwordEncoder;
    private final TokenProviderPort tokenProvider;

    public LoginUserUseCase(UserRepositoryPort userRepository,
                            PasswordEncoderPort passwordEncoder,
                            TokenProviderPort tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("The password or email is incorrect"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("The password or email is incorrect");
        }

        return tokenProvider.generateToken(user.getUsername(), user.getId());
    }
}
