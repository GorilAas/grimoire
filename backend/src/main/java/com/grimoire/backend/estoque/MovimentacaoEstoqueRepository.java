package com.grimoire.backend.estoque;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {

    @Query("""
        SELECT m FROM MovimentacaoEstoque m
        JOIN FETCH m.produto
        WHERE m.produto.id = :produtoId
        ORDER BY m.criadoEm DESC
        """)
    List<MovimentacaoEstoque> listarPorProduto(Long produtoId);
}
