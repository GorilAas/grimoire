import api from './api'

const ROTA = '/api/categorias'

const categoriaServico = {
  listar:   ()          => api.get(ROTA),
  criar:    (nome)      => api.post(ROTA, { nome }),
  atualizar:(id, nome)  => api.put(`${ROTA}/${id}`, { nome }),
  excluir:  (id)        => api.delete(`${ROTA}/${id}`),
}

export default categoriaServico
