package com.grimoire.backend.venda;

import com.grimoire.backend.cliente.Cliente;
import com.grimoire.backend.funcionario.Funcionario;
import com.grimoire.backend.shared.enums.FormaPagamento;
import com.grimoire.backend.shared.enums.StatusFiado;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vendas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // cliente é opcional — null em vendas à vista sem identificação
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    // funcionário é obrigatório — RN06
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Column(name = "valor_total", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", nullable = false, length = 20)
    private FormaPagamento formaPagamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_fiado", length = 20)
    private StatusFiado statusFiado;

    @Column(name = "data_venda", nullable = false, updatable = false)
    private LocalDateTime dataVenda;

    @Builder.Default
    @Column(name = "nota_fiscal_emitida", nullable = false)
    private Boolean notaFiscalEmitida = false;

    @OneToMany(mappedBy = "venda", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItemVenda> itens = new ArrayList<>();

    @PrePersist
    void onCreate() {
        this.dataVenda = LocalDateTime.now();
        if (this.notaFiscalEmitida == null) this.notaFiscalEmitida = false;
    }
}
