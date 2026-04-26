package com.grimoire.backend.venda;

import com.grimoire.backend.cliente.Cliente;
import com.grimoire.backend.cliente.ClienteRepository;
import com.grimoire.backend.funcionario.Funcionario;
import com.grimoire.backend.funcionario.FuncionarioRepository;
import com.grimoire.backend.produto.Produto;
import com.grimoire.backend.produto.ProdutoRepository;
import com.grimoire.backend.shared.enums.FormaPagamento;
import com.grimoire.backend.shared.enums.StatusFiado;
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

    public VendaService(VendaRepository vendaRepository,
                        ClienteRepository clienteRepository,
                        FuncionarioRepository funcionarioRepository,
                        ProdutoRepository produtoRepository) {
        this.vendaRepository = vendaRepository;
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.produtoRepository = produtoRepository;
    }

    public Venda registrar(VendaRequest dto) {
        // RN06 — funcionário obrigatório
        Funcionario funcionario = funcionarioRepository.findById(dto.funcionarioId())
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Funcionário " + dto.funcionarioId() + " não encontrado"));

        // RN01 — fiado exige cliente cadastrado
        Cliente cliente = null;
        if (dto.formaPagamento() == FormaPagamento.FIADO) {
            if (dto.clienteId() == null) {
                throw new RegraNegocioException("Venda fiado exige cliente cadastrado (RN01)");
            }
            cliente = clienteRepository.findById(dto.clienteId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Cliente " + dto.clienteId() + " não encontrado"));

            // RN02/RN03 — bloqueia fiado se negativado
            if (Boolean.TRUE.equals(cliente.getNegativado())) {
                throw new RegraNegocioException(
                        "Cliente negativado no Serasa — venda fiado bloqueada (RN02/RN03)");
            }
        }

        // monta os itens e calcula o total
        List<ItemVenda> itens = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (VendaRequest.ItemVendaRequest itemDto : dto.itens()) {
            Produto produto = produtoRepository.findById(itemDto.produtoId())
                    .orElseThrow(() -> new RecursoNaoEncontradoException(
                            "Produto " + itemDto.produtoId() + " não encontrado"));

            if (!produto.isAtivo()) {
                throw new RegraNegocioException(
                        "Produto '" + produto.getNome() + "' está inativo e não pode ser vendido");
            }

            // snapshot do preço — preço atual, não muda mesmo que o produto seja editado
            BigDecimal subtotal = produto.getPrecoUnitario().multiply(itemDto.quantidade());

            ItemVenda item = ItemVenda.builder()
                    .produto(produto)
                    .quantidade(itemDto.quantidade())
                    .precoUnitario(produto.getPrecoUnitario())
                    .subtotal(subtotal)
                    .build();

            itens.add(item);
            total = total.add(subtotal);
        }

        // monta a venda
        Venda venda = Venda.builder()
                .cliente(cliente)
                .funcionario(funcionario)
                .valorTotal(total)
                .formaPagamento(dto.formaPagamento())
                .statusFiado(dto.formaPagamento() == FormaPagamento.FIADO ? StatusFiado.PENDENTE : null)
                .notaFiscalEmitida(false)
                .build();

        // vincula itens à venda
        itens.forEach(item -> item.setVenda(venda));
        venda.getItens().addAll(itens);

        Venda vendaSalva = vendaRepository.save(venda);

        // atualiza saldo devedor do cliente se fiado
        if (dto.formaPagamento() == FormaPagamento.FIADO && cliente != null) {
            cliente.setSaldoDevedor(cliente.getSaldoDevedor().add(total));
            clienteRepository.save(cliente);
        }

        return vendaSalva;
    }

    @Transactional(readOnly = true)
    public Venda buscarPorId(Long id) {
        return vendaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Venda " + id + " não encontrada"));
    }

    @Transactional(readOnly = true)
    public List<Venda> listarTodas() {
        return vendaRepository.listarTodas();
    }

    @Transactional(readOnly = true)
    public List<Venda> listarPorCliente(Long clienteId) {
        return vendaRepository.listarPorCliente(clienteId);
    }

    @Transactional(readOnly = true)
    public List<Venda> listarFiadoEmAberto() {
        return vendaRepository.listarPorStatusFiado(StatusFiado.PENDENTE);
    }

    @Transactional(readOnly = true)
    public List<Venda> listarPorFuncionario(Long funcionarioId) {
        return vendaRepository.listarPorFuncionario(funcionarioId);
    }

    @Transactional(readOnly = true)
    public List<Venda> listarPorFormaPagamento(FormaPagamento forma) {
        return vendaRepository.listarPorFormaPagamento(forma);
    }

    @Transactional(readOnly = true)
    public List<Venda> listarPorPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        LocalDateTime inicio = dataInicio.atStartOfDay();
        LocalDateTime fim = dataFim.atTime(23, 59, 59);
        return vendaRepository.listarPorPeriodo(inicio, fim);
    }

    public Venda marcarComoPago(Long id) {
        Venda venda = buscarPorId(id);

        if (venda.getFormaPagamento() != FormaPagamento.FIADO) {
            throw new RegraNegocioException("Esta venda não é fiado");
        }
        if (venda.getStatusFiado() == StatusFiado.PAGO) {
            throw new RegraNegocioException("Esta venda já está paga");
        }

        // abate do saldo devedor do cliente
        Cliente cliente = venda.getCliente();
        BigDecimal novoSaldo = cliente.getSaldoDevedor().subtract(venda.getValorTotal());
        cliente.setSaldoDevedor(novoSaldo.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : novoSaldo);
        clienteRepository.save(cliente);

        venda.setStatusFiado(StatusFiado.PAGO);
        return vendaRepository.save(venda);
    }
}
