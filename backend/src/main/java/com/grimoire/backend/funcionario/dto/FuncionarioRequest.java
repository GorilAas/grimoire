package com.grimoire.backend.funcionario.dto;

import com.grimoire.backend.shared.enums.Cargo;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

public record FuncionarioRequest(

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 150, message = "Nome deve ter no máximo 150 caracteres")
    String nome,

    @NotNull(message = "Cargo é obrigatório")
    Cargo cargo,

    @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
    String telefone,

    String endereco,

    @Size(max = 20, message = "Telefone de emergência deve ter no máximo 20 caracteres")
    String telefoneEmergencia,

    @NotNull(message = "Data de admissão é obrigatória")
    @PastOrPresent(message = "Data de admissão não pode ser no futuro")
    LocalDate dataAdmissao,

    @Past(message = "Data de nascimento deve ser no passado")
    LocalDate dataNascimento,

    @DecimalMin(value = "1", message = "Carga horária deve ser pelo menos 1h")
    @DecimalMax(value = "12", message = "Carga horária deve ser no máximo 12h")
    BigDecimal cargaHorariaDiaria
) {}
