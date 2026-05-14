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
        var encoder = new BCryptPasswordEncoder();

        var adminExistente = usuarioRepository.findByEmail("admin");
        if (adminExistente.isPresent()) {
            var admin = adminExistente.get();
            boolean alterado = false;

            if (!hashBcryptValido(admin.getSenhaHash())) {
                admin.setSenhaHash(encoder.encode(adminSenha));
                alterado = true;
            }
            if (!"ADMIN".equals(admin.getPerfil())) {
                admin.setPerfil("ADMIN");
                alterado = true;
            }
            if (!Boolean.TRUE.equals(admin.getAtivo())) {
                admin.setAtivo(true);
                alterado = true;
            }
            if (admin.getTelasPermitidas() != null) {
                admin.setTelasPermitidas(null);
                alterado = true;
            }

            if (alterado) {
                usuarioRepository.save(admin);
                log.info("Conta admin existente corrigida.");
            } else {
                log.info("Admin ja existe. Nenhuma acao necessaria.");
            }
            return;
        }

        var admin = Usuario.builder()
                .nome("Administrador")
                .email("admin")
                .senhaHash(encoder.encode(adminSenha))
                .perfil("ADMIN")
                .telasPermitidas(null)
                .ativo(true)
                .build();

        usuarioRepository.save(admin);
        log.info("Conta admin criada com sucesso.");
    }

    private boolean hashBcryptValido(String hash) {
        return hash != null && (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"));
    }
}
