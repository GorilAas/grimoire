package com.grimoire.backend.venda;

import com.grimoire.backend.cliente.Cliente;
import com.grimoire.backend.cliente.ClienteRepository;
import com.grimoire.backend.estoque.EstoqueService;
import com.grimoire.backend.funcionario.Funcionario;
import com.grimoire.backend.funcionario.FuncionarioRepository;
import com.grimoire.backend.produto.Produto;
import com.grimoire.backend.produto.ProdutoRepository;
import com.grimoire.backend.shared.enums.FormaPagamento;
import com.grimoire.backend.shared.enums.MotivoMovimentacao;
import com.grimoire.backend.shared.enums.StatusFiado;
import com.grimoire.backend.shared.enums.TipoMovimentacao;
import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import com.grimoire.backend.shared.exception.RegraNegocioException;
import com.grimoire.backend.venda.dto.VendaRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class VendaService {

    private final VendaRepository vendaRepository;
    private final ClienteRepository clienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ProdutoRepository produtoRepository;
    private final EstoqueService estoqueService;

    public VendaService(VendaRepository vendaRepository,
                        ClienteRepository clienteRepository,
                        FuncionarioRepository funcionarioRepository,
                        ProdutoRepository produtoRepository,
                        EstoqueService estoqueService) {
        this.vendaRepository = vendaRepository;
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.produtoRepository = produtoRepository;
        this.estoqueService = estoqueService;
    }

    public Venda registrar(VendaRequest dto) {
        Funcionario funcionario = funcionarioRepository.findById(dto.funcionarioId())
            .orElseThrow(() -> new RecursoNaoEncontradoException(
                "Funcionário " + dto.funcionarioId() + " não encontrado"));

        Cliente cliente = null;
        if (dto.formaPagamento() == FormaPagamento.FIADO) {
            if (dto.clienteId() == null)
                throw new RegraNegocioException("Venda fiado exige cliente cadastrado (RN01)");
            cliente = clienteRepository.findById(dto.clienteId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                    "Cliente " + dto.clienteId() + " não encontrado"));
            if (Boolean.TRUE.equals(cliente.getNegativado()))
                throw new RegraNegocioException(
                    "Cliente negativado no Serasa — venda fiado bloqueada (RN02/RN03)");
        }

        List<ItemVenda> itens = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (VendaRequest.ItemVendaRequest itemDto : dto.itens()) {
            Produto produto = produtoRepository.findById(itemDto.produtoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                    "Produto " + itemDto.produtoId() + " não encontrado"));
            if (!produto.isAtivo())
                throw new RegraNegocioException(
                    "Produto '" + produto.getNome() + "' está inativo");

            BigDecimal subtotal = produto.getPrecoUnitario().multiply(itemDto.quantidade());
            itens.add(ItemVenda.builder()
                .produto(produto)
                .quantidade(itemDto.quantidade())
                .precoUnitario(produto.getPrecoUnitario())
                .subtotal(subtotal)
                .build());
            total = total.add(subtotal);
        }

        Venda venda = Venda.builder()
            .cliente(cliente)
            .funcionario(funcionario)
            .valorTotal(total)
            .formaPagamento(dto.formaPagamento())
            .statusFiado(dto.formaPagamento() == FormaPagamento.FIADO ? StatusFiado.PENDENTE : null)
            .notaFiscalEmitida(false)
            .status("ATIVA")
            .build();

        itens.forEach(item -> item.setVenda(venda));
        venda.getItens().addAll(itens);

        Venda vendaSalva = vendaRepository.save(venda);

        for (ItemVenda item : itens) {
            estoqueService.registrar(item.getProduto(), TipoMovimentacao.SAIDA,
                item.getQuantidade(), MotivoMovimentacao.VENDA,
                vendaSalva.getId(), "Venda #" + vendaSalva.getId());
        }

        if (dto.formaPagamento() == FormaPagamento.FIADO && cliente != null) {
            cliente.setSaldoDevedor(cliente.getSaldoDevedor().add(total));
            clienteRepository.save(cliente);
        }

        return vendaSalva;
    }

    @Transactional(readOnly = true)
    public Venda buscarPorId(Long id) {
        return vendaRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Venda " + id + " não encontrada"));
    }

    @Transactional(readOnly = true)
    public List<Venda> listarTodas() { return vendaRepository.listarTodas(); }

    @Transactional(readOnly = true)
    public List<Venda> listarPorCliente(Long clienteId) { return vendaRepository.listarPorCliente(clienteId); }

    @Transactional(readOnly = true)
    public List<Venda> listarFiadoEmAberto() { return vendaRepository.listarPorStatusFiado(StatusFiado.PENDENTE); }

    @Transactional(readOnly = true)
    public List<Venda> listarPorFuncionario(Long funcionarioId) { return vendaRepository.listarPorFuncionario(funcionarioId); }

    @Transactional(readOnly = true)
    public List<Venda> listarPorFormaPagamento(FormaPagamento forma) { return vendaRepository.listarPorFormaPagamento(forma); }

    @Transactional(readOnly = true)
    public List<Venda> listarPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        return vendaRepository.listarPorPeriodo(
            dataInicio.atStartOfDay(), dataFim.atTime(23, 59, 59));
    }

    public Venda marcarComoPago(Long id) {
        Venda venda = buscarPorId(id);
        if (venda.getFormaPagamento() != FormaPagamento.FIADO)
            throw new RegraNegocioException("Esta venda não é fiado");
        if (venda.getStatusFiado() == StatusFiado.PAGO)
            throw new RegraNegocioException("Esta venda já está paga");

        Cliente cliente = venda.getCliente();
        BigDecimal novoSaldo = cliente.getSaldoDevedor().subtract(venda.getValorTotal());
        cliente.setSaldoDevedor(novoSaldo.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : novoSaldo);
        clienteRepository.save(cliente);

        venda.setStatusFiado(StatusFiado.PAGO);
        return vendaRepository.save(venda);
    }

    public Venda cancelar(Long id, String motivo, Long funcionarioId) {
        Venda venda = buscarPorId(id);

        if ("CANCELADA".equals(venda.getStatus()))
            throw new RegraNegocioException("Venda já está cancelada");

        // Estorna estoque para cada item
        for (ItemVenda item : venda.getItens()) {
            estoqueService.registrar(item.getProduto(), TipoMovimentacao.ENTRADA,
                item.getQuantidade(), MotivoMovimentacao.DEVOLUCAO,
                venda.getId(), "Cancelamento da venda #" + venda.getId());
        }

        // Se era fiado não pago, abate do saldo devedor
        if (venda.getFormaPagamento() == FormaPagamento.FIADO
            && venda.getCliente() != null
            && venda.getStatusFiado() != StatusFiado.PAGO) {
            Cliente cliente = venda.getCliente();
            BigDecimal novoSaldo = cliente.getSaldoDevedor().subtract(venda.getValorTotal());
            cliente.setSaldoDevedor(novoSaldo.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : novoSaldo);
            clienteRepository.save(cliente);
        }

        Funcionario responsavel = funcionarioId != null
            ? funcionarioRepository.findById(funcionarioId).orElse(null)
            : null;

        venda.setStatus("CANCELADA");
        venda.setMotivoCancelamento(motivo);
        venda.setCanceladoEm(LocalDateTime.now());
        venda.setCanceladoPor(responsavel);
        if (venda.getStatusFiado() != null && venda.getStatusFiado() != StatusFiado.PAGO) {
            venda.setStatusFiado(StatusFiado.PAGO);
        }

        return vendaRepository.save(venda);
    }
}
