package com.grimoire.backend.notificacao;

import java.math.BigDecimal;

public record NotificacaoModel(
        Long id,
        String nomeCliente,
        BigDecimal valorTotal
) {
}
