package com.grimoire.backend.fiado;

import com.grimoire.backend.notificacao.Notificacao;
import com.grimoire.backend.notificacao.NotificacaoRepository;
import com.grimoire.backend.shared.enums.StatusFiado;
import com.grimoire.backend.venda.Venda;
import com.grimoire.backend.venda.VendaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BuscarFiadosScheduler {

    private final VendaRepository vendaRepository;
    private final NotificacaoRepository notificacaoRepository;

    @Scheduled(cron = "${schedule.buscar-fiados.cron}")
    @Transactional
    public void buscarFiados() {
        List<Venda> vendas = vendaRepository.listarPorStatusFiadoEm(List.of(StatusFiado.PENDENTE));

        if (vendas.isEmpty()) {
            log.debug("Nenhuma venda fiado pendente para notificar.");
            return;
        }

        vendas.forEach(venda -> {
            Notificacao notificacao = Notificacao.builder()
                .cliente(venda.getCliente())
                .canal("WHATSAPP")
                .conteudo(montarMensagem(venda))
                .sucesso(true)
                .build();

            notificacaoRepository.save(notificacao);
            venda.setStatusFiado(StatusFiado.NOTIFICADO);
            vendaRepository.save(venda);

            log.info("Notificacao de fiado salva para cliente {} na venda #{}",
                venda.getCliente().getNome(), venda.getId());
        });
    }

    private String montarMensagem(Venda venda) {
        return "Ola, " + venda.getCliente().getNome()
            + ". Identificamos um fiado em aberto referente a venda #"
            + venda.getId()
            + " no valor de R$ "
            + venda.getValorTotal()
            + ". Procure a padaria para regularizar o pagamento.";
    }
}
