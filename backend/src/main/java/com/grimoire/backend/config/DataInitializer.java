package com.grimoire.backend.config;

import com.grimoire.backend.usuario.Usuario;
import com.grimoire.backend.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;

    @Value("${admin.senha}")
    private String adminSenha;

    @Override
    public void run(String... args) {
        if (usuarioRepository.existsByEmail("admin")) {
            log.info("Admin já existe — nenhuma ação necessária.");
            return;
        }

        var encoder = new BCryptPasswordEncoder();
        var admin = Usuario.builder()
                .nome("Administrador")
                .email("admin")
                .senhaHash(encoder.encode(adminSenha))
                .perfil("ADMIN")
                .ativo(true)
                .build();

        usuarioRepository.save(admin);
        log.info("Conta admin criada com sucesso.");
    }
}
