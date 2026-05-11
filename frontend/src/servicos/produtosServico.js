import api from './api'

const ROTA = '/api/produtos'

const produtosServico = {
  listarAtivos:   () => api.get(ROTA),
  listarTodos:    () => api.get(`${ROTA}/todos`),
  buscarPorId:    (id)     => api.get(`${ROTA}/${id}`),
  buscarPorCodigo:(codigo) => api.get(`${ROTA}/codigo/${codigo}`),
  criar:    (dados)      => api.post(ROTA, dados),
  atualizar:(id, dados)  => api.put(`${ROTA}/${id}`, dados),
  inativar:        (id)         => api.delete(`${ROTA}/${id}`),
  reativar:        (id)         => api.patch(`${ROTA}/${id}/reativar`),
  buscarPorNome:   (termo)      => api.get(`${ROTA}/busca`, { params: { termo } }),
  abaixoDoMinimo:  ()           => api.get(`${ROTA}/abaixo-minimo`),
  porCategoria:    (catId)      => api.get(`${ROTA}/categoria/${catId}`),
}

export default produtosServico
