import { useState, useEffect, useMemo } from 'react'
import { X, KeyRound, Trash2, Loader2, ShieldOff, Save } from 'lucide-react'
import authServico from '@/servicos/authServico'
import { TELAS_SISTEMA } from '@/configuracao/telasSistema'

const PERFIS = [
  { valor: '', rotulo: 'Padrao baseado no cargo' },
  { valor: 'GERENTE', rotulo: 'Gerente' },
  { valor: 'ATENDENTE', rotulo: 'Atendente' },
  { valor: 'PADEIRO', rotulo: 'Padeiro' },
]

function telasPadraoPorPerfil(perfil) {
  if (!perfil || perfil === 'GERENTE') return []
  return TELAS_SISTEMA
    .filter(tela => tela.perfis?.includes(perfil))
    .map(tela => tela.id)
}

export default function ModalAcesso({ funcionario, aoFechar, aoSalvar }) {
  const temAcesso = funcionario?.possuiAcesso ?? false
  const ehAdmin = funcionario?.perfil === 'ADMIN'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [perfil, setPerfil] = useState('')
  const [telas, setTelas] = useState([])
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [confirmarRevogacao, setConfirmarRevogacao] = useState(false)

  const perfilEfetivo = perfil || funcionario?.perfil || ''
  const telasSelecionaveis = useMemo(
    () => TELAS_SISTEMA.filter(tela => !perfilEfetivo || tela.perfis?.includes(perfilEfetivo) || perfilEfetivo === 'GERENTE'),
    [perfilEfetivo],
  )

  useEffect(() => {
    setEmail('')
    setSenha('')
    setPerfil(funcionario?.perfil ?? '')
    setTelas(funcionario?.telasPermitidas ?? [])
    setErro('')
    setConfirmarRevogacao(false)
  }, [funcionario])

  useEffect(() => {
    if (!temAcesso && perfil) {
      setTelas(telasPadraoPorPerfil(perfil))
    }
  }, [perfil, temAcesso])

  function alternarTela(id) {
    setTelas(atual => atual.includes(id)
      ? atual.filter(item => item !== id)
      : [...atual, id])
  }

  async function criarAcesso() {
    setErro('')
    if (!email.trim()) return setErro('Informe o login do funcionário.')
    if (!senha || senha.length < 6) return setErro('A senha deve ter no mínimo 6 caracteres.')
    setSalvando(true)
    try {
      await authServico.criarAcesso(funcionario.id, email.trim(), senha, perfil || null, telas)
      aoSalvar?.()
    } catch (err) {
      const msg = err?.response?.data?.mensagem || err?.response?.data?.message || err?.response?.data || ''
      setErro(msg ? String(msg) : 'Erro ao criar acesso.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleAtualizar() {
    setErro('')
    setSalvando(true)
    try {
      await authServico.atualizarAcesso(funcionario.id, {
        perfil: perfil || funcionario.perfil,
        telasPermitidas: telas,
      })
      aoSalvar?.()
    } catch (err) {
      const msg = err?.response?.data?.mensagem || err?.response?.data?.message || err?.response?.data || ''
      setErro(msg ? String(msg) : 'Erro ao atualizar acesso.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleRevogar() {
    setErro('')
    setSalvando(true)
    try {
      await authServico.revogarAcesso(funcionario.id)
      aoSalvar?.()
    } catch (err) {
      const msg = err?.response?.data?.mensagem || err?.response?.data?.message || err?.response?.data || ''
      setErro(msg ? String(msg) : 'Erro ao revogar acesso.')
      setConfirmarRevogacao(false)
    } finally {
      setSalvando(false)
    }
  }

  if (!funcionario) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && aoFechar()}
    >
      <div
        className="w-full max-w-[620px] rounded-[18px] border border-[var(--linha-suave)] flex flex-col overflow-hidden max-h-[90vh]"
        style={{ background: 'var(--fundo-1)', boxShadow: 'var(--sombra-md)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--linha-suave)]">
          <div className="flex items-center gap-2.5">
            <KeyRound size={16} className="text-[var(--acento)]" />
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--texto-0)]">
                {temAcesso ? 'Acesso do funcionário' : 'Criar acesso'}
              </h2>
              <p className="text-[11.5px] text-[var(--texto-3)] mt-0.5">{funcionario.nome}</p>
            </div>
          </div>
          <button onClick={aoFechar} className="text-[var(--texto-2)] hover:text-[var(--texto-0)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
          {!temAcesso && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--texto-2)]">E-mail ou login</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="funcionario@padaria.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-[var(--texto-0)] bg-[var(--fundo-3)] border border-[var(--linha-suave)] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--texto-2)]">Senha</label>
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="mínimo 6 caracteres"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-[var(--texto-0)] bg-[var(--fundo-3)] border border-[var(--linha-suave)] outline-none"
                />
              </div>
            </div>
          )}

          {temAcesso && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[10px] bg-[var(--fundo-2)] border border-[var(--linha-suave)] p-3">
                <span className="text-[11px] text-[var(--texto-3)]">Login atual</span>
                <p className="font-mono text-[13px] text-[var(--acento)] mt-1">{funcionario.emailAcesso}</p>
              </div>
              <div className="rounded-[10px] bg-[var(--fundo-2)] border border-[var(--linha-suave)] p-3">
                <span className="text-[11px] text-[var(--texto-3)]">Perfil atual</span>
                <p className="font-mono text-[13px] text-[var(--texto-0)] mt-1">{funcionario.perfil}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--texto-2)]">Perfil de acesso</label>
            <select
              value={perfil}
              onChange={e => setPerfil(e.target.value)}
              disabled={ehAdmin}
              className="w-full px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-[var(--texto-0)] bg-[var(--fundo-3)] border border-[var(--linha-suave)] outline-none disabled:opacity-70"
            >
              {PERFIS.map(p => <option key={p.valor} value={p.valor}>{p.rotulo}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <div>
              <h3 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)]">
                Telas permitidas
              </h3>
              <p className="text-[12px] text-[var(--texto-3)] mt-1">
                Se nenhuma tela for marcada, o sistema usa o acesso padrao do perfil. Admin sempre acessa tudo.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {telasSelecionaveis.map(tela => {
                const Icone = tela.Icone
                const marcado = ehAdmin || telas.includes(tela.id)
                return (
                  <label
                    key={tela.id}
                    className="flex items-center gap-2 rounded-[9px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] px-3 py-2 text-[13px] text-[var(--texto-1)]"
                  >
                    <input
                      type="checkbox"
                      checked={marcado}
                      disabled={ehAdmin}
                      onChange={() => alternarTela(tela.id)}
                    />
                    <Icone size={13} className="text-[var(--texto-3)]" />
                    {tela.rotulo}
                  </label>
                )
              })}
            </div>
          </div>

          {erro && (
            <div className="px-3 py-2.5 rounded-[8px] bg-[oklch(0.65_0.18_28/0.12)] border border-[oklch(0.65_0.18_28/0.3)] text-[var(--negativo)] text-[12.5px]">
              {erro}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            {temAcesso && !ehAdmin && (
              !confirmarRevogacao ? (
                <button
                  onClick={() => setConfirmarRevogacao(true)}
                  className="mr-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold border border-[oklch(0.65_0.18_28/0.4)] text-[var(--negativo)] hover:bg-[oklch(0.65_0.18_28/0.1)]"
                >
                  <ShieldOff size={14} />
                  Revogar acesso
                </button>
              ) : (
                <button
                  onClick={handleRevogar}
                  disabled={salvando}
                  className="mr-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold text-white bg-[var(--negativo)] disabled:opacity-60"
                >
                  {salvando ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Confirmar revogacao
                </button>
              )
            )}
            <button
              type="button"
              onClick={aoFechar}
              className="px-4 py-2.5 rounded-[10px] text-[13px] font-medium text-[var(--texto-1)] border border-[var(--linha-suave)] hover:bg-[var(--fundo-3)]"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={temAcesso ? handleAtualizar : criarAcesso}
              disabled={salvando || ehAdmin}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] text-[13px] font-semibold disabled:opacity-60"
              style={{
                background: 'var(--botao-primario-bg)',
                color: 'var(--botao-primario-texto)',
                boxShadow: 'var(--botao-primario-sombra)',
              }}
            >
              {salvando ? <Loader2 size={14} className="animate-spin" /> : temAcesso ? <Save size={14} /> : <KeyRound size={14} />}
              {temAcesso ? 'Salvar acesso' : 'Criar acesso'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

