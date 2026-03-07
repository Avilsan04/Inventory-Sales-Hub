package com.inventorysaleshub.user.application.ports.inbound;

import com.inventorysaleshub.user.domain.entities.User;

public interface RegisterUserPort {

    User register(String username, String email, String password);
}
