package com.grimoire.backend.produto;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "produtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(name = "preco_unitario",  nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    @Column(name = "codigo_barras", unique = true, length = 50)
    private String codigoBarras;

    @Builder.Default
    @Column(nullable = false)
    private boolean ativo = true;

    @Column(length = 500)
    private String descricao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "editado_em")
    private LocalDateTime editadoEm;

    @PrePersist
    public void prePersist() {
        this.criadoEm = LocalDateTime.now();
        if (!this.ativo) this.ativo = true;
    }

    @PreUpdate
    public void preUpdate() {
            this.editadoEm = LocalDateTime.now();
    }
}
