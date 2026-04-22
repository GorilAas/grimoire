package com.grimoire.backend.produto.dto;

import com.grimoire.backend.produto.Produto;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProdutoResponse(
        Long id,
        String nome,
        String descricao,
        BigDecimal precoUnitario,
        String codigoBarras,
        Boolean ativo,
        LocalDateTime criadoEm,
        LocalDateTime editadoEm
) {
    public static ProdutoResponse from(Produto p) {
        return new ProdutoResponse(
                p.getId(),
                p.getNome(),
                p.getDescricao(),
                p.getPrecoUnitario(),
                p.getCodigoBarras(),
                p.isAtivo(),
                p.getCriadoEm(),
                p.getEditadoEm()
        );
    }
}