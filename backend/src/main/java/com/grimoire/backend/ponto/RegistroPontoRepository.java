package com.grimoire.backend.ponto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RegistroPontoRepository extends JpaRepository<RegistroPonto, Long> {

    @Query("""
        SELECT r FROM RegistroPonto r
        WHERE r.funcionario.id = :funcionarioId
          AND r.momento >= :inicioDia AND r.momento < :fimDia
        ORDER BY r.momento DESC
        LIMIT 1
    """)
    Optional<RegistroPonto> findUltimoRegistroDia(
        @Param("funcionarioId") Long funcionarioId,
        @Param("inicioDia") LocalDateTime inicioDia,
        @Param("fimDia") LocalDateTime fimDia
    );

    @Query("""
        SELECT r FROM RegistroPonto r
        WHERE r.funcionario.id = :funcionarioId
          AND r.momento >= :inicioDia AND r.momento < :fimDia
        ORDER BY r.momento ASC
    """)
    List<RegistroPonto> findByFuncionarioAndDia(
        @Param("funcionarioId") Long funcionarioId,
        @Param("inicioDia") LocalDateTime inicioDia,
        @Param("fimDia") LocalDateTime fimDia
    );

    @Query("""
        SELECT r FROM RegistroPonto r
        WHERE r.funcionario.id = :funcionarioId
          AND r.momento >= :inicio AND r.momento <= :fim
        ORDER BY r.momento ASC
    """)
    List<RegistroPonto> findByFuncionarioAndPeriodo(
        @Param("funcionarioId") Long funcionarioId,
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim
    );

    @Query("""
        SELECT r FROM RegistroPonto r
        WHERE r.momento >= :inicio AND r.momento <= :fim
        ORDER BY r.funcionario.nome ASC, r.momento ASC
    """)
    List<RegistroPonto> findAllByPeriodo(
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim
    );
}
