package com.grimoire.backend.fiado;

import com.grimoire.backend.notificacao.NotificacaoModel;
import com.grimoire.backend.shared.enums.StatusFiado;
import com.grimoire.backend.venda.Venda;
import com.grimoire.backend.venda.VendaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class BuscarFiadosScheduler {

    private final VendaRepository vendaRepository;

    @Scheduled(cron = "${schedule.buscar-fiados.cron}")
    public void buscarFiados() {
        List<Venda> vendas = vendaRepository.listarPorStatusFiado(StatusFiado.PENDENTE);

        vendas.forEach(venda -> {
            //Aqui dentro o ideal seria chamar um port de integração de Whatsapp para enviar notificações diretamente

            new NotificacaoModel(
                    venda.getId(),
                    venda.getCliente().getNome(),
                    venda.getValorTotal()
            );

            log.info("Notificação criada para o cliente: {}", venda.getCliente().getNome());
        });
    }

}

