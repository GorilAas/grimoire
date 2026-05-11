import { useEffect, useState } from 'react'
import { PackagePlus, X } from 'lucide-react'
import Botao from '@/componentes/ui/Botao'
import estoqueServico from '@/servicos/estoqueServico'

const FORMULARIO_INICIAL = {
  tipo: 'ENTRADA',
  quantidade: '',
  motivo: 'AJUSTE_MANUAL',
  observacao: '',
}

const MOTIVOS = [
  { valor: 'AJUSTE_MANUAL', rotulo: 'Ajuste manual' },
  { valor: 'COMPRA', rotulo: 'Compra' },
  { valor: 'DEVOLUCAO', rotulo: 'Devolução' },
]

export default function ModalAjusteEstoque({ produto, onFechar, onSalvo }) {
  const [form, setForm] = useState(FORMULARIO_INICIAL)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!produto) return
    setForm(FORMULARIO_INICIAL)
    setErro('')
  }, [produto])

  if (!produto) return null

  function alterarCampo(campo, valor) {
    setForm(atual => ({ ...atual, [campo]: valor }))
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    if (!form.quantidade || Number(form.quantidade) <= 0) {
      return setErro('Quantidade deve ser maior que zero.')
    }

    setSalvando(true)
    try {
      await estoqueServico.ajustar({
        produtoId: produto.id,
        tipo: form.tipo,
        quantidade: Number(form.quantidade),
        motivo: form.motivo,
        observacao: form.observacao.trim() || null,
      })
      onSalvo?.()
      onFechar()
    } catch (err) {
      setErro(err?.response?.data?.mensagem ?? 'Erro ao ajustar estoque.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onFechar()}
    >
      <div
        className="w-full max-w-[420px] rounded-[16px] border border-[var(--linha-suave)] shadow-[var(--sombra-md)] p-6 flex flex-col gap-5"
        style={{ background: 'var(--fundo-1)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PackagePlus size={16} className="text-[var(--acento)]" />
            <div>
              <h2 className="text-[16px] font-semibold text-[var(--texto-0)]">Ajustar estoque</h2>
              <p className="text-[12px] text-[var(--texto-3)]">{produto.nome}</p>
            </div>
          </div>
          <button onClick={onFechar} className="w-8 h-8 grid place-items-center rounded-full hover:bg-[var(--fundo-2)] text-[var(--texto-2)]">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={salvar} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => alterarCampo('tipo', 'ENTRADA')}
              className={[
                'h-9 rounded-[8px] border text-[13px] font-medium transition-all',
                form.tipo === 'ENTRADA'
                  ? 'bg-[var(--acento-suave)] border-[var(--acento)] text-[var(--texto-0)]'
                  : 'border-[var(--linha-suave)] text-[var(--texto-2)] hover:text-[var(--texto-0)]',
              ].join(' ')}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => alterarCampo('tipo', 'SAIDA')}
              className={[
                'h-9 rounded-[8px] border text-[13px] font-medium transition-all',
                form.tipo === 'SAIDA'
                  ? 'bg-[var(--acento-suave)] border-[var(--acento)] text-[var(--texto-0)]'
                  : 'border-[var(--linha-suave)] text-[var(--texto-2)] hover:text-[var(--texto-0)]',
              ].join(' ')}
            >
              Saída
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Quantidade *</label>
              <input
                type="number"
                min="0.001"
                step="0.001"
                className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors"
                value={form.quantidade}
                onChange={e => alterarCampo('quantidade', e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Motivo</label>
              <select
                className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors"
                value={form.motivo}
                onChange={e => alterarCampo('motivo', e.target.value)}
              >
                {MOTIVOS.map(motivo => (
                  <option key={motivo.valor} value={motivo.valor}>{motivo.rotulo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Observação</label>
            <textarea
              rows={2}
              className="px-3 py-2 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors resize-none"
              value={form.observacao}
              onChange={e => alterarCampo('observacao', e.target.value)}
            />
          </div>

          {erro && (
            <p className="text-[12px] text-[var(--negativo)] bg-[var(--fundo-2)] px-3 py-2 rounded-[8px] border border-[var(--negativo)]/30">
              {erro}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Botao variante="fantasma" type="button" onClick={onFechar} disabled={salvando}>Cancelar</Botao>
            <Botao variante="primario" type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar ajuste'}
            </Botao>
          </div>
        </form>
      </div>
    </div>
  )
}
