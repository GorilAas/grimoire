package com.grimoire.backend.funcionario.dto;

import com.grimoire.backend.funcionario.Funcionario;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Arrays;
import java.util.List;

public record FuncionarioResponse(
    Long id,
    String nome,
    String cargo,
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
    String perfil,
    List<String> telasPermitidas
) {
    public static FuncionarioResponse from(Funcionario f) {
        boolean temAcesso = f.getUsuario() != null;
        Integer idade = f.getDataNascimento() != null
            ? Period.between(f.getDataNascimento(), LocalDate.now()).getYears()
            : null;

        List<String> telas = List.of();
        if (temAcesso && f.getUsuario().getTelasPermitidas() != null && !f.getUsuario().getTelasPermitidas().isBlank()) {
            telas = Arrays.stream(f.getUsuario().getTelasPermitidas().split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
        }

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
            temAcesso ? f.getUsuario().getPerfil() : null,
            telas
        );
    }
}
