package com.inventorysaleshub.user.application.ports.inbound;

public interface LoginUserPort {

    String login(String email, String password);
}
