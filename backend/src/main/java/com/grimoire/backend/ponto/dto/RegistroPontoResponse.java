package com.grimoire.backend.ponto.dto;

import com.grimoire.backend.ponto.RegistroPonto;
import java.time.LocalDateTime;

public record RegistroPontoResponse(
    Long id,
    Long funcionarioId,
    String funcionarioNome,
    String tipo,
    LocalDateTime momento,
    String observacao,
    boolean ajusteManual
) {
    public static RegistroPontoResponse from(RegistroPonto r) {
        return new RegistroPontoResponse(
            r.getId(),
            r.getFuncionario().getId(),
            r.getFuncionario().getNome(),
            r.getTipo(),
            r.getMomento(),
            r.getObservacao(),
            r.isAjusteManual()
        );
    }
}
