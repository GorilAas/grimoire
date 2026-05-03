package com.grimoire.backend.categoria;

import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import com.grimoire.backend.shared.exception.RegraNegocioException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaService {
    private final CategoriaRepository repository;

    public Categoria criar(String nome) {
        if (repository.existsByNome(nome.trim()))
            throw new RegraNegocioException("Categoria '" + nome + "' já existe");
        return repository.save(Categoria.builder().nome(nome.trim()).build());
    }

    @Transactional(readOnly = true)
    public List<Categoria> listar() { return repository.findAllByOrderByNome(); }

    @Transactional(readOnly = true)
    public Categoria buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria " + id + " não encontrada"));
    }

    public Categoria atualizar(Long id, String nome) {
        Categoria cat = buscarPorId(id);
        if (!cat.getNome().equals(nome.trim()) && repository.existsByNome(nome.trim()))
            throw new RegraNegocioException("Categoria '" + nome + "' já existe");
        cat.setNome(nome.trim());
        return repository.save(cat);
    }

    public void excluir(Long id) {
        repository.delete(buscarPorId(id));
    }
}
