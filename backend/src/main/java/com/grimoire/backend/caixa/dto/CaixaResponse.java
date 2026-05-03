package com.grimoire.backend.caixa.dto;

import com.grimoire.backend.caixa.Caixa;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CaixaResponse(
    Long id,
    Long funcionarioId,
    String funcionarioNome,
    LocalDateTime abertoEm,
    LocalDateTime fechadoEm,
    BigDecimal valorAbertura,
    BigDecimal valorFechamento,
    String observacoes,
    String status
) {
    public static CaixaResponse from(Caixa c) {
        return new CaixaResponse(
            c.getId(),
            c.getFuncionario().getId(),
            c.getFuncionario().getNome(),
            c.getAbertoEm(),
            c.getFechadoEm(),
            c.getValorAbertura(),
            c.getValorFechamento(),
            c.getObservacoes(),
            c.getStatus()
        );
    }
}
