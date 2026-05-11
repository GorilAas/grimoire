package com.grimoire.backend.cargo;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cargos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CargoSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String nome;

    @Column(length = 300)
    private String descricao;

    @Column(name = "perfil_padrao", nullable = false, length = 30)
    private String perfilPadrao;

    @Builder.Default
    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "editado_em")
    private LocalDateTime editadoEm;

    @PrePersist
    void aoCriar() {
        this.criadoEm = LocalDateTime.now();
        if (this.ativo == null) this.ativo = true;
    }

    @PreUpdate
    void aoEditar() {
        this.editadoEm = LocalDateTime.now();
    }
}
