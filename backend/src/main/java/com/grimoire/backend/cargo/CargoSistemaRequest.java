package com.grimoire.backend.cargo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CargoSistemaRequest(
    @NotBlank(message = "Nome do cargo e obrigatorio")
    @Size(max = 80, message = "Nome do cargo deve ter no maximo 80 caracteres")
    String nome,

    @Size(max = 300, message = "Descricao deve ter no maximo 300 caracteres")
    String descricao,

    String perfilPadrao
) {}
