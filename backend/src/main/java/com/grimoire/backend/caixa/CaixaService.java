package com.grimoire.backend.caixa;

import com.grimoire.backend.caixa.dto.CaixaResponse;
import com.grimoire.backend.funcionario.Funcionario;
import com.grimoire.backend.funcionario.FuncionarioRepository;
import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import com.grimoire.backend.shared.exception.RegraNegocioException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CaixaService {

    private final CaixaRepository caixaRepository;
    private final FuncionarioRepository funcionarioRepository;

    public Caixa abrir(Long funcionarioId, BigDecimal valorAbertura, String observacoes) {
        if (caixaRepository.findByStatus("ABERTO").isPresent()) {
            throw new RegraNegocioException("Já existe um caixa aberto. Feche-o antes de abrir outro.");
        }

        Funcionario funcionario = funcionarioRepository.findById(funcionarioId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário " + funcionarioId + " não encontrado"));

        Caixa caixa = Caixa.builder()
            .funcionario(funcionario)
            .valorAbertura(valorAbertura != null ? valorAbertura : BigDecimal.ZERO)
            .observacoes(observacoes)
            .status("ABERTO")
            .build();

        return caixaRepository.save(caixa);
    }

    public Caixa fechar(BigDecimal valorFechamento, String observacoes) {
        Caixa caixa = caixaRepository.findByStatus("ABERTO")
            .orElseThrow(() -> new RegraNegocioException("Nenhum caixa aberto encontrado"));

        caixa.setStatus("FECHADO");
        caixa.setFechadoEm(LocalDateTime.now());
        caixa.setValorFechamento(valorFechamento);
        if (observacoes != null) caixa.setObservacoes(observacoes);

        return caixaRepository.save(caixa);
    }

    @Transactional(readOnly = true)
    public Optional<Caixa> buscarAberto() {
        return caixaRepository.findByStatus("ABERTO");
    }

    @Transactional(readOnly = true)
    public List<Caixa> listarTodos() {
        return caixaRepository.findAllOrderByAbertoEmDesc();
    }

    @Transactional(readOnly = true)
    public Caixa buscarPorId(Long id) {
        return caixaRepository.findById(id)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Caixa " + id + " não encontrado"));
    }
}
