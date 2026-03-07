package com.inventorysaleshub.user.domain.exceptions;

import com.inventorysaleshub.shared.domain.exceptions.DomainException;

public class UserAlreadyExistsException extends DomainException {

    public UserAlreadyExistsException(String message) {
        super(message);
    }
}
