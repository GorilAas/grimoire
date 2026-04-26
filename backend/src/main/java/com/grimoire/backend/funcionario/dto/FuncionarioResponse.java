package com.grimoire.backend.funcionario.dto;

import com.grimoire.backend.funcionario.Funcionario;
import com.grimoire.backend.shared.enums.Cargo;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record FuncionarioResponse(
    Long id,
    String nome,
    Cargo cargo,
    String telefone,
    String endereco,
    String telefoneEmergencia,
    LocalDate dataAdmissao,
    Boolean ativo,
    LocalDateTime criadoEm,
    LocalDateTime editadoEm
) {
    public static FuncionarioResponse from(Funcionario f) {
        return new FuncionarioResponse(
            f.getId(),
            f.getNome(),
            f.getCargo(),
            f.getTelefone(),
            f.getEndereco(),
            f.getTelefoneEmergencia(),
            f.getDataAdmissao(),
            f.getAtivo(),
            f.getCriadoEm(),
            f.getEditadoEm()
        );
    }
}
