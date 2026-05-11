import api from './api'

const authServico = {
  login: (login, senha) => api.post('/api/auth/login', { login, senha }),

  criarAcesso: (funcionarioId, email, senha, perfil, telasPermitidas) =>
    api.post(`/api/funcionarios/${funcionarioId}/acesso`, { email, senha, perfil, telasPermitidas }),

  atualizarAcesso: (funcionarioId, dados) =>
    api.patch(`/api/funcionarios/${funcionarioId}/acesso`, dados),

  revogarAcesso: (funcionarioId) =>
    api.delete(`/api/funcionarios/${funcionarioId}/acesso`),
}

export default authServico
