package com.grimoire.backend.ponto;

import com.grimoire.backend.ponto.dto.AjustePontoRequest;
import com.grimoire.backend.ponto.dto.RegistroPontoResponse;
import com.grimoire.backend.ponto.dto.ResumoPontoResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ponto")
@RequiredArgsConstructor
public class RegistroPontoController {

    private final RegistroPontoService service;

    public record BaterPontoRequest(
        // Opcional: Admin/Gerente podem passar para bater por outro funcionário
        Long funcionarioId
    ) {}

    /** POST /api/ponto/bater — usuário bate o próprio ponto */
    @PostMapping("/bater")
    public ResponseEntity<RegistroPontoResponse> bater(@RequestBody BaterPontoRequest dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long usuarioId = (Long) auth.getPrincipal();
        String perfil  = auth.getAuthorities().stream()
            .findFirst()
            .map(GrantedAuthority::getAuthority)
            .map(a -> a.replace("ROLE_", ""))
            .orElse("");

        RegistroPonto r = service.bater(usuarioId, dto.funcionarioId(), perfil);
        return ResponseEntity.created(URI.create("/api/ponto/" + r.getId()))
            .body(RegistroPontoResponse.from(r));
    }

    /** GET /api/ponto/hoje/{funcionarioId} */
    @GetMapping("/hoje/{funcionarioId}")
    public List<RegistroPontoResponse> hoje(@PathVariable Long funcionarioId) {
        return service.listarHoje(funcionarioId);
    }

    /** GET /api/ponto/resumo/{funcionarioId}?inicio=&fim= */
    @GetMapping("/resumo/{funcionarioId}")
    public List<ResumoPontoResponse> resumo(
            @PathVariable Long funcionarioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return service.resumo(funcionarioId, inicio, fim);
    }

    /** GET /api/ponto/periodo?inicio=&fim= — GERENTE/ADMIN */
    @GetMapping("/periodo")
    public List<RegistroPontoResponse> periodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return service.listarPorPeriodo(inicio, fim);
    }

    /** POST /api/ponto/ajuste — GERENTE/ADMIN */
    @PostMapping("/ajuste")
    public ResponseEntity<RegistroPontoResponse> ajustar(@Valid @RequestBody AjustePontoRequest dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Long usuarioId = (Long) auth.getPrincipal();
        RegistroPonto r = service.ajustar(dto, usuarioId);
        return ResponseEntity.created(URI.create("/api/ponto/" + r.getId()))
            .body(RegistroPontoResponse.from(r));
    }
}
