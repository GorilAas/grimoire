package com.grimoire.backend.funcionario;

import com.grimoire.backend.funcionario.dto.FuncionarioRequest;
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
                .cargo(normalizarCargo(dto.cargo()))
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
                        "Funcionario " + id + " nao encontrado"));
    }

    @Transactional(readOnly = true)
    public Funcionario buscarPorUsuarioId(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RegraNegocioException(
                        "Nenhum funcionario vinculado a este usuario. Contate o administrador."));
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
    public List<Funcionario> listarPorCargo(String cargo) {
        return repository.listarAtivosPorCargo(normalizarCargo(cargo));
    }

    public Funcionario atualizar(Long id, FuncionarioRequest dto) {
        Funcionario funcionario = buscarPorId(id);
        funcionario.setNome(dto.nome());
        funcionario.setCargo(normalizarCargo(dto.cargo()));
        funcionario.setTelefone(dto.telefone());
        funcionario.setEndereco(dto.endereco());
        funcionario.setTelefoneEmergencia(dto.telefoneEmergencia());
        funcionario.setDataAdmissao(dto.dataAdmissao());
        funcionario.setDataNascimento(dto.dataNascimento());
        if (dto.cargaHorariaDiaria() != null) {
            funcionario.setCargaHorariaDiaria(dto.cargaHorariaDiaria());
        }
        return repository.save(funcionario);
    }

    public void inativar(Long id) {
        Funcionario funcionario = buscarPorId(id);
        if (funcionario.getUsuario() != null && "ADMIN".equals(funcionario.getUsuario().getPerfil())) {
            throw new RegraNegocioException("Nao e possivel inativar o administrador");
        }
        funcionario.setAtivo(false);
    }

    public Funcionario criarAcesso(Long id, String email, String senha, String perfil, List<String> telasPermitidas) {
        Funcionario funcionario = buscarPorId(id);

        if (funcionario.getUsuario() != null) {
            throw new RegraNegocioException("Funcionario ja possui acesso cadastrado");
        }

        String perfilEfetivo = perfil != null && !perfil.isBlank() ? normalizarPerfil(perfil) : resolverPerfil(funcionario.getCargo());
        String telas = "ADMIN".equals(perfilEfetivo) ? null : normalizarTelas(telasPermitidas);

        Usuario usuario = usuarioService.criar(funcionario.getNome(), email, senha, perfilEfetivo, telas);
        funcionario.setUsuario(usuario);
        return repository.save(funcionario);
    }

    public Funcionario atualizarAcesso(Long id, String email, String senha, String perfil, List<String> telasPermitidas) {
        Funcionario funcionario = buscarPorId(id);

        if (funcionario.getUsuario() == null) {
            throw new RegraNegocioException("Funcionario nao possui acesso cadastrado");
        }

        Usuario usuario = funcionario.getUsuario();
        String perfilEfetivo = perfil != null && !perfil.isBlank() ? normalizarPerfil(perfil) : usuario.getPerfil();
        String telas = "ADMIN".equals(perfilEfetivo) ? null : normalizarTelas(telasPermitidas);

        usuarioService.atualizarAcesso(usuario, email, senha, perfilEfetivo, telas);
        return repository.save(funcionario);
    }

    public void revogarAcesso(Long id) {
        Funcionario funcionario = buscarPorId(id);

        if (funcionario.getUsuario() == null) {
            throw new RegraNegocioException("Funcionario nao possui acesso cadastrado");
        }

        if ("ADMIN".equals(funcionario.getUsuario().getPerfil())) {
            throw new RegraNegocioException("Nao e possivel revogar o acesso do administrador");
        }

        Usuario usuario = funcionario.getUsuario();
        usuario.setAtivo(false);
        funcionario.setUsuario(null);
        repository.save(funcionario);
    }

    private String resolverPerfil(String cargo) {
        return switch (normalizarCargo(cargo)) {
            case "GERENTE" -> "GERENTE";
            case "PADEIRO" -> "PADEIRO";
            default -> "ATENDENTE";
        };
    }

    private String normalizarCargo(String cargo) {
        if (cargo == null || cargo.isBlank()) {
            throw new RegraNegocioException("Cargo e obrigatorio");
        }
        return cargo.trim().toUpperCase();
    }

    private String normalizarPerfil(String perfil) {
        return switch (perfil.trim().toUpperCase()) {
            case "ADMIN", "GERENTE", "ATENDENTE", "PADEIRO" -> perfil.trim().toUpperCase();
            default -> throw new RegraNegocioException("Perfil invalido");
        };
    }

    private String normalizarTelas(List<String> telasPermitidas) {
        if (telasPermitidas == null || telasPermitidas.isEmpty()) return null;
        return telasPermitidas.stream()
            .filter(tela -> tela != null && !tela.isBlank())
            .map(String::trim)
            .distinct()
            .reduce((a, b) -> a + "," + b)
            .orElse(null);
    }
}
