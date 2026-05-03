package com.grimoire.backend.caixa;

import com.grimoire.backend.caixa.dto.CaixaResponse;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/caixa")
@RequiredArgsConstructor
public class CaixaController {

    private final CaixaService service;

    public record AbrirCaixaRequest(
        @NotNull Long funcionarioId,
        BigDecimal valorAbertura,
        String observacoes
    ) {}

    public record FecharCaixaRequest(
        @NotNull @DecimalMin("0") BigDecimal valorFechamento,
        String observacoes
    ) {}

    @GetMapping
    public List<CaixaResponse> listarTodos() {
        return service.listarTodos().stream().map(CaixaResponse::from).toList();
    }

    @GetMapping("/aberto")
    public ResponseEntity<CaixaResponse> buscarAberto() {
        return service.buscarAberto()
            .map(c -> ResponseEntity.ok(CaixaResponse.from(c)))
            .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/{id}")
    public CaixaResponse buscarPorId(@PathVariable Long id) {
        return CaixaResponse.from(service.buscarPorId(id));
    }

    @PostMapping("/abrir")
    public ResponseEntity<CaixaResponse> abrir(@RequestBody AbrirCaixaRequest dto) {
        Caixa c = service.abrir(dto.funcionarioId(), dto.valorAbertura(), dto.observacoes());
        return ResponseEntity.created(URI.create("/api/caixa/" + c.getId()))
            .body(CaixaResponse.from(c));
    }

    @PatchMapping("/fechar")
    public CaixaResponse fechar(@RequestBody FecharCaixaRequest dto) {
        return CaixaResponse.from(service.fechar(dto.valorFechamento(), dto.observacoes()));
    }
}
