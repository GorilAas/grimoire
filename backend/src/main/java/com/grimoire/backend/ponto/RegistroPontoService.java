package com.grimoire.backend.ponto;

import com.grimoire.backend.funcionario.Funcionario;
import com.grimoire.backend.funcionario.FuncionarioRepository;
import com.grimoire.backend.ponto.dto.AjustePontoRequest;
import com.grimoire.backend.ponto.dto.RegistroPontoResponse;
import com.grimoire.backend.ponto.dto.ResumoPontoResponse;
import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import com.grimoire.backend.shared.exception.RegraNegocioException;
import com.grimoire.backend.usuario.Usuario;
import com.grimoire.backend.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class RegistroPontoService {

    private final RegistroPontoRepository repository;
    private final FuncionarioRepository funcionarioRepository;
    private final UsuarioRepository usuarioRepository;
public RegistroPonto bater(Long usuarioId, Long funcionarioIdOverride, String perfil) {
        Funcionario funcionario;

        boolean ehGestao = "ADMIN".equals(perfil) || "GERENTE".equals(perfil);

        if (ehGestao && funcionarioIdOverride != null) {
            funcionario = funcionarioRepository.findById(funcionarioIdOverride)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário " + funcionarioIdOverride + " não encontrado"));
        } else {
            funcionario = funcionarioRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RegraNegocioException(
                    "Nenhum funcionário vinculado a este usuário. Contate o administrador."));
        }

        LocalDate hoje = LocalDate.now();
        LocalDateTime inicioDia = hoje.atStartOfDay();
        LocalDateTime fimDia   = hoje.atTime(LocalTime.MAX);

        Optional<RegistroPonto> ultimo = repository.findUltimoRegistroDia(
            funcionario.getId(), inicioDia, fimDia);

        String tipo = (ultimo.isEmpty() || "SAIDA".equals(ultimo.get().getTipo()))
            ? "ENTRADA" : "SAIDA";

        RegistroPonto registro = RegistroPonto.builder()
            .funcionario(funcionario)
            .tipo(tipo)
            .momento(LocalDateTime.now())
            .ajusteManual(false)
            .build();

        return repository.save(registro);
    }
public RegistroPonto ajustar(AjustePontoRequest dto, Long usuarioId) {
        Funcionario funcionario = funcionarioRepository.findById(dto.funcionarioId())
            .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário " + dto.funcionarioId() + " não encontrado"));

        String tipoUpper = dto.tipo().toUpperCase();
        if (!tipoUpper.equals("ENTRADA") && !tipoUpper.equals("SAIDA"))
            throw new RegraNegocioException("Tipo deve ser ENTRADA ou SAIDA");

        Usuario responsavel = usuarioRepository.findById(usuarioId).orElse(null);

        RegistroPonto registro = RegistroPonto.builder()
            .funcionario(funcionario)
            .tipo(tipoUpper)
            .momento(dto.momento())
            .observacao(dto.observacao())
            .ajusteManual(true)
            .registradoPor(responsavel)
            .build();

        return repository.save(registro);
    }
@Transactional(readOnly = true)
    public List<RegistroPontoResponse> listarHoje(Long funcionarioId) {
        LocalDate hoje = LocalDate.now();
        return repository.findByFuncionarioAndDia(
                funcionarioId, hoje.atStartOfDay(), hoje.atTime(LocalTime.MAX))
            .stream().map(RegistroPontoResponse::from).toList();
    }
@Transactional(readOnly = true)
    public List<ResumoPontoResponse> resumo(Long funcionarioId, LocalDate inicio, LocalDate fim) {
        Funcionario funcionario = funcionarioRepository.findById(funcionarioId)
            .orElseThrow(() -> new RecursoNaoEncontradoException("Funcionário " + funcionarioId + " não encontrado"));

        List<ResumoPontoResponse> resultado = new ArrayList<>();
        for (LocalDate data = inicio; !data.isAfter(fim); data = data.plusDays(1)) {
            List<RegistroPonto> registros = repository.findByFuncionarioAndDia(
                funcionarioId, data.atStartOfDay(), data.atTime(LocalTime.MAX));
            if (!registros.isEmpty())
                resultado.add(calcularResumo(funcionario, data, registros));
        }
        return resultado;
    }
@Transactional(readOnly = true)
    public List<RegistroPontoResponse> listarPorPeriodo(LocalDate inicio, LocalDate fim) {
        return repository.findAllByPeriodo(
                inicio.atStartOfDay(), fim.atTime(LocalTime.MAX))
            .stream().map(RegistroPontoResponse::from).toList();
    }

    private ResumoPontoResponse calcularResumo(Funcionario funcionario, LocalDate data,
                                                List<RegistroPonto> registros) {
        Duration trabalhado = Duration.ZERO;
        boolean emAndamento = false;
        LocalDateTime entradaAberta = null;

        for (RegistroPonto r : registros) {
            if ("ENTRADA".equals(r.getTipo())) {
                entradaAberta = r.getMomento();
            } else if ("SAIDA".equals(r.getTipo()) && entradaAberta != null) {
                trabalhado = trabalhado.plus(Duration.between(entradaAberta, r.getMomento()));
                entradaAberta = null;
            }
        }

        if (entradaAberta != null) {
            emAndamento = true;
            trabalhado = trabalhado.plus(Duration.between(entradaAberta, LocalDateTime.now()));
        }

        double cargaH = funcionario.getCargaHorariaDiaria() != null
            ? funcionario.getCargaHorariaDiaria().doubleValue() : 8.0;
        double trabalhadoH = trabalhado.toMinutes() / 60.0;
        double saldo = trabalhadoH - cargaH;

        return new ResumoPontoResponse(
            funcionario.getId(), funcionario.getNome(), data,
            registros.stream().map(RegistroPontoResponse::from).toList(),
            trabalhadoH, formatarDuracao(trabalhado),
            cargaH, formatarHoras(cargaH),
            saldo, formatarSaldo(saldo),
            emAndamento
        );
    }

    private String formatarDuracao(Duration d) {
        return d.toHours() + "h " + d.toMinutesPart() + "min";
    }

    private String formatarHoras(double horas) {
        int h = (int) horas;
        int min = (int) Math.round((horas - h) * 60);
        return h + "h " + min + "min";
    }

    private String formatarSaldo(double saldo) {
        String sinal = saldo >= 0 ? "+" : "-";
        double abs = Math.abs(saldo);
        int h = (int) abs;
        int min = (int) Math.round((abs - h) * 60);
        return sinal + h + "h " + min + "min";
    }
}
