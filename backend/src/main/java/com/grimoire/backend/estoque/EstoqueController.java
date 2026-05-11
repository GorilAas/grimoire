package com.grimoire.backend.estoque;

import com.grimoire.backend.shared.enums.MotivoMovimentacao;
import com.grimoire.backend.shared.enums.TipoMovimentacao;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/estoque")
@RequiredArgsConstructor
public class EstoqueController {

    private final EstoqueService service;

    public record AjusteEstoqueRequest(
            @NotNull(message = "Produto é obrigatório")
            Long produtoId,

            @NotNull(message = "Tipo é obrigatório")
            TipoMovimentacao tipo,

            @NotNull(message = "Quantidade é obrigatória")
            @DecimalMin(value = "0.001", message = "Quantidade deve ser maior que zero")
            BigDecimal quantidade,

            MotivoMovimentacao motivo,
            String observacao
    ) {}

    @GetMapping("/produto/{produtoId}")
    public List<MovimentacaoEstoqueResponse> listarPorProduto(@PathVariable Long produtoId) {
        return service.listarPorProduto(produtoId);
    }

    @PostMapping("/ajuste")
    public MovimentacaoEstoqueResponse ajustar(@Valid @RequestBody AjusteEstoqueRequest dto) {
        return service.ajustarManual(
                dto.produtoId(),
                dto.tipo(),
                dto.quantidade(),
                dto.motivo(),
                dto.observacao()
        );
    }
}
