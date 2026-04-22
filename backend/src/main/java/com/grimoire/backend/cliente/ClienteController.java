package com.grimoire.backend.cliente;

import com.grimoire.backend.cliente.dto.ClienteRequest;
import com.grimoire.backend.cliente.dto.ClienteResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> criar(@Valid @RequestBody ClienteRequest dto) {
        Cliente cliente = service.criar(dto);
        URI uri = URI.create("/api/clientes/" + cliente.getId());
        return ResponseEntity.created(uri).body(ClienteResponse.from(cliente));
    }

    @GetMapping
    public List<ClienteResponse> listarAtivos() {
        return service.listarAtivos().stream()
                .map(ClienteResponse::from)
                .toList();
    }

    @GetMapping("/todos")
    public List<ClienteResponse> listarTodos() {
        return service.listarTodos().stream()
                .map(ClienteResponse::from)
                .toList();
    }

    @GetMapping("/fiado")
    public List<ClienteResponse> listarComFiadoEmAberto() {
        return service.listarComFiadoEmAberto().stream()
                .map(ClienteResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ClienteResponse buscarPorId(@PathVariable Long id) {
        return ClienteResponse.from(service.buscarPorId(id));
    }

    @GetMapping("/cpf/{cpf}")
    public ClienteResponse buscarPorCpf(@PathVariable String cpf) {
        return ClienteResponse.from(service.buscarPorCpf(cpf));
    }

    @PutMapping("/{id}")
    public ClienteResponse atualizar(@PathVariable Long id,
                                     @Valid @RequestBody ClienteRequest dto) {
        return ClienteResponse.from(service.atualizar(id, dto));
    }

    @PatchMapping("/{id}/cpf")
    public ClienteResponse corrigirCpf(@PathVariable Long id,
                                       @RequestBody String novoCpf) {
        return ClienteResponse.from(service.corrigirCpf(id, novoCpf));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        service.inativar(id);
        return ResponseEntity.noContent().build();
    }
}