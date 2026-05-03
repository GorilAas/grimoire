package com.grimoire.backend.venda;

import com.grimoire.backend.funcionario.FuncionarioRepository;
import com.grimoire.backend.shared.enums.FormaPagamento;
import com.grimoire.backend.venda.dto.VendaRequest;
import com.grimoire.backend.venda.dto.VendaResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/vendas")
@RequiredArgsConstructor
public class VendaController {

    private final VendaService service;
    private final FuncionarioRepository funcionarioRepository;

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

    public record CancelarVendaRequest(String motivo) {}

    @PatchMapping("/{id}/cancelar")
    public VendaResponse cancelar(
            @PathVariable Long id,
            @RequestBody(required = false) CancelarVendaRequest dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long usuarioId = (Long) auth.getPrincipal();
        Long funcId = funcionarioRepository.findByUsuarioId(usuarioId)
            .map(f -> f.getId()).orElse(null);
        String motivo = dto != null ? dto.motivo() : null;
        return VendaResponse.from(service.cancelar(id, motivo, funcId));
    }
}
