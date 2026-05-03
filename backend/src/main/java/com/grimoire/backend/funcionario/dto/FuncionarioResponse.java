package com.grimoire.backend.funcionario.dto;

import com.grimoire.backend.funcionario.Funcionario;
import com.grimoire.backend.shared.enums.Cargo;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

public record FuncionarioResponse(
    Long id,
    String nome,
    Cargo cargo,
    String telefone,
    String endereco,
    String telefoneEmergencia,
    LocalDate dataAdmissao,
    LocalDate dataNascimento,
    Integer idadeAnos,
    BigDecimal cargaHorariaDiaria,
    Boolean ativo,
    LocalDateTime criadoEm,
    LocalDateTime editadoEm,
    boolean possuiAcesso,
    String emailAcesso,
    String perfil
) {
    public static FuncionarioResponse from(Funcionario f) {
        boolean temAcesso = f.getUsuario() != null;
        Integer idade = f.getDataNascimento() != null
            ? Period.between(f.getDataNascimento(), LocalDate.now()).getYears()
            : null;
        return new FuncionarioResponse(
            f.getId(),
            f.getNome(),
            f.getCargo(),
            f.getTelefone(),
            f.getEndereco(),
            f.getTelefoneEmergencia(),
            f.getDataAdmissao(),
            f.getDataNascimento(),
            idade,
            f.getCargaHorariaDiaria(),
            f.getAtivo(),
            f.getCriadoEm(),
            f.getEditadoEm(),
            temAcesso,
            temAcesso ? f.getUsuario().getEmail() : null,
            temAcesso ? f.getUsuario().getPerfil() : null
        );
    }
}
