import api from './api'

const ROTA = '/api/clientes'

const clientesServico = {
  listarAtivos:   () => api.get(ROTA),
  listarTodos:    () => api.get(`${ROTA}/todos`),
  listarComFiado: () => api.get(`${ROTA}/fiado`),
  buscarPorId:    (id)  => api.get(`${ROTA}/${id}`),
  buscarPorCpf:   (cpf) => api.get(`${ROTA}/cpf/${cpf}`),
  criar:    (dados)       => api.post(ROTA, dados),
  atualizar:(id, dados)   => api.put(`${ROTA}/${id}`, dados),
  inativar: (id)          => api.delete(`${ROTA}/${id}`),
  reativar: (id)          => api.patch(`${ROTA}/${id}/reativar`),
  corrigirCpf: (id, cpf) => api.patch(`${ROTA}/${id}/cpf`, { cpf }),
}

export default clientesServico
