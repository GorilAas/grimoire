package com.grimoire.backend.funcionario;

import com.grimoire.backend.funcionario.dto.FuncionarioRequest;
import com.grimoire.backend.funcionario.dto.FuncionarioResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/funcionarios")
public class FuncionarioController {

    private final FuncionarioService service;

    public FuncionarioController(FuncionarioService service) {
        this.service = service;
    }

    public record CriarAcessoRequest(
        @NotBlank(message = "E-mail e obrigatorio")
        @Email(message = "E-mail invalido")
        String email,

        @NotBlank(message = "Senha e obrigatoria")
        @Size(min = 6, message = "Senha deve ter no minimo 6 caracteres")
        String senha,

        String perfil,
        List<String> telasPermitidas
    ) {}

    public record AtualizarAcessoRequest(
        String perfil,
        List<String> telasPermitidas
    ) {}

    @PostMapping
    public ResponseEntity<FuncionarioResponse> criar(@Valid @RequestBody FuncionarioRequest dto) {
        Funcionario f = service.criar(dto);
        URI uri = URI.create("/api/funcionarios/" + f.getId());
        return ResponseEntity.created(uri).body(FuncionarioResponse.from(f));
    }

    @GetMapping
    public List<FuncionarioResponse> listarAtivos() {
        return service.listarAtivos().stream().map(FuncionarioResponse::from).toList();
    }

    @GetMapping("/todos")
    public List<FuncionarioResponse> listarTodos() {
        return service.listarTodos().stream().map(FuncionarioResponse::from).toList();
    }

    @GetMapping("/cargo/{cargo}")
    public List<FuncionarioResponse> listarPorCargo(@PathVariable String cargo) {
        return service.listarPorCargo(cargo).stream().map(FuncionarioResponse::from).toList();
    }

    @GetMapping("/me")
    public FuncionarioResponse buscarMeuFuncionario(Authentication auth) {
        Long usuarioId = (Long) auth.getPrincipal();
        return FuncionarioResponse.from(service.buscarPorUsuarioId(usuarioId));
    }

    @GetMapping("/{id}")
    public FuncionarioResponse buscarPorId(@PathVariable Long id) {
        return FuncionarioResponse.from(service.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public FuncionarioResponse atualizar(@PathVariable Long id, @Valid @RequestBody FuncionarioRequest dto) {
        return FuncionarioResponse.from(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        service.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/acesso")
    public ResponseEntity<FuncionarioResponse> criarAcesso(
            @PathVariable Long id,
            @Valid @RequestBody CriarAcessoRequest dto) {
        Funcionario f = service.criarAcesso(id, dto.email(), dto.senha(), dto.perfil(), dto.telasPermitidas());
        return ResponseEntity.ok(FuncionarioResponse.from(f));
    }

    @PatchMapping("/{id}/acesso")
    public FuncionarioResponse atualizarAcesso(
            @PathVariable Long id,
            @RequestBody AtualizarAcessoRequest dto) {
        return FuncionarioResponse.from(service.atualizarAcesso(id, dto.perfil(), dto.telasPermitidas()));
    }

    @DeleteMapping("/{id}/acesso")
    public ResponseEntity<Void> revogarAcesso(@PathVariable Long id) {
        service.revogarAcesso(id);
        return ResponseEntity.noContent().build();
    }
}
