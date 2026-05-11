package com.grimoire.backend.categoria;

import jakarta.validation.Valid;
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

    public record CategoriaRequest(
        @NotBlank(message = "Nome e obrigatorio")
        String nome
    ) {}

    public record CategoriaResponse(Long id, String nome) {
        static CategoriaResponse from(Categoria categoria) {
            return new CategoriaResponse(categoria.getId(), categoria.getNome());
        }
    }

    @GetMapping
    public List<CategoriaResponse> listar() {
        return service.listar().stream().map(CategoriaResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<CategoriaResponse> criar(@Valid @RequestBody CategoriaRequest dto) {
        Categoria categoria = service.criar(dto.nome());
        return ResponseEntity.created(URI.create("/api/categorias/" + categoria.getId()))
            .body(CategoriaResponse.from(categoria));
    }

    @PutMapping("/{id}")
    public CategoriaResponse atualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequest dto) {
        return CategoriaResponse.from(service.atualizar(id, dto.nome()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
