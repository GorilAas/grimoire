import api from './api'

const ROTA = '/api/vendas'

const vendasServico = {
  listarTodas:         ()              => api.get(ROTA),
  buscarPorId:         (id)            => api.get(`${ROTA}/${id}`),
  listarPorCliente:    (clienteId)     => api.get(`${ROTA}/cliente/${clienteId}`),
  listarPorFuncionario:(funcionarioId) => api.get(`${ROTA}/funcionario/${funcionarioId}`),
  listarPorFormaPagamento: (forma)     => api.get(`${ROTA}/forma/${forma}`),
  listarPorPeriodo:    (dataInicio, dataFim) =>
    api.get(`${ROTA}/periodo`, { params: { dataInicio, dataFim } }),
  listarFiadoEmAberto: () => api.get(`${ROTA}/fiado/aberto`),
  registrar:     (dados) => api.post(ROTA, dados),
  atualizar:     (id, dados) => api.patch(`${ROTA}/${id}`, dados),
  marcarComoPago:(id)           => api.patch(`${ROTA}/${id}/pagar`),
  cancelar:     (id, dados)    => api.patch(`${ROTA}/${id}/cancelar`, dados),
}

export default vendasServico
