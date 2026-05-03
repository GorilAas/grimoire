package com.grimoire.backend.usuario;

import com.grimoire.backend.config.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService service;
    private final JwtService jwtService;

    public record LoginRequest(
        @NotBlank(message = "Login é obrigatório")
        String login,

        @NotBlank(message = "Senha é obrigatória")
        String senha
    ) {}

    public record LoginResponse(
        String token,
        Long id,
        String nome,
        String login,
        String perfil
    ) {}

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest dto) {
        Usuario usuario = service.autenticar(dto.login(), dto.senha());

        String token = jwtService.gerarToken(usuario.getId(), usuario.getEmail(), usuario.getPerfil());

        return ResponseEntity.ok(new LoginResponse(
                token,
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil()
        ));
    }
}
