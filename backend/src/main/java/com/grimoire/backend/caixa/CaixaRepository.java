package com.grimoire.backend.caixa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CaixaRepository extends JpaRepository<Caixa, Long> {
    Optional<Caixa> findByStatus(String status);

    @Query("SELECT c FROM Caixa c ORDER BY c.abertoEm DESC")
    List<Caixa> findAllOrderByAbertoEmDesc();
}
