package com.grimoire.backend.usuario;

import com.grimoire.backend.shared.exception.RecursoNaoEncontradoException;
import com.grimoire.backend.shared.exception.RegraNegocioException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Transactional
    public Usuario criar(String nome, String email, String senha, String perfil) {
        if (repository.existsByEmail(email)) {
            throw new RegraNegocioException("E-mail já cadastrado");
        }

        Usuario usuario = Usuario.builder()
                .nome(nome)
                .email(email)
                .senhaHash(encoder.encode(senha))
                .perfil(perfil != null ? perfil : "USUARIO")
                .ativo(true)
                .build();

        return repository.save(usuario);
    }

    @Transactional(readOnly = true)
    public Usuario autenticar(String email, String senha) {
        Usuario usuario = repository.findByEmail(email)
                .orElseThrow(() -> new RegraNegocioException("E-mail ou senha inválidos"));

        if (!Boolean.TRUE.equals(usuario.getAtivo())) {
            throw new RegraNegocioException("Usuário inativo");
        }

        if (!encoder.matches(senha, usuario.getSenhaHash())) {
            throw new RegraNegocioException("E-mail ou senha inválidos");
        }

        return usuario;
    }

    @Transactional
    public void alterarSenha(Long id, String senhaAtual, String novaSenha) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário " + id + " não encontrado"));

        if (!encoder.matches(senhaAtual, usuario.getSenhaHash())) {
            throw new RegraNegocioException("Senha atual incorreta");
        }

        usuario.setSenhaHash(encoder.encode(novaSenha));
        repository.save(usuario);
    }
}
