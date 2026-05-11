import api from './api'

const ROTA = '/api/funcionarios'

const funcionariosServico = {
  listarAtivos:  ()      => api.get(ROTA),
  listarTodos:   ()      => api.get(`${ROTA}/todos`),
  buscarMeuFuncionario: () => api.get(`${ROTA}/me`),
  listarPorCargo:(cargo) => api.get(`${ROTA}/cargo/${cargo}`),
  buscarPorId:   (id)    => api.get(`${ROTA}/${id}`),
  criar:    (dados)      => api.post(ROTA, dados),
  atualizar:(id, dados)  => api.put(`${ROTA}/${id}`, dados),
  inativar: (id)         => api.delete(`${ROTA}/${id}`),
}

export default funcionariosServico
