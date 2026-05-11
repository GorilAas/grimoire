package com.grimoire.backend.usuario;

import com.grimoire.backend.config.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService service;
    private final JwtService jwtService;

    public record LoginRequest(
        @NotBlank(message = "Login e obrigatorio")
        String login,

        @NotBlank(message = "Senha e obrigatoria")
        String senha
    ) {}

    public record LoginResponse(
        String token,
        Long id,
        String nome,
        String login,
        String perfil,
        List<String> telasPermitidas
    ) {}

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest dto) {
        Usuario usuario = service.autenticar(dto.login(), dto.senha());

        String token = jwtService.gerarToken(usuario.getId(), usuario.getEmail(), usuario.getPerfil());

        return ResponseEntity.ok(new LoginResponse(
                token,
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil(),
                listarTelas(usuario.getTelasPermitidas())
        ));
    }

    private List<String> listarTelas(String valor) {
        if (valor == null || valor.isBlank()) return List.of();
        return Arrays.stream(valor.split(","))
            .map(String::trim)
            .filter(item -> !item.isBlank())
            .toList();
    }
}
