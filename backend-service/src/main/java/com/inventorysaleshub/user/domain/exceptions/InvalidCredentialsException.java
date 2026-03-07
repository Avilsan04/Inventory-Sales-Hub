package com.inventorysaleshub.user.domain.exceptions;

import com.inventorysaleshub.shared.domain.exceptions.DomainException;

public class InvalidCredentialsException extends DomainException {

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
