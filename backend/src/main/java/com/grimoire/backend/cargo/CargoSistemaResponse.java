package com.grimoire.backend.cargo;

import java.time.LocalDateTime;

public record CargoSistemaResponse(
    Long id,
    String nome,
    String descricao,
    String perfilPadrao,
    Boolean ativo,
    LocalDateTime criadoEm,
    LocalDateTime editadoEm
) {
    public static CargoSistemaResponse from(CargoSistema cargo) {
        return new CargoSistemaResponse(
            cargo.getId(),
            cargo.getNome(),
            cargo.getDescricao(),
            cargo.getPerfilPadrao(),
            cargo.getAtivo(),
            cargo.getCriadoEm(),
            cargo.getEditadoEm()
        );
    }
}
