import api from './api'

const ROTA = '/api/caixa'

const caixaServico = {
  listarTodos:    ()                                  => api.get(ROTA),
  buscarAberto:   ()                                  => api.get(`${ROTA}/aberto`),
  abrir:          (funcionarioId, valorAbertura, obs) => api.post(`${ROTA}/abrir`, { funcionarioId, valorAbertura, observacoes: obs }),
  fechar:         (valorFechamento, obs)              => api.patch(`${ROTA}/fechar`, { valorFechamento, observacoes: obs }),
}

export default caixaServico
