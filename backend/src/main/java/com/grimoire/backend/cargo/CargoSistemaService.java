package com.grimoire.backend.cargo;

import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import com.grimoire.backend.shared.exception.RegraNegocioException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CargoSistemaService {

    private final CargoSistemaRepository repository;

    @Transactional(readOnly = true)
    public List<CargoSistema> listarTodos() {
        return repository.findAllByOrderByNomeAsc();
    }

    @Transactional(readOnly = true)
    public List<CargoSistema> listarAtivos() {
        return repository.findByAtivoTrueOrderByNomeAsc();
    }

    @Transactional(readOnly = true)
    public CargoSistema buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Cargo " + id + " nao encontrado"));
    }

    public CargoSistema criar(CargoSistemaRequest dto) {
        String nome = normalizarNome(dto.nome());
        if (repository.existsByNomeIgnoreCase(nome)) {
            throw new RegraNegocioException("Cargo ja cadastrado");
        }

        return repository.save(CargoSistema.builder()
            .nome(nome)
            .descricao(dto.descricao())
            .perfilPadrao(normalizarPerfil(dto.perfilPadrao()))
            .ativo(true)
            .build());
    }

    public CargoSistema atualizar(Long id, CargoSistemaRequest dto) {
        CargoSistema cargo = buscarPorId(id);
        String nome = normalizarNome(dto.nome());

        repository.findByNomeIgnoreCase(nome)
            .filter(existente -> !existente.getId().equals(id))
            .ifPresent(existente -> {
                throw new RegraNegocioException("Cargo ja cadastrado");
            });

        cargo.setNome(nome);
        cargo.setDescricao(dto.descricao());
        cargo.setPerfilPadrao(normalizarPerfil(dto.perfilPadrao()));
        return repository.save(cargo);
    }

    public void inativar(Long id) {
        CargoSistema cargo = buscarPorId(id);
        cargo.setAtivo(false);
    }

    public void reativar(Long id) {
        CargoSistema cargo = buscarPorId(id);
        cargo.setAtivo(true);
    }

    private String normalizarNome(String nome) {
        if (nome == null || nome.isBlank()) {
            throw new RegraNegocioException("Nome do cargo e obrigatorio");
        }
        return nome.trim().toUpperCase();
    }

    private String normalizarPerfil(String perfil) {
        if (perfil == null || perfil.isBlank()) return "ATENDENTE";
        return switch (perfil.trim().toUpperCase()) {
            case "ADMIN", "GERENTE", "ATENDENTE", "PADEIRO" -> perfil.trim().toUpperCase();
            default -> throw new RegraNegocioException("Perfil padrao invalido");
        };
    }
}
