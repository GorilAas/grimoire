package com.grimoire.backend.ponto.dto;

import java.time.LocalDate;
import java.util.List;

public record ResumoPontoResponse(
    Long funcionarioId,
    String funcionarioNome,
    LocalDate data,
    List<RegistroPontoResponse> registros,
    double horasTrabalhadasDecimal,
    String horasTrabalhadas,
    double horasEsperadasDecimal,
    String horasEsperadas,
    double saldoDecimal,
    String saldo,
    boolean emAndamento
) {}
