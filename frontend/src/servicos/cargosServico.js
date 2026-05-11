import api from './api'

const ROTA = '/api/cargos'

const cargosServico = {
  listarAtivos: () => api.get(ROTA),
  listarTodos:  () => api.get(`${ROTA}/todos`).catch(err => {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      return api.get(ROTA)
    }
    throw err
  }),
  criar:        (dados) => api.post(ROTA, dados),
  atualizar:    (id, dados) => api.put(`${ROTA}/${id}`, dados),
  inativar:     (id) => api.delete(`${ROTA}/${id}`),
  reativar:     (id) => api.patch(`${ROTA}/${id}/reativar`),
}

export default cargosServico
