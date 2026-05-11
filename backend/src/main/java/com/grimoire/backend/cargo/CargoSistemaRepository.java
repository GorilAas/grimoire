package com.grimoire.backend.cargo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CargoSistemaRepository extends JpaRepository<CargoSistema, Long> {
    boolean existsByNomeIgnoreCase(String nome);
    Optional<CargoSistema> findByNomeIgnoreCase(String nome);
    List<CargoSistema> findAllByOrderByNomeAsc();
    List<CargoSistema> findByAtivoTrueOrderByNomeAsc();
}
