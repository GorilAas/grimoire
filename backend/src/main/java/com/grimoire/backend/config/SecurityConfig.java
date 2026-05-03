package com.grimoire.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ── Público ───────────────────────────────────────────────
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()

                // ── Funcionários ──────────────────────────────────────────
                .requestMatchers(HttpMethod.POST,   "/api/funcionarios/*/acesso").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/funcionarios/*/acesso").hasRole("ADMIN")
                .requestMatchers("/api/funcionarios/**").hasAnyRole("ADMIN", "GERENTE")

                // ── Categorias — GET para todos; mutações ADMIN/GERENTE ───
                .requestMatchers(HttpMethod.GET, "/api/categorias/**")
                    .hasAnyRole("ADMIN", "GERENTE", "ATENDENTE", "PADEIRO")
                .requestMatchers("/api/categorias/**").hasAnyRole("ADMIN", "GERENTE")

                // ── Produtos — todos os perfis ────────────────────────────
                .requestMatchers("/api/produtos/**")
                    .hasAnyRole("ADMIN", "GERENTE", "ATENDENTE", "PADEIRO")

                // ── Estoque — ADMIN e GERENTE ─────────────────────────────
                .requestMatchers("/api/estoque/**").hasAnyRole("ADMIN", "GERENTE")

                // ── Clientes — ADMIN, GERENTE, ATENDENTE ─────────────────
                .requestMatchers("/api/clientes/**").hasAnyRole("ADMIN", "GERENTE", "ATENDENTE")

                // ── Vendas — cancelamento só ADMIN/GERENTE ───────────────
                .requestMatchers(HttpMethod.PATCH, "/api/vendas/*/cancelar").hasAnyRole("ADMIN", "GERENTE")
                .requestMatchers("/api/vendas/**").hasAnyRole("ADMIN", "GERENTE", "ATENDENTE")

                // ── Caixa — ADMIN e GERENTE ───────────────────────────────
                .requestMatchers("/api/caixa/**").hasAnyRole("ADMIN", "GERENTE")

                // ── Ponto ─────────────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/ponto/bater").authenticated()
                .requestMatchers(HttpMethod.GET,  "/api/ponto/hoje/**").authenticated()
                .requestMatchers(HttpMethod.GET,  "/api/ponto/resumo/**").authenticated()
                .requestMatchers(HttpMethod.GET,  "/api/ponto/periodo").hasAnyRole("ADMIN", "GERENTE")
                .requestMatchers(HttpMethod.POST, "/api/ponto/ajuste").hasAnyRole("ADMIN", "GERENTE")

                // ── Chat — ADMIN, GERENTE, ATENDENTE ─────────────────────
                .requestMatchers("/api/chat/**").hasAnyRole("ADMIN", "GERENTE", "ATENDENTE")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
