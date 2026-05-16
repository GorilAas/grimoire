import { useState } from 'react'
import { DollarSign, Unlock, Lock, Loader2 } from 'lucide-react'
import CabecalhoPagina from '@/componentes/ui/CabecalhoPagina'
import Cartao from '@/componentes/ui/Cartao'
import Chip from '@/componentes/ui/Chip'
import EstadoCarregando from '@/componentes/ui/EstadoCarregando'
import { useDadosApi } from '@/hooks/useDadosApi'
import caixaServico from '@/servicos/caixaServico'
import funcionariosServico from '@/servicos/funcionariosServico'
import { formatarMoeda } from '@/utilitarios/formatadores'

function formatarDataHora(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function Caixa() {
  const { dados: caixaAberto, recarregar: recarregarAberto } =
    useDadosApi(() => caixaServico.buscarAberto().catch(e => e.response?.status === 204 ? { data: null } : Promise.reject(e)))

  const { dados: historico, carregando: carregandoHistorico, recarregar: recarregarHistorico } =
    useDadosApi(() => caixaServico.listarTodos())

  const { dados: funcionarios } = useDadosApi(() => funcionariosServico.listarAtivos())

  const [abrindo,   setAbrindo]   = useState(false)
  const [fechando,  setFechando]  = useState(false)
  const [erro,      setErro]      = useState('')
  const [formAbrir, setFormAbrir] = useState({ funcionarioId: '', valorAbertura: '0', observacoes: '' })
  const [formFechar, setFormFechar] = useState({ valorFechamento: '', observacoes: '' })

  const caixa = caixaAberto

  async function handleAbrir(e) {
    e.preventDefault()
    setErro('')
    setAbrindo(true)
    try {
      await caixaServico.abrir(
        Number(formAbrir.funcionarioId),
        Number(formAbrir.valorAbertura),
        formAbrir.observacoes || null,
      )
      recarregarAberto()
      recarregarHistorico()
    } catch (err) {
      setErro(err?.response?.data?.message || 'Erro ao abrir caixa.')
    } finally {
      setAbrindo(false)
    }
  }

  async function handleFechar(e) {
    e.preventDefault()
    setErro('')
    setFechando(true)
    try {
      await caixaServico.fechar(
        Number(formFechar.valorFechamento),
        formFechar.observacoes || null,
      )
      recarregarAberto()
      recarregarHistorico()
    } catch (err) {
      setErro(err?.response?.data?.message || 'Erro ao fechar caixa.')
    } finally {
      setFechando(false)
    }
  }

  return (
    <div className="pagina-entrada p-7 flex flex-col gap-5">
      <CabecalhoPagina
        titulo="Caixa"
        subtitulo={caixa ? 'Caixa aberto' : 'Nenhum caixa aberto'}
      />

      {erro && (
        <div className="px-4 py-3 rounded-[10px] bg-[oklch(0.65_0.18_28/0.12)] border border-[oklch(0.65_0.18_28/0.3)] text-[var(--negativo)] text-[13px]">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">


        <Cartao className="p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className={[
              'w-10 h-10 rounded-[10px] grid place-items-center',
              caixa ? 'bg-[oklch(0.74_0.13_145/0.15)]' : 'bg-[var(--fundo-3)]',
            ].join(' ')}>
              <DollarSign size={20} className={caixa ? 'text-[var(--positivo)]' : 'text-[var(--texto-3)]'} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--texto-0)]">
                {caixa ? 'Caixa em aberto' : 'Caixa fechado'}
              </h2>
              {caixa && (
                <p className="text-[12px] text-[var(--texto-3)]">
                  Aberto por {caixa.funcionarioNome} às {formatarDataHora(caixa.abertoEm)}
                </p>
              )}
            </div>
            <Chip variante={caixa ? 'ok' : 'mudo'} className="ml-auto">
              {caixa ? 'Aberto' : 'Fechado'}
            </Chip>
          </div>

          {caixa && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-[10px] bg-[var(--fundo-2)] flex flex-col gap-1">
                <span className="text-[10.5px] font-mono uppercase tracking-[0.1em] text-[var(--texto-3)]">Fundo de abertura</span>
                <span className="text-[16px] font-bold font-mono text-[var(--texto-0)]">
                  {formatarMoeda(caixa.valorAbertura)}
                </span>
              </div>
            </div>
          )}


          {!caixa && (
            <form onSubmit={handleAbrir} className="flex flex-col gap-3 border-t border-[var(--linha-suave)] pt-4">
              <h3 className="text-[13px] font-semibold text-[var(--texto-0)]">Abrir caixa</h3>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Responsável *</label>
                <select
                  required
                  value={formAbrir.funcionarioId}
                  onChange={e => setFormAbrir(f => ({ ...f, funcionarioId: e.target.value }))}
                  className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)]"
                >
                  <option value="">Selecione...</option>
                  {(funcionarios ?? []).map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Fundo de troco (R$)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={formAbrir.valorAbertura}
                  onChange={e => setFormAbrir(f => ({ ...f, valorAbertura: e.target.value }))}
                  className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)]"
                />
              </div>

              <button
                type="submit"
                disabled={abrindo}
                className="flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[13px] font-semibold text-[var(--fundo-0)] transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, var(--acento-forte), oklch(0.48 0.07 145))' }}
              >
                {abrindo ? <Loader2 size={14} className="animate-spin" /> : <Unlock size={14} />}
                Abrir caixa
              </button>
            </form>
          )}


          {caixa && (
            <form onSubmit={handleFechar} className="flex flex-col gap-3 border-t border-[var(--linha-suave)] pt-4">
              <h3 className="text-[13px] font-semibold text-[var(--texto-0)]">Fechar caixa</h3>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Valor em caixa (R$) *</label>
                <input
                  type="number" step="0.01" min="0" required
                  placeholder="0,00"
                  value={formFechar.valorFechamento}
                  onChange={e => setFormFechar(f => ({ ...f, valorFechamento: e.target.value }))}
                  className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Observações</label>
                <input
                  placeholder="Opcional"
                  value={formFechar.observacoes}
                  onChange={e => setFormFechar(f => ({ ...f, observacoes: e.target.value }))}
                  className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)]"
                />
              </div>

              <button
                type="submit"
                disabled={fechando}
                className="flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[13px] font-semibold border border-[oklch(0.65_0.18_28/0.4)] text-[var(--negativo)] hover:bg-[oklch(0.65_0.18_28/0.1)] transition-all disabled:opacity-60"
              >
                {fechando ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                Fechar caixa
              </button>
            </form>
          )}
        </Cartao>


        <Cartao className="p-5 flex flex-col gap-3">
          <h3 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)]">Histórico</h3>
          {carregandoHistorico ? (
            <EstadoCarregando linhas={4} />
          ) : (historico ?? []).length === 0 ? (
            <p className="text-[13px] text-[var(--texto-3)] text-center py-4">Nenhum registro</p>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[400px]">
              {(historico ?? []).map(c => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-[8px] bg-[var(--fundo-2)] border border-[var(--linha-suave)]"
                >
                  <div className={[
                    'w-2 h-2 rounded-full mt-1.5 shrink-0',
                    c.status === 'ABERTO' ? 'bg-[var(--positivo)]' : 'bg-[var(--texto-3)]',
                  ].join(' ')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[12.5px] font-semibold text-[var(--texto-0)] truncate">{c.funcionarioNome}</span>
                      <Chip variante={c.status === 'ABERTO' ? 'ok' : 'mudo'} className="shrink-0">{c.status}</Chip>
                    </div>
                    <span className="font-mono text-[11px] text-[var(--texto-3)]">
                      {formatarDataHora(c.abertoEm)}
                      {c.fechadoEm && ` → ${formatarDataHora(c.fechadoEm)}`}
                    </span>
                    {c.valorFechamento != null && (
                      <div className="text-[12px] text-[var(--texto-2)] mt-0.5">
                        Fechamento: {formatarMoeda(c.valorFechamento)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Cartao>
      </div>
    </div>
  )
}
