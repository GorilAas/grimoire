package com.grimoire.backend.venda.dto;

import com.grimoire.backend.shared.enums.FormaPagamento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record VendaRequest(

    // obrigatório — RN06
    @NotNull(message = "Funcionário é obrigatório")
    Long funcionarioId,

    // opcional — obrigatório apenas para FIADO
    Long clienteId,

    @NotNull(message = "Forma de pagamento é obrigatória")
    FormaPagamento formaPagamento,

    @NotEmpty(message = "A venda deve ter pelo menos um item")
    @Valid
    List<ItemVendaRequest> itens
) {
    public record ItemVendaRequest(

        @NotNull(message = "Produto é obrigatório")
        Long produtoId,

        @NotNull(message = "Quantidade é obrigatória")
        @DecimalMin(value = "0.001", message = "Quantidade deve ser maior que zero")
        @Digits(integer = 7, fraction = 3)
        BigDecimal quantidade
    ) {}
}
