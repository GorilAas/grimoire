package com.grimoire.backend.funcionario.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FuncionarioRequest(

    @NotBlank(message = "Nome e obrigatorio")
    @Size(max = 150, message = "Nome deve ter no maximo 150 caracteres")
    String nome,

    @NotBlank(message = "Cargo e obrigatorio")
    @Size(max = 80, message = "Cargo deve ter no maximo 80 caracteres")
    String cargo,

    @Size(max = 20, message = "Telefone deve ter no maximo 20 caracteres")
    String telefone,

    String endereco,

    @Size(max = 20, message = "Telefone de emergencia deve ter no maximo 20 caracteres")
    String telefoneEmergencia,

    @NotNull(message = "Data de admissao e obrigatoria")
    @PastOrPresent(message = "Data de admissao nao pode ser no futuro")
    LocalDate dataAdmissao,

    @Past(message = "Data de nascimento deve ser no passado")
    LocalDate dataNascimento,

    @DecimalMin(value = "1", message = "Carga horaria deve ser pelo menos 1h")
    @DecimalMax(value = "12", message = "Carga horaria deve ser no maximo 12h")
    BigDecimal cargaHorariaDiaria
) {}
