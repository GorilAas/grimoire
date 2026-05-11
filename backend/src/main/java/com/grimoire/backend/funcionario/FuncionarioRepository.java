package com.grimoire.backend.funcionario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    @Query("SELECT f FROM Funcionario f WHERE f.ativo = true ORDER BY f.nome")
    List<Funcionario> listarAtivos();

    @Query("SELECT f FROM Funcionario f WHERE f.ativo = true AND UPPER(f.cargo) = UPPER(:cargo) ORDER BY f.nome")
    List<Funcionario> listarAtivosPorCargo(String cargo);

    @Query("SELECT f FROM Funcionario f ORDER BY f.nome")
    List<Funcionario> listarTodos();

    Optional<Funcionario> findByUsuarioId(Long usuarioId);
}
