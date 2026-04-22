package com.grimoire.backend.cliente.dto;

import com.grimoire.backend.cliente.Cliente;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ClienteResponse(
        Long id,
        String nome,
        String cpf,
        String telefone,
        String email,
        String endereco,
        Boolean negativado,
        LocalDateTime dataConsultaSerasa,
        BigDecimal saldoDevedor,
        Boolean ativo,
        LocalDateTime criadoEm,
        LocalDateTime editadoEm
) {
    public static ClienteResponse from(Cliente c) {
        return new ClienteResponse(
                c.getId(),
                c.getNome(),
                c.getCpf(),
                c.getTelefone(),
                c.getEmail(),
                c.getEndereco(),
                c.getNegativado(),
                c.getDataConsultaSerasa(),
                c.getSaldoDevedor(),
                c.getAtivo(),
                c.getCriadoEm(),
                c.getEditadoEm()
        );
    }
}