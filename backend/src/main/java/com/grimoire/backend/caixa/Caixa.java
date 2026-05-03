package com.grimoire.backend.caixa;

import com.grimoire.backend.funcionario.Funcionario;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "caixas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Caixa {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Column(name = "aberto_em", nullable = false, updatable = false)
    private LocalDateTime abertoEm;

    @Column(name = "fechado_em")
    private LocalDateTime fechadoEm;

    @Builder.Default
    @Column(name = "valor_abertura", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorAbertura = BigDecimal.ZERO;

    @Column(name = "valor_fechamento", precision = 10, scale = 2)
    private BigDecimal valorFechamento;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Builder.Default
    @Column(nullable = false, length = 10)
    private String status = "ABERTO";

    @PrePersist
    void onCreate() { this.abertoEm = LocalDateTime.now(); }
}
