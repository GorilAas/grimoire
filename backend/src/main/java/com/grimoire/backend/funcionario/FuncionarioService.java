package com.grimoire.backend.funcionario;

import com.grimoire.backend.funcionario.dto.FuncionarioRequest;
import com.grimoire.backend.shared.enums.Cargo;
import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class FuncionarioService {

    private final FuncionarioRepository repository;

    public FuncionarioService(FuncionarioRepository repository) {
        this.repository = repository;
    }

    public Funcionario criar(FuncionarioRequest dto) {
        Funcionario funcionario = Funcionario.builder()
                .nome(dto.nome())
                .cargo(dto.cargo())
                .telefone(dto.telefone())
                .endereco(dto.endereco())
                .telefoneEmergencia(dto.telefoneEmergencia())
                .dataAdmissao(dto.dataAdmissao())
                .ativo(true)
                .build();
        return repository.save(funcionario);
    }

    @Transactional(readOnly = true)
    public Funcionario buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Funcionário " + id + " não encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Funcionario> listarAtivos() {
        return repository.listarAtivos();
    }

    @Transactional(readOnly = true)
    public List<Funcionario> listarTodos() {
        return repository.listarTodos();
    }

    @Transactional(readOnly = true)
    public List<Funcionario> listarPorCargo(Cargo cargo) {
        return repository.listarAtivosPorCargo(cargo);
    }

    public Funcionario atualizar(Long id, FuncionarioRequest dto) {
        Funcionario funcionario = buscarPorId(id);
        funcionario.setNome(dto.nome());
        funcionario.setCargo(dto.cargo());
        funcionario.setTelefone(dto.telefone());
        funcionario.setEndereco(dto.endereco());
        funcionario.setTelefoneEmergencia(dto.telefoneEmergencia());
        funcionario.setDataAdmissao(dto.dataAdmissao());
        return repository.save(funcionario);
    }

    public void inativar(Long id) {
        Funcionario funcionario = buscarPorId(id);
        funcionario.setAtivo(false);
    }
}
