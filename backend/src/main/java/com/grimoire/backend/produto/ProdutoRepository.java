package com.grimoire.backend.produto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long>{

    Optional<Produto> findByCodigoBarras(String codigoBarras);

    @Query("SELECT p FROM  Produto p WHERE  p.ativo = true ORDER BY  p.nome")
    List<Produto> listarAtivos();

    boolean existsByCodigoBarras(String codigoBarras);

    @Query("SELECT p FROM Produto p ORDER BY p.nome")
    List<Produto> listarTodos();
}
