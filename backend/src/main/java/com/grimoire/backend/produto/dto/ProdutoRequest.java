package com.grimoire.backend.produto.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProdutoRequest(

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
    String nome,

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    String descricao,

    @NotNull(message = "Preço de venda é obrigatório")
    @DecimalMin(value = "0.00", inclusive = true, message = "Preço não pode ser negativo")
    @Digits(integer = 8, fraction = 2, message = "Preço inválido")
    BigDecimal precoUnitario,

    @DecimalMin(value = "0.00", inclusive = true, message = "Preço de custo não pode ser negativo")
    @Digits(integer = 8, fraction = 2, message = "Preço de custo inválido")
    BigDecimal precoCusto,

    @Size(max = 50, message = "Código de barras deve ter no máximo 50 caracteres")
    String codigoBarras,

    Long categoriaId,

    @DecimalMin(value = "0", inclusive = true, message = "Estoque mínimo não pode ser negativo")
    BigDecimal estoqueMinimo
) {}
