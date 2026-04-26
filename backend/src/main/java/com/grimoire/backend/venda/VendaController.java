package com.grimoire.backend.venda;

import com.grimoire.backend.shared.enums.FormaPagamento;
import com.grimoire.backend.venda.dto.VendaRequest;
import com.grimoire.backend.venda.dto.VendaResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {

    private final VendaService service;

    public VendaController(VendaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<VendaResponse> registrar(@Valid @RequestBody VendaRequest dto) {
        Venda venda = service.registrar(dto);
        URI uri = URI.create("/api/vendas/" + venda.getId());
        return ResponseEntity.created(uri).body(VendaResponse.from(venda));
    }

    @GetMapping
    public List<VendaResponse> listarTodas() {
        return service.listarTodas().stream()
                .map(VendaResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public VendaResponse buscarPorId(@PathVariable Long id) {
        return VendaResponse.from(service.buscarPorId(id));
    }

    @GetMapping("/cliente/{clienteId}")
    public List<VendaResponse> listarPorCliente(@PathVariable Long clienteId) {
        return service.listarPorCliente(clienteId).stream()
                .map(VendaResponse::from)
                .toList();
    }

    @GetMapping("/funcionario/{funcionarioId}")
    public List<VendaResponse> listarPorFuncionario(@PathVariable Long funcionarioId) {
        return service.listarPorFuncionario(funcionarioId).stream()
                .map(VendaResponse::from)
                .toList();
    }

    @GetMapping("/forma/{forma}")
    public List<VendaResponse> listarPorFormaPagamento(@PathVariable FormaPagamento forma) {
        return service.listarPorFormaPagamento(forma).stream()
                .map(VendaResponse::from)
                .toList();
    }

    @GetMapping("/periodo")
    public List<VendaResponse> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        return service.listarPorPeriodo(dataInicio, dataFim).stream()
                .map(VendaResponse::from)
                .toList();
    }

    @GetMapping("/fiado/aberto")
    public List<VendaResponse> listarFiadoEmAberto() {
        return service.listarFiadoEmAberto().stream()
                .map(VendaResponse::from)
                .toList();
    }

    @PatchMapping("/{id}/pagar")
    public VendaResponse marcarComoPago(@PathVariable Long id) {
        return VendaResponse.from(service.marcarComoPago(id));
    }
}
