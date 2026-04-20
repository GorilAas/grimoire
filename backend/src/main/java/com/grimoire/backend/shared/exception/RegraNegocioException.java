package com.grimoire.backend.shared.exception;

public class RegraNegocioException extends  RuntimeException {
    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
