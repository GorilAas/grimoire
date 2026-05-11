package com.grimoire.backend.cargo;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/cargos")
@RequiredArgsConstructor
public class CargoSistemaController {

    private final CargoSistemaService service;

    @GetMapping
    public List<CargoSistemaResponse> listarAtivos() {
        return service.listarAtivos().stream().map(CargoSistemaResponse::from).toList();
    }

    @GetMapping("/todos")
    public List<CargoSistemaResponse> listarTodos() {
        return service.listarTodos().stream().map(CargoSistemaResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<CargoSistemaResponse> criar(@Valid @RequestBody CargoSistemaRequest dto) {
        CargoSistema cargo = service.criar(dto);
        return ResponseEntity.created(URI.create("/api/cargos/" + cargo.getId()))
            .body(CargoSistemaResponse.from(cargo));
    }

    @PutMapping("/{id}")
    public CargoSistemaResponse atualizar(@PathVariable Long id, @Valid @RequestBody CargoSistemaRequest dto) {
        return CargoSistemaResponse.from(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        service.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reativar")
    public CargoSistemaResponse reativar(@PathVariable Long id) {
        service.reativar(id);
        return CargoSistemaResponse.from(service.buscarPorId(id));
    }
}
