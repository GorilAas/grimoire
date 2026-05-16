import axios from 'axios'

function resolverUrlApi() {
  const host = window.location.hostname
  if (host.endsWith('ngrok-free.app')) return ''
  return import.meta.env.VITE_API_URL || ''
}

const api = axios.create({
  baseURL: resolverUrlApi(),
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const url = String(config.url || '')
  if (url.includes('/api/auth/')) return config

  const token = localStorage.getItem('fresquim_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fresquim_token')
      localStorage.removeItem('fresquim_usuario')
      window.location.href = '/login'
    }

    if (err.response?.status === 403) {
      err.mensagemAmigavel = 'Você não tem permissão para realizar esta ação.'
      window.dispatchEvent(new CustomEvent('fresquim:forbidden', { detail: err }))
    }

    return Promise.reject(err)
  }
)

export default api
