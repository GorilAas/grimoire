import api from './api'

const ROTA = '/api/ponto'

const pontoServico = {
  bater:         (funcionarioId)                    => api.post(`${ROTA}/bater`, { funcionarioId }),
  hoje:          (funcionarioId)                    => api.get(`${ROTA}/hoje/${funcionarioId}`),
  resumo:        (funcionarioId, inicio, fim)       => api.get(`${ROTA}/resumo/${funcionarioId}`, { params: { inicio, fim } }),
  periodo:       (inicio, fim)                      => api.get(`${ROTA}/periodo`, { params: { inicio, fim } }),
  ajuste:        (dados)                            => api.post(`${ROTA}/ajuste`, dados),
}

export default pontoServico
