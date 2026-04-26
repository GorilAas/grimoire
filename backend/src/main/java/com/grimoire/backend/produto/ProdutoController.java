package com.grimoire.backend.produto;

import com.grimoire.backend.produto.dto.ProdutoRequest;
import com.grimoire.backend.produto.dto.ProdutoResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService service;

    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ProdutoResponse> criar(@Valid @RequestBody ProdutoRequest dto) {
        Produto produto = service.criar(dto);
        URI uri = URI.create("/api/produtos/" + produto.getId());
        return ResponseEntity.created(uri).body(ProdutoResponse.from(produto));
    }

    @GetMapping
    public List<ProdutoResponse> listar() {
        return service.listarAtivos().stream()
                .map(ProdutoResponse::from)
                .toList();
    }

    @GetMapping("/todos")
    public List<ProdutoResponse> listarTodos() {
        return service.listarTodos().stream()
                .map(ProdutoResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ProdutoResponse buscarPorId(@PathVariable Long id) {
        return ProdutoResponse.from(service.buscarPorId(id));
    }

    @GetMapping("/codigo/{codigoBarras}")
    public ProdutoResponse buscarPorCodigo(@PathVariable String codigoBarras) {
        return ProdutoResponse.from(service.buscarPorCodigoBarras(codigoBarras));
    }

    @PutMapping("/{id}")
    public ProdutoResponse atualizar(@PathVariable Long id,
                                     @Valid @RequestBody ProdutoRequest dto) {
        return ProdutoResponse.from(service.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Long id) {
        service.inativar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reativar")
    public ProdutoResponse reativar(@PathVariable Long id) {
        service.reativar(id);
        return ProdutoResponse.from(service.buscarPorId(id));
    }
}