package com.grimoire.backend.funcionario;

import com.grimoire.backend.funcionario.dto.FuncionarioRequest;
import com.grimoire.backend.shared.enums.Cargo;
import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import com.grimoire.backend.shared.exception.RegraNegocioException;
import com.grimoire.backend.usuario.Usuario;
import com.grimoire.backend.usuario.UsuarioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FuncionarioService {

    private final FuncionarioRepository repository;
    private final UsuarioService usuarioService;

    public FuncionarioService(FuncionarioRepository repository, UsuarioService usuarioService) {
        this.repository = repository;
        this.usuarioService = usuarioService;
    }

    public Funcionario criar(FuncionarioRequest dto) {
        Funcionario funcionario = Funcionario.builder()
                .nome(dto.nome())
                .cargo(dto.cargo())
                .telefone(dto.telefone())
                .endereco(dto.endereco())
                .telefoneEmergencia(dto.telefoneEmergencia())
                .dataAdmissao(dto.dataAdmissao())
                .dataNascimento(dto.dataNascimento())
                .cargaHorariaDiaria(dto.cargaHorariaDiaria() != null
                    ? dto.cargaHorariaDiaria() : java.math.BigDecimal.valueOf(8))
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
        funcionario.setDataNascimento(dto.dataNascimento());
        if (dto.cargaHorariaDiaria() != null)
            funcionario.setCargaHorariaDiaria(dto.cargaHorariaDiaria());
        return repository.save(funcionario);
    }

    public void inativar(Long id) {
        Funcionario funcionario = buscarPorId(id);
        funcionario.setAtivo(false);
    }

    // Cria login (email + senha) para um funcionário existente
    public Funcionario criarAcesso(Long id, String email, String senha, String perfil) {
        Funcionario funcionario = buscarPorId(id);

        if (funcionario.getUsuario() != null) {
            throw new RegraNegocioException("Funcionário já possui acesso cadastrado");
        }

        // perfil padrão baseado no cargo se não informado
        String perfilEfetivo = perfil != null ? perfil : resolverPerfil(funcionario.getCargo());

        Usuario usuario = usuarioService.criar(funcionario.getNome(), email, senha, perfilEfetivo);
        funcionario.setUsuario(usuario);
        return repository.save(funcionario);
    }

    // Revoga o acesso (desvincula o usuário do funcionário e desativa)
    public void revogarAcesso(Long id) {
        Funcionario funcionario = buscarPorId(id);

        if (funcionario.getUsuario() == null) {
            throw new RegraNegocioException("Funcionário não possui acesso cadastrado");
        }

        if ("ADMIN".equals(funcionario.getUsuario().getPerfil())) {
            throw new RegraNegocioException("Não é possível revogar o acesso do administrador");
        }

        Usuario usuario = funcionario.getUsuario();
        usuario.setAtivo(false);
        funcionario.setUsuario(null);
        repository.save(funcionario);
    }

    private String resolverPerfil(Cargo cargo) {
        return switch (cargo) {
            case GERENTE  -> "GERENTE";
            case ATENDENTE -> "ATENDENTE";
            case PADEIRO   -> "PADEIRO";
        };
    }
}
