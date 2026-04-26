package com.grimoire.backend.cliente.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CpfRequest(
    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}",
             message = "CPF inválido. Use o formato 000.000.000-00")
    String cpf
) {}
