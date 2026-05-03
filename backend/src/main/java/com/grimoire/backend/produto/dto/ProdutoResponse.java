package com.grimoire.backend.produto.dto;

import com.grimoire.backend.produto.Produto;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProdutoResponse(
    Long id,
    String nome,
    String descricao,
    BigDecimal precoUnitario,
    BigDecimal precoCusto,
    String codigoBarras,
    Long categoriaId,
    String categoriaNome,
    BigDecimal quantidadeEstoque,
    BigDecimal estoqueMinimo,
    boolean abaixoDoMinimo,
    Boolean ativo,
    LocalDateTime criadoEm,
    LocalDateTime editadoEm
) {
    public static ProdutoResponse from(Produto p) {
        boolean abaixo = p.getEstoqueMinimo() != null
            && p.getQuantidadeEstoque() != null
            && p.getEstoqueMinimo().compareTo(BigDecimal.ZERO) > 0
            && p.getQuantidadeEstoque().compareTo(p.getEstoqueMinimo()) < 0;

        return new ProdutoResponse(
            p.getId(),
            p.getNome(),
            p.getDescricao(),
            p.getPrecoUnitario(),
            p.getPrecoCusto(),
            p.getCodigoBarras(),
            p.getCategoria() != null ? p.getCategoria().getId()   : null,
            p.getCategoria() != null ? p.getCategoria().getNome() : null,
            p.getQuantidadeEstoque(),
            p.getEstoqueMinimo(),
            abaixo,
            p.isAtivo(),
            p.getCriadoEm(),
            p.getEditadoEm()
        );
    }
}
