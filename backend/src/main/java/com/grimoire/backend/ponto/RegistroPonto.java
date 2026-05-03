package com.grimoire.backend.ponto;

import com.grimoire.backend.funcionario.Funcionario;
import com.grimoire.backend.usuario.Usuario;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "registros_ponto")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegistroPonto {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Column(nullable = false, length = 10)
    private String tipo; // ENTRADA | SAIDA

    @Column(nullable = false)
    private LocalDateTime momento;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Builder.Default
    @Column(name = "ajuste_manual", nullable = false)
    private boolean ajusteManual = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por")
    private Usuario registradoPor;

    @PrePersist
    void onCreate() { if (this.momento == null) this.momento = LocalDateTime.now(); }
}
