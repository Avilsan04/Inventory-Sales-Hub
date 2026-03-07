package com.inventorysaleshub.user.application.ports.outbound;

public interface TokenProviderPort {

    String generateToken(String username, Long userId);

    boolean isTokenValid(String token);
}
