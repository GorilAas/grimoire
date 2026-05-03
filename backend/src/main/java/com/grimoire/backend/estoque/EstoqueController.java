package com.grimoire.backend.estoque;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/estoque")
@RequiredArgsConstructor
public class EstoqueController {

    private final EstoqueService service;

    // GET /api/estoque/produto/{produtoId}
    @GetMapping("/produto/{produtoId}")
    public List<MovimentacaoEstoqueResponse> listarPorProduto(@PathVariable Long produtoId) {
        return service.listarPorProduto(produtoId);
    }
}
