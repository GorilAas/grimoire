package com.grimoire.backend.estoque;

import com.grimoire.backend.produto.Produto;
import com.grimoire.backend.produto.ProdutoRepository;
import com.grimoire.backend.shared.enums.MotivoMovimentacao;
import com.grimoire.backend.shared.enums.TipoMovimentacao;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EstoqueService {

    private final MovimentacaoEstoqueRepository repository;
    private final ProdutoRepository produtoRepository;

    @Transactional(readOnly = true)
    public List<MovimentacaoEstoqueResponse> listarPorProduto(Long produtoId) {
        return repository.listarPorProduto(produtoId)
            .stream().map(MovimentacaoEstoqueResponse::from).toList();
    }

    @Transactional
    public void registrar(Produto produto,
                          TipoMovimentacao tipo,
                          BigDecimal quantidade,
                          MotivoMovimentacao motivo,
                          Long referenciaId,
                          String observacao) {

        var mov = MovimentacaoEstoque.builder()
            .produto(produto)
            .tipo(tipo)
            .quantidade(quantidade)
            .motivo(motivo)
            .referenciaId(referenciaId)
            .observacao(observacao)
            .build();
        repository.save(mov);

        if (quantidade.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal atual = produto.getQuantidadeEstoque() != null
                ? produto.getQuantidadeEstoque() : BigDecimal.ZERO;
            BigDecimal novo = tipo == TipoMovimentacao.ENTRADA
                ? atual.add(quantidade)
                : atual.subtract(quantidade);
            if (novo.compareTo(BigDecimal.ZERO) < 0) novo = BigDecimal.ZERO;
            produto.setQuantidadeEstoque(novo);
            produtoRepository.save(produto);
        }
    }
}
