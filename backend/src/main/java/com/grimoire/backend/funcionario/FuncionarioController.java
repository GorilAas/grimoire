package com.grimoire.backend.funcionario;

import com.grimoire.backend.funcionario.dto.FuncionarioRequest;
import com.grimoire.backend.funcionario.dto.FuncionarioResponse;
import com.grimoire.backend.shared.enums.Cargo;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<FuncionarioResponse> criar(@Valid @RequestBody FuncionarioRequest dto) {
        Funcionario f = service.criar(dto);
        URI uri = URI.create("/api/funcionarios/" + f.getId());
        return ResponseEntity.created(uri).body(FuncionarioResponse.from(f));
    }

    @GetMapping
    public List<FuncionarioResponse> listarAtivos() {
        return service.listarAtivos().stream()
                .map(FuncionarioResponse::from)
                .toList();
    }

    @GetMapping("/todos")
    public List<FuncionarioResponse> listarTodos() {
        return service.listarTodos().stream()
                .map(FuncionarioResponse::from)
                .toList();
    }

    @GetMapping("/cargo/{cargo}")
    public List<FuncionarioResponse> listarPorCargo(@PathVariable Cargo cargo) {
        return service.listarPorCargo(cargo).stream()
                .map(FuncionarioResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public FuncionarioResponse buscarPorId(@PathVariable Long id) {
        return FuncionarioResponse.from(service.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public FuncionarioResponse atualizar(@PathVariable Long id,
                                          @Valid @RequestBody FuncionarioRequest dto) {
        return FuncionarioResponse.from(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        service.inativar(id);
        return ResponseEntity.noContent().build();
    }
}
