package com.grimoire.backend.produto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    Optional<Produto> findByCodigoBarras(String codigoBarras);
    boolean existsByCodigoBarras(String codigoBarras);

    @Query("SELECT p FROM Produto p WHERE p.ativo = true ORDER BY p.nome")
    List<Produto> listarAtivos();

    @Query("SELECT p FROM Produto p ORDER BY p.nome")
    List<Produto> listarTodos();

    @Query("SELECT p FROM Produto p WHERE p.ativo = true AND LOWER(p.nome) LIKE LOWER(CONCAT('%', :termo, '%')) ORDER BY p.nome")
    List<Produto> buscarPorNome(@Param("termo") String termo);

    @Query("SELECT p FROM Produto p WHERE p.ativo = true AND p.estoqueMinimo > 0 AND p.quantidadeEstoque < p.estoqueMinimo ORDER BY p.nome")
    List<Produto> listarAbaixoDoMinimo();

    @Query("SELECT p FROM Produto p WHERE p.ativo = true AND p.categoria.id = :categoriaId ORDER BY p.nome")
    List<Produto> listarPorCategoria(@Param("categoriaId") Long categoriaId);
}
