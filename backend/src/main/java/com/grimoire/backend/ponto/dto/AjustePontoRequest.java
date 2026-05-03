package com.grimoire.backend.ponto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record AjustePontoRequest(
    @NotNull Long funcionarioId,
    @NotNull LocalDateTime momento,
    @NotBlank String tipo,
    String observacao
) {}
