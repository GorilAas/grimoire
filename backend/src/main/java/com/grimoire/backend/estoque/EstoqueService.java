package com.grimoire.backend.estoque;

import com.grimoire.backend.produto.Produto;
import com.grimoire.backend.produto.ProdutoRepository;
import com.grimoire.backend.shared.enums.MotivoMovimentacao;
import com.grimoire.backend.shared.enums.TipoMovimentacao;
import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import com.grimoire.backend.shared.exception.RegraNegocioException;
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
    public MovimentacaoEstoqueResponse ajustarManual(Long produtoId,
                                                     TipoMovimentacao tipo,
                                                     BigDecimal quantidade,
                                                     MotivoMovimentacao motivo,
                                                     String observacao) {
        Produto produto = produtoRepository.findById(produtoId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Produto " + produtoId + " não encontrado"));

        if (tipo == null) {
            throw new RegraNegocioException("Tipo de movimentação é obrigatório");
        }
        if (quantidade == null || quantidade.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RegraNegocioException("Quantidade deve ser maior que zero");
        }

        MotivoMovimentacao motivoEfetivo = motivo != null ? motivo : MotivoMovimentacao.AJUSTE_MANUAL;
        MovimentacaoEstoque movimentacao = registrar(produto, tipo, quantidade, motivoEfetivo, null, observacao);
        return MovimentacaoEstoqueResponse.from(movimentacao);
    }

    @Transactional
    public MovimentacaoEstoque registrar(Produto produto,
                                         TipoMovimentacao tipo,
                                         BigDecimal quantidade,
                                         MotivoMovimentacao motivo,
                                         Long referenciaId,
                                         String observacao) {
        if (produto == null) {
            throw new RegraNegocioException("Produto e obrigatorio para movimentar estoque");
        }
        if (tipo == null) {
            throw new RegraNegocioException("Tipo de movimentacao e obrigatorio");
        }
        if (motivo == null) {
            throw new RegraNegocioException("Motivo da movimentacao e obrigatorio");
        }
        if (quantidade == null || quantidade.compareTo(BigDecimal.ZERO) < 0) {
            throw new RegraNegocioException("Quantidade nao pode ser negativa");
        }

        BigDecimal atual = produto.getQuantidadeEstoque() != null
            ? produto.getQuantidadeEstoque()
            : BigDecimal.ZERO;
        BigDecimal novo = tipo == TipoMovimentacao.ENTRADA
            ? atual.add(quantidade)
            : atual.subtract(quantidade);

        if (tipo == TipoMovimentacao.SAIDA && novo.compareTo(BigDecimal.ZERO) < 0) {
            throw new RegraNegocioException(
                "Estoque insuficiente para " + produto.getNome()
                    + ". Disponivel: " + atual + ", solicitado: " + quantidade);
        }

        var mov = MovimentacaoEstoque.builder()
            .produto(produto)
            .tipo(tipo)
            .quantidade(quantidade)
            .motivo(motivo)
            .referenciaId(referenciaId)
            .observacao(observacao)
            .build();
        MovimentacaoEstoque salvo = repository.save(mov);

        if (quantidade.compareTo(BigDecimal.ZERO) > 0) {
            produto.setQuantidadeEstoque(novo);
            produtoRepository.save(produto);
        }

        return salvo;
    }
}
