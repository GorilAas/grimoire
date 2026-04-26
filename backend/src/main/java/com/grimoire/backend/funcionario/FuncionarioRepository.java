package com.grimoire.backend.funcionario;

import com.grimoire.backend.shared.enums.Cargo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {

    @Query("SELECT f FROM Funcionario f WHERE f.ativo = true ORDER BY f.nome")
    List<Funcionario> listarAtivos();

    @Query("SELECT f FROM Funcionario f WHERE f.ativo = true AND f.cargo = :cargo ORDER BY f.nome")
    List<Funcionario> listarAtivosPorCargo(Cargo cargo);

    @Query("SELECT f FROM Funcionario f ORDER BY f.nome")
    List<Funcionario> listarTodos();
}
