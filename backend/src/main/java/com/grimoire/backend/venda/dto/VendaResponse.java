package com.grimoire.backend.venda.dto;

import com.grimoire.backend.shared.enums.FormaPagamento;
import com.grimoire.backend.shared.enums.StatusFiado;
import com.grimoire.backend.venda.ItemVenda;
import com.grimoire.backend.venda.Venda;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record VendaResponse(
    Long id,
    Long clienteId,
    String clienteNome,
    Long funcionarioId,
    String funcionarioNome,
    BigDecimal valorTotal,
    FormaPagamento formaPagamento,
    StatusFiado statusFiado,
    String status,
    String motivoCancelamento,
    LocalDateTime canceladoEm,
    LocalDateTime dataVenda,
    Boolean notaFiscalEmitida,
    List<ItemVendaResponse> itens
) {
    public record ItemVendaResponse(
        Long id,
        Long produtoId,
        String produtoNome,
        BigDecimal quantidade,
        BigDecimal precoUnitario,
        BigDecimal subtotal
    ) {
        public static ItemVendaResponse from(ItemVenda i) {
            return new ItemVendaResponse(
                i.getId(), i.getProduto().getId(), i.getProduto().getNome(),
                i.getQuantidade(), i.getPrecoUnitario(), i.getSubtotal()
            );
        }
    }

    public static VendaResponse from(Venda v) {
        return new VendaResponse(
            v.getId(),
            v.getCliente() != null ? v.getCliente().getId() : null,
            v.getCliente() != null ? v.getCliente().getNome() : null,
            v.getFuncionario().getId(),
            v.getFuncionario().getNome(),
            v.getValorTotal(),
            v.getFormaPagamento(),
            v.getStatusFiado(),
            v.getStatus(),
            v.getMotivoCancelamento(),
            v.getCanceladoEm(),
            v.getDataVenda(),
            v.getNotaFiscalEmitida(),
            v.getItens().stream().map(ItemVendaResponse::from).toList()
        );
    }
}
