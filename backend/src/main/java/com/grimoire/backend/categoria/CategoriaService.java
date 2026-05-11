package com.grimoire.backend.categoria;

import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import com.grimoire.backend.shared.exception.RegraNegocioException;
import com.grimoire.backend.produto.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaService {

    private final CategoriaRepository repository;
    private final ProdutoRepository produtoRepository;

    public Categoria criar(String nome) {
        String nomeNormalizado = normalizar(nome);
        if (repository.existsByNome(nomeNormalizado)) {
            throw new RegraNegocioException("Categoria '" + nomeNormalizado + "' ja existe");
        }
        return repository.save(Categoria.builder().nome(nomeNormalizado).build());
    }

    @Transactional(readOnly = true)
    public List<Categoria> listar() {
        return repository.findAllByOrderByNome();
    }

    @Transactional(readOnly = true)
    public Categoria buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria " + id + " nao encontrada"));
    }

    public Categoria atualizar(Long id, String nome) {
        Categoria categoria = buscarPorId(id);
        String nomeNormalizado = normalizar(nome);
        if (!categoria.getNome().equals(nomeNormalizado) && repository.existsByNome(nomeNormalizado)) {
            throw new RegraNegocioException("Categoria '" + nomeNormalizado + "' ja existe");
        }
        categoria.setNome(nomeNormalizado);
        return repository.save(categoria);
    }

    public void excluir(Long id) {
        if (produtoRepository.existsByCategoriaId(id)) {
            throw new RegraNegocioException("Categoria nao pode ser excluida porque possui produtos vinculados");
        }
        repository.delete(buscarPorId(id));
    }

    private String normalizar(String nome) {
        if (nome == null || nome.trim().isEmpty()) {
            throw new RegraNegocioException("Nome da categoria e obrigatorio");
        }
        return nome.trim();
    }
}
