package com.grimoire.backend.produto.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProdutoRequest(

    @NotBlank(message = "Nome e obrigatorio")
    @Size(max = 150, message = "Nome deve ter no maximo 150 caracteres")
    String nome,

    @Size(max = 500, message = "Descricao deve ter no maximo 500 caracteres")
    String descricao,

    @NotNull(message = "Preco de venda e obrigatorio")
    @DecimalMin(value = "0.00", inclusive = true, message = "Preco nao pode ser negativo")
    @Digits(integer = 8, fraction = 2, message = "Preco invalido")
    BigDecimal precoUnitario,

    @DecimalMin(value = "0.00", inclusive = true, message = "Preco de custo nao pode ser negativo")
    @Digits(integer = 8, fraction = 2, message = "Preco de custo invalido")
    BigDecimal precoCusto,

    @Size(max = 50, message = "Codigo de barras deve ter no maximo 50 caracteres")
    String codigoBarras,

    Long categoriaId,

    @DecimalMin(value = "0", inclusive = true, message = "Estoque minimo nao pode ser negativo")
    BigDecimal estoqueMinimo,

    @DecimalMin(value = "0", inclusive = true, message = "Quantidade em estoque nao pode ser negativa")
    BigDecimal quantidadeEstoque
) {}
