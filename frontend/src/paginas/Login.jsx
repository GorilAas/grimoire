import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contextos/AuthContexto'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [loginStr, setLoginStr] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [senhaVisivel, setSenhaVisivel] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      await login(loginStr.trim(), senha)
      navigate('/', { replace: true })
    } catch (err) {
      const msg = err?.response?.data?.mensagem || err?.response?.data?.message || err?.response?.data || ''
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setErro('Login ou senha incorretos.')
      } else if (msg) {
        setErro(String(msg))
      } else {
        setErro('Não foi possível conectar ao servidor.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--fundo-0)' }}
    >
      <div
        className="w-full max-w-[380px] rounded-[18px] border border-[var(--linha-suave)] p-8 flex flex-col gap-7"
        style={{
          background: 'linear-gradient(160deg, var(--fundo-1) 0%, var(--fundo-2) 100%)',
          boxShadow: 'var(--sombra-md)',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-[52px] h-[52px] rounded-[14px] grid place-items-center font-mono font-bold text-[20px]"
            style={{
              background: 'var(--marca-bg)',
              color: 'var(--marca-texto)',
              boxShadow: 'var(--marca-sombra)',
            }}
          >
            PF
          </div>
          <div className="text-center">
            <h1 className="text-[20px] font-bold text-[var(--texto-0)] leading-none">
              Pão<em className="not-italic font-mono font-semibold text-[var(--acento)]">FresQUIM</em>
            </h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--texto-3)] mt-1">
              Painel de Gestão
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--texto-2)]">
              Login
            </label>
            <input
              type="text"
              value={loginStr}
              onChange={e => setLoginStr(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
              className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px] text-[var(--texto-0)] bg-[var(--fundo-3)] border border-[var(--linha-suave)] outline-none transition-all duration-160 placeholder:text-[var(--texto-3)] focus:border-[var(--acento)] focus:ring-2 focus:ring-[oklch(0.48_0.07_145/0.2)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--texto-2)]">
              Senha
            </label>
            <div className="relative">
              <input
                type={senhaVisivel ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="********"
                autoComplete="current-password"
                required
                className="w-full px-3.5 py-2.5 pr-11 rounded-[10px] text-[14px] text-[var(--texto-0)] bg-[var(--fundo-3)] border border-[var(--linha-suave)] outline-none transition-all duration-160 placeholder:text-[var(--texto-3)] focus:border-[var(--acento)] focus:ring-2 focus:ring-[oklch(0.48_0.07_145/0.2)]"
              />
              <button
                type="button"
                onClick={() => setSenhaVisivel(visivel => !visivel)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[8px] grid place-items-center text-[var(--texto-0)] bg-[var(--fundo-2)] border border-[var(--linha-suave)] hover:border-[var(--acento)] hover:bg-[var(--fundo-3)] transition-colors"
                aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                title={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {senhaVisivel ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {erro && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] bg-[oklch(0.65_0.18_28/0.12)] border border-[oklch(0.65_0.18_28/0.3)] text-[var(--negativo)] text-[13px]">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-[14px] font-semibold transition-all duration-160 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
            style={{
              background: 'var(--botao-primario-bg)',
              color: 'var(--botao-primario-texto)',
              borderColor: 'var(--botao-primario-borda)',
              boxShadow: 'var(--botao-primario-sombra)',
            }}
          >
            {carregando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
