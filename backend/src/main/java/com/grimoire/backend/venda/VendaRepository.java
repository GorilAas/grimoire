package com.grimoire.backend.venda;

import com.grimoire.backend.shared.enums.FormaPagamento;
import com.grimoire.backend.shared.enums.StatusFiado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VendaRepository extends JpaRepository<Venda, Long> {

    @Query("""
            SELECT DISTINCT v FROM Venda v
            LEFT JOIN FETCH v.cliente
            LEFT JOIN FETCH v.funcionario
            LEFT JOIN FETCH v.itens i
            LEFT JOIN FETCH i.produto
            WHERE v.id = :id
            """)
    Optional<Venda> buscarPorIdCompleto(@Param("id") Long id);

    @Query("""
            SELECT DISTINCT v FROM Venda v
            LEFT JOIN FETCH v.cliente
            LEFT JOIN FETCH v.funcionario
            LEFT JOIN FETCH v.itens i
            LEFT JOIN FETCH i.produto
            ORDER BY v.dataVenda DESC
            """)
    List<Venda> listarTodas();

    @Query("""
            SELECT DISTINCT v FROM Venda v
            LEFT JOIN FETCH v.cliente
            LEFT JOIN FETCH v.funcionario
            LEFT JOIN FETCH v.itens i
            LEFT JOIN FETCH i.produto
            WHERE v.cliente.id = :clienteId
            ORDER BY v.dataVenda DESC
            """)
    List<Venda> listarPorCliente(@Param("clienteId") Long clienteId);

    @Query("""
            SELECT DISTINCT v FROM Venda v
            LEFT JOIN FETCH v.cliente
            LEFT JOIN FETCH v.funcionario
            LEFT JOIN FETCH v.itens i
            LEFT JOIN FETCH i.produto
            WHERE v.funcionario.id = :funcionarioId
            ORDER BY v.dataVenda DESC
            """)
    List<Venda> listarPorFuncionario(@Param("funcionarioId") Long funcionarioId);

    @Query("""
            SELECT DISTINCT v FROM Venda v
            LEFT JOIN FETCH v.cliente
            LEFT JOIN FETCH v.funcionario
            LEFT JOIN FETCH v.itens i
            LEFT JOIN FETCH i.produto
            WHERE v.formaPagamento = :formaPagamento
            ORDER BY v.dataVenda DESC
            """)
    List<Venda> listarPorFormaPagamento(@Param("formaPagamento") FormaPagamento formaPagamento);

    @Query("""
            SELECT DISTINCT v FROM Venda v
            LEFT JOIN FETCH v.cliente
            LEFT JOIN FETCH v.funcionario
            LEFT JOIN FETCH v.itens i
            LEFT JOIN FETCH i.produto
            WHERE v.statusFiado = :statusFiado
            ORDER BY v.dataVenda DESC
            """)
    List<Venda> listarPorStatusFiado(@Param("statusFiado") StatusFiado statusFiado);

    @Query("""
            SELECT DISTINCT v FROM Venda v
            LEFT JOIN FETCH v.cliente
            LEFT JOIN FETCH v.funcionario
            LEFT JOIN FETCH v.itens i
            LEFT JOIN FETCH i.produto
            WHERE v.dataVenda >= :inicio AND v.dataVenda <= :fim
            ORDER BY v.dataVenda DESC
            """)
    List<Venda> listarPorPeriodo(@Param("inicio") LocalDateTime inicio,
                                 @Param("fim") LocalDateTime fim);
}
