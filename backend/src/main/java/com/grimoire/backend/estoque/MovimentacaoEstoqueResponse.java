package com.grimoire.backend.estoque;

import com.grimoire.backend.shared.enums.MotivoMovimentacao;
import com.grimoire.backend.shared.enums.TipoMovimentacao;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MovimentacaoEstoqueResponse(
        Long id,
        Long produtoId,
        String produtoNome,
        TipoMovimentacao tipo,
        BigDecimal quantidade,
        MotivoMovimentacao motivo,
        Long referenciaId,
        String observacao,
        LocalDateTime criadoEm
) {
    public static MovimentacaoEstoqueResponse from(MovimentacaoEstoque m) {
        return new MovimentacaoEstoqueResponse(
                m.getId(),
                m.getProduto().getId(),
                m.getProduto().getNome(),
                m.getTipo(),
                m.getQuantidade(),
                m.getMotivo(),
                m.getReferenciaId(),
                m.getObservacao(),
                m.getCriadoEm()
        );
    }
}
