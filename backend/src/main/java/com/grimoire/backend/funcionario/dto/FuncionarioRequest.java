package com.grimoire.backend.funcionario.dto;

import com.grimoire.backend.shared.enums.Cargo;
import jakarta.validation.constraints.*;
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
    LocalDate dataAdmissao
) {}
