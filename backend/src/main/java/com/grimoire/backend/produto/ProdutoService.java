package com.grimoire.backend.produto;

import com.grimoire.backend.categoria.Categoria;
import com.grimoire.backend.categoria.CategoriaRepository;
import com.grimoire.backend.estoque.EstoqueService;
import com.grimoire.backend.produto.dto.ProdutoRequest;
import com.grimoire.backend.shared.enums.MotivoMovimentacao;
import com.grimoire.backend.shared.enums.TipoMovimentacao;
import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import com.grimoire.backend.shared.exception.RegraNegocioException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ProdutoService {

    private final ProdutoRepository repository;
    private final CategoriaRepository categoriaRepository;
    private final EstoqueService estoqueService;

    public ProdutoService(ProdutoRepository repository,
                          CategoriaRepository categoriaRepository,
                          EstoqueService estoqueService) {
        this.repository = repository;
        this.categoriaRepository = categoriaRepository;
        this.estoqueService = estoqueService;
    }

    public Produto criar(ProdutoRequest dto) {
        if (dto.codigoBarras() != null && repository.existsByCodigoBarras(dto.codigoBarras())) {
            throw new RegraNegocioException("Código de barras já cadastrado");
        }

        Categoria categoria = resolverCategoria(dto.categoriaId());

        Produto produto = Produto.builder()
            .nome(dto.nome())
            .descricao(dto.descricao())
            .precoUnitario(dto.precoUnitario())
            .precoCusto(dto.precoCusto())
            .codigoBarras(dto.codigoBarras())
            .categoria(categoria)
            .estoqueMinimo(dto.estoqueMinimo() != null ? dto.estoqueMinimo() : BigDecimal.ZERO)
            .quantidadeEstoque(BigDecimal.ZERO)
            .ativo(true)
            .build();

        Produto salvo = repository.save(produto);

        estoqueService.registrar(salvo, TipoMovimentacao.ENTRADA, BigDecimal.ONE,
            MotivoMovimentacao.CADASTRO, null, "Cadastro do produto");

        return salvo;
    }

    @Transactional(readOnly = true)
    public Produto buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Produto " + id + " não encontrado"));
    }

    @Transactional(readOnly = true)
    public Produto buscarPorCodigoBarras(String codigoBarras) {
        return repository.findByCodigoBarras(codigoBarras)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Produto com código " + codigoBarras + " não encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Produto> listarAtivos() { return repository.listarAtivos(); }

    @Transactional(readOnly = true)
    public List<Produto> listarTodos() { return repository.listarTodos(); }

    @Transactional(readOnly = true)
    public List<Produto> buscarPorNome(String termo) { return repository.buscarPorNome(termo); }

    @Transactional(readOnly = true)
    public List<Produto> listarAbaixoDoMinimo() { return repository.listarAbaixoDoMinimo(); }

    @Transactional(readOnly = true)
    public List<Produto> listarPorCategoria(Long categoriaId) { return repository.listarPorCategoria(categoriaId); }

    public Produto atualizar(Long id, ProdutoRequest dto) {
        Produto produto = buscarPorId(id);

        if (dto.codigoBarras() != null
            && !dto.codigoBarras().equals(produto.getCodigoBarras())
            && repository.existsByCodigoBarras(dto.codigoBarras())) {
            throw new RegraNegocioException("Código de barras já cadastrado para outro produto");
        }

        produto.setNome(dto.nome());
        produto.setDescricao(dto.descricao());
        produto.setPrecoUnitario(dto.precoUnitario());
        produto.setPrecoCusto(dto.precoCusto());
        produto.setCodigoBarras(dto.codigoBarras());
        produto.setCategoria(resolverCategoria(dto.categoriaId()));
        if (dto.estoqueMinimo() != null) produto.setEstoqueMinimo(dto.estoqueMinimo());

        Produto salvo = repository.save(produto);

        // Log de edição (zero = não altera estoque)
        estoqueService.registrar(salvo, TipoMovimentacao.ENTRADA,
            BigDecimal.ZERO.setScale(3), MotivoMovimentacao.EDICAO,
            null, "Edição — preço: " + dto.precoUnitario());

        return salvo;
    }

    public void inativar(Long id) {
        Produto produto = buscarPorId(id);
        if (!produto.isAtivo()) throw new RegraNegocioException("Produto já está inativo");
        produto.setAtivo(false);
    }

    public void reativar(Long id) {
        Produto produto = buscarPorId(id);
        if (produto.isAtivo()) throw new RegraNegocioException("Produto já está ativo");
        produto.setAtivo(true);
    }

    private Categoria resolverCategoria(Long categoriaId) {
        if (categoriaId == null) return null;
        return categoriaRepository.findById(categoriaId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria " + categoriaId + " não encontrada"));
    }
}
