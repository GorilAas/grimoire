package com.grimoire.backend.produto;

import com.grimoire.backend.produto.dto.ProdutoRequest;
import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import com.grimoire.backend.shared.exception.RegraNegocioException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional

public class ProdutoService {

    private final  ProdutoRepository repository;

    public ProdutoService(ProdutoRepository repository) {
        this.repository = repository;
    }

    public Produto criar(ProdutoRequest dto) {
        if (dto.codigoBarras() != null && repository.existsByCodigoBarras(dto.codigoBarras())) {
            throw new RegraNegocioException("Código de barras já cadastrado");
        }

        Produto produto = Produto.builder()
                .nome(dto.nome())
                .descricao(dto.descricao())
                .precoUnitario(dto.precoUnitario())
                .codigoBarras(dto.codigoBarras())
                .ativo(true)
                .build();

        return repository.save(produto);
    }

    @Transactional(readOnly = true)
    public Produto buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto " + id + "não  encontrado"));
    }

    @Transactional(readOnly = true)
    public Produto buscarPorCodigoBarras(String codigoBarras) {
        return repository.findByCodigoBarras(codigoBarras)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto com codigo " + codigoBarras + "não encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Produto> listarAtivos() {
        return repository.listarAtivos();
    }

    @Transactional(readOnly = true)
    public List<Produto> listarTodos() {
        return repository.listarTodos();
    }

    public Produto atualizar(Long id, ProdutoRequest dto) {
        Produto produto  = buscarPorId(id);

        if (dto.codigoBarras() != null  && !dto.codigoBarras().equals(produto.getCodigoBarras()) && repository.existsByCodigoBarras(dto.codigoBarras())) {
            throw new RegraNegocioException("Código de barras já cadastrado para outro produto");
        }

        produto.setNome(dto.nome());
        produto.setDescricao(dto.descricao());
        produto.setPrecoUnitario(dto.precoUnitario());
        produto.setCodigoBarras(dto.codigoBarras());

        return  repository.save(produto);
    }

    public void inativar(Long id) {
        Produto produto = buscarPorId(id);
        if (!produto.isAtivo()) {
            throw new RegraNegocioException("Produto já está inativo");
        }
        produto.setAtivo(false);
    }

    public void reativar(Long id) {
        Produto produto = buscarPorId(id);
        if (produto.isAtivo()) {
            throw new RegraNegocioException("Produto já está ativo");
        }
        produto.setAtivo(true);
    }
}
