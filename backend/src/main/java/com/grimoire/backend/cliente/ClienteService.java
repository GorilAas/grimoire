package com.grimoire.backend.cliente;

import com.grimoire.backend.cliente.dto.ClienteRequest;
import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import com.grimoire.backend.shared.exception.RegraNegocioException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ClienteService {

    private final ClienteRepository repository;
    private final SerasaClient serasaClient;

    public ClienteService(ClienteRepository repository, SerasaClient serasaClient) {
        this.repository = repository;
        this.serasaClient = serasaClient;
    }

    public Cliente criar(ClienteRequest dto) {
        if (repository.existsByCpf(dto.cpf())) {
            throw new RegraNegocioException("CPF já cadastrado no sistema");
        }

        boolean negativado = serasaClient.estaNegativado(dto.cpf());
        if (negativado) {
            throw new RegraNegocioException(
                    "Cliente negativado no Serasa — cadastro bloqueado (RN02)"
            );
        }

        Cliente cliente = Cliente.builder()
                .nome(dto.nome())
                .cpf(dto.cpf())
                .telefone(dto.telefone())
                .email(dto.email())
                .endereco(dto.endereco())
                .negativado(false)
                .dataConsultaSerasa(LocalDateTime.now())
                .saldoDevedor(BigDecimal.ZERO)
                .ativo(true)
                .build();

        return repository.save(cliente);
    }

    @Transactional(readOnly = true)
    public Cliente buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Cliente " + id + " não encontrado"
                ));
    }

    @Transactional(readOnly = true)
    public Cliente buscarPorCpf(String cpf) {
        return repository.findByCpf(cpf)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Cliente com CPF " + cpf + " não encontrado"
                ));
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarAtivos() {
        return repository.listarAtivos();
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarTodos() {
        return repository.listarTodos();
    }

    @Transactional(readOnly = true)
    public List<Cliente> listarComFiadoEmAberto() {
        return repository.listarComFiadoEmAberto();
    }

    public Cliente atualizar(Long id, ClienteRequest dto) {
        Cliente cliente = buscarPorId(id);

        if (!dto.cpf().equals(cliente.getCpf()) && repository.existsByCpf(dto.cpf())) {
            throw new RegraNegocioException("CPF já cadastrado para outro cliente");
        }

        cliente.setNome(dto.nome());
        cliente.setTelefone(dto.telefone());
        cliente.setEmail(dto.email());
        cliente.setEndereco(dto.endereco());

        return repository.save(cliente);
    }

    public Cliente corrigirCpf(Long id, String novoCpf) {
        Cliente cliente = buscarPorId(id);

        if (repository.existsByCpf(novoCpf)) {
            throw new RegraNegocioException("CPF já cadastrado para outro cliente");
        }

        boolean negativado = serasaClient.estaNegativado(novoCpf);
        if (negativado) {
            throw new RegraNegocioException("CPF negativado no Serasa — correção bloqueada");
        }

        cliente.setCpf(novoCpf);
        cliente.setDataConsultaSerasa(LocalDateTime.now());
        cliente.setNegativado(false);
        return repository.save(cliente);
    }

    public void inativar(Long id) {
        Cliente cliente = buscarPorId(id);
        if (Boolean.FALSE.equals(cliente.getAtivo())) {
            throw new RegraNegocioException("Cliente já está inativo");
        }
        if (cliente.getSaldoDevedor().compareTo(BigDecimal.ZERO) > 0) {
            throw new RegraNegocioException(
                    "Cliente possui saldo devedor em aberto — quite o fiado antes de inativar"
            );
        }
        cliente.setAtivo(false);
    }

    public void reativar(Long id) {
        Cliente cliente = buscarPorId(id);
        if (Boolean.TRUE.equals(cliente.getAtivo())) {
            throw new RegraNegocioException("Cliente já está ativo");
        }
        cliente.setAtivo(true);
    }
}