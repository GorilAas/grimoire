package com.grimoire.backend.cliente;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByCpf(String cpf);

    boolean existsByCpf(String cpf);

    @Query("SELECT c FROM Cliente c WHERE c.ativo = true ORDER BY c.nome")
    List<Cliente> listarAtivos();

    @Query("SELECT c FROM Cliente c WHERE c.ativo = true AND c.saldoDevedor > 0 ORDER BY c.saldoDevedor DESC")
    List<Cliente> listarComFiadoEmAberto();

    @Query("SELECT c FROM Cliente c ORDER BY c.nome")
    List<Cliente> listarTodos();
}