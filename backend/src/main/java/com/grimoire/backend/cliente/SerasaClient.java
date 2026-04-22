package com.grimoire.backend.cliente;

import org.springframework.stereotype.Component;

@Component
public class SerasaClient {

    // Mock — sempre retorna false (não negativado)
    public boolean estaNegativado(String cpf) {
        return false;
    }
}