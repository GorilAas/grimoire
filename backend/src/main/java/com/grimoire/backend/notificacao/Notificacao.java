package com.grimoire.backend.notificacao;

import com.grimoire.backend.cliente.Cliente;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificacoes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false, length = 20)
    private String canal;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String conteudo;

    @Column(name = "enviada_em", nullable = false, updatable = false)
    private LocalDateTime enviadaEm;

    @Builder.Default
    @Column(nullable = false)
    private Boolean sucesso = true;

    @PrePersist
    void onCreate() {
        if (this.enviadaEm == null) this.enviadaEm = LocalDateTime.now();
        if (this.sucesso == null) this.sucesso = true;
    }
}
