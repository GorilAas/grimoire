/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react'
import api from '@/servicos/api'

const AuthContexto = createContext(null)

const CHAVE_TOKEN  = 'fresquim_token'
const CHAVE_USUARIO = 'fresquim_usuario'

function carregarDoStorage() {
  try {
    const token   = localStorage.getItem(CHAVE_TOKEN)
    const usuario = JSON.parse(localStorage.getItem(CHAVE_USUARIO) || 'null')
    return { token, usuario }
  } catch {
    return { token: null, usuario: null }
  }
}

export function AuthProvider({ children }) {
  const inicial = carregarDoStorage()
  const [token,   setToken]   = useState(inicial.token)
  const [usuario, setUsuario] = useState(inicial.usuario)

  const login = useCallback(async (loginStr, senha) => {
    const res = await api.post('/api/auth/login', { login: loginStr, senha })
    const dados = res.data

    localStorage.setItem(CHAVE_TOKEN,   dados.token)
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify({
      id:     dados.id,
      nome:   dados.nome,
      login:  dados.login,
      perfil: dados.perfil,
      telasPermitidas: dados.telasPermitidas ?? [],
    }))

    setToken(dados.token)
    setUsuario({
      id: dados.id,
      nome: dados.nome,
      login: dados.login,
      perfil: dados.perfil,
      telasPermitidas: dados.telasPermitidas ?? [],
    })

    return dados
  }, [])

  const sair = useCallback(() => {
    localStorage.removeItem(CHAVE_TOKEN)
    localStorage.removeItem(CHAVE_USUARIO)
    setToken(null)
    setUsuario(null)
  }, [])

  const temPermissao = useCallback((perfisPermitidos) => {
    if (!usuario) return false
    if (usuario.perfil === 'ADMIN') return true
    return perfisPermitidos.includes(usuario.perfil)
  }, [usuario])

  return (
    <AuthContexto.Provider value={{ token, usuario, login, sair, temPermissao, autenticado: !!token }}>
      {children}
    </AuthContexto.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContexto)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
