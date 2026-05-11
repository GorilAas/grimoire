import api from './api'

const chatServico = {
  enviar: (mensagem, historico) => api.post('/api/chat/mensagem', { mensagem, historico }),
}

export default chatServico
