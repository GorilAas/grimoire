import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o token JWT em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('fresquim_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Trata 401 (sessão expirada) e 403 (sem permissão)
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fresquim_token')
      localStorage.removeItem('fresquim_usuario')
      window.location.href = '/login'
    }
    if (err.response?.status === 403) {
      // Garante mensagem amigável nos componentes
      err.mensagemAmigavel = 'Você não tem permissão para realizar esta ação.'
      window.dispatchEvent(new CustomEvent('fresquim:forbidden', { detail: err }))
    }
    return Promise.reject(err)
  }
)

export default api
