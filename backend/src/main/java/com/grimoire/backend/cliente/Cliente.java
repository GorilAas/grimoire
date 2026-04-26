package com.grimoire.backend.cliente;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 14)
    private String cpf;

    @Column(length = 20)
    private String telefone;

    @Column(length = 150)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String endereco;

    @Builder.Default
    @Column(nullable = false)
    private Boolean negativado = false;

    @Column(name = "data_consulta_serasa")
    private LocalDateTime dataConsultaSerasa;

    @Builder.Default
    @Column(name = "saldo_devedor", nullable = false, precision = 10, scale = 2)
    private BigDecimal saldoDevedor = BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "editado_em")
    private LocalDateTime editadoEm;

    @PrePersist
    void onCreate() {
        this.criadoEm = LocalDateTime.now();
        if (this.ativo == null) this.ativo = true;
        if (this.negativado == null) this.negativado = false;
        if (this.saldoDevedor == null) this.saldoDevedor = BigDecimal.ZERO;
    }

    @PreUpdate
    void onUpdate() {
        this.editadoEm = LocalDateTime.now();
    }
}