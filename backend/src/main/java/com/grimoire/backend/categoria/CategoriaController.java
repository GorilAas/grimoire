package com.grimoire.backend.categoria;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {
    private final CategoriaService service;

    public record CategoriaRequest(@NotBlank(message = "Nome é obrigatório") String nome) {}
    public record CategoriaResponse(Long id, String nome) {
        static CategoriaResponse from(Categoria c) { return new CategoriaResponse(c.getId(), c.getNome()); }
    }

    @GetMapping
    public List<CategoriaResponse> listar() {
        return service.listar().stream().map(CategoriaResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> criar(@RequestBody CategoriaRequest dto) {
        Categoria c = service.criar(dto.nome());
        return ResponseEntity.created(URI.create("/api/categorias/" + c.getId()))
            .body(CategoriaResponse.from(c));
    }

    @PutMapping("/{id}")
    public CategoriaResponse atualizar(@PathVariable Long id, @RequestBody CategoriaRequest dto) {
        return CategoriaResponse.from(service.atualizar(id, dto.nome()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
