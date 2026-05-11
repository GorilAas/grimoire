import api from './api'

const ROTA = '/api/estoque'

const estoqueServico = {
  listarPorProduto: (produtoId) => api.get(`${ROTA}/produto/${produtoId}`),
  ajustar: (dados) => api.post(`${ROTA}/ajuste`, dados),
}

export default estoqueServico
