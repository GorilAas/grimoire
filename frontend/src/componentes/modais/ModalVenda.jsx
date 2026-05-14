import { useState, useEffect } from 'react'
import { X, Plus, Trash2, XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Botao from '@/componentes/ui/Botao'
import vendasServico from '@/servicos/vendasServico'
import produtosServico from '@/servicos/produtosServico'
import funcionariosServico from '@/servicos/funcionariosServico'
import clientesServico from '@/servicos/clientesServico'
import { formatarMoeda, formatarDataHora } from '@/utilitarios/formatadores'

const FORMAS = [
  { valor: 'DINHEIRO', rotulo: 'Dinheiro' },
  { valor: 'DEBITO', rotulo: 'Débito' },
  { valor: 'CREDITO', rotulo: 'Crédito' },
  { valor: 'PIX', rotulo: 'PIX' },
  { valor: 'FIADO', rotulo: 'Fiado' },
]

const criarItemVazio = () => ({ produtoId: '', quantidade: 1, precoUnitario: 0 })

export default function ModalVenda({
  aberto,
  venda = null,
  podeCancelar = false,
  onFechar,
  onSalvo,
  onCancelada,
}) {
  const editando = Boolean(venda?.id)
  const cancelada = venda?.status === 'CANCELADA'

  const [funcionarioId, setFuncionarioId] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [forma, setForma] = useState('DINHEIRO')
  const [itens, setItens] = useState([criarItemVazio()])
  const [motivoCancelamento, setMotivoCancelamento] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [erro, setErro] = useState(null)

  const [produtos, setProdutos] = useState([])
  const [funcionarios, setFuncionarios] = useState([])
  const [clientes, setClientes] = useState([])

  useEffect(() => {
    if (!aberto) return

    setErro(null)
    setMotivoCancelamento('')
    setFuncionarioId(venda?.funcionarioId ? String(venda.funcionarioId) : '')
    setClienteId(venda?.clienteId ? String(venda.clienteId) : '')
    setForma(venda?.formaPagamento ?? 'DINHEIRO')
    setItens(
      venda?.itens?.length
        ? venda.itens.map(item => ({
            produtoId: String(item.produtoId),
            quantidade: Number(item.quantidade),
            precoUnitario: Number(item.precoUnitario),
          }))
        : [criarItemVazio()],
    )

    produtosServico.listarAtivos().then(r => setProdutos(r.data ?? [])).catch(() => {})
    funcionariosServico.listarTodos().then(r => setFuncionarios((r.data ?? []).filter(f => f.ativo !== false))).catch(() => {})
    clientesServico.listarTodos().then(r => setClientes((r.data ?? []).filter(c => c.ativo !== false))).catch(() => {})
  }, [aberto, venda])

  function adicionarItem() {
    setItens(prev => [...prev, criarItemVazio()])
  }

  function removerItem(idx) {
    setItens(prev => prev.filter((_, i) => i !== idx))
  }

  function atualizarItem(idx, campo, valor) {
    setItens(prev => prev.map((item, i) => {
      if (i !== idx) return item
      const atualizado = { ...item, [campo]: valor }
      if (campo === 'produtoId') {
        const prod = produtos.find(p => String(p.id) === String(valor))
        atualizado.precoUnitario = Number(prod?.precoUnitario ?? item.precoUnitario ?? 0)
      }
      return atualizado
    }))
  }

  const total = itens.reduce((acc, it) => acc + (Number(it.precoUnitario) * Number(it.quantidade)), 0)

  async function salvar(e) {
    e.preventDefault()
    setErro(null)

    if (cancelada) return setErro('Venda cancelada não pode ser editada.')
    if (!funcionarioId) return setErro('Selecione o funcionário que realizou a venda.')
    if (itens.some(it => !it.produtoId)) return setErro('Selecione o produto em todos os itens.')
    if (itens.some(it => Number(it.quantidade) <= 0)) return setErro('Quantidade deve ser maior que zero.')
    if (forma === 'FIADO' && !clienteId) return setErro('Venda em fiado exige um cliente selecionado.')

    const payload = {
      funcionarioId: Number(funcionarioId),
      clienteId: clienteId ? Number(clienteId) : null,
      formaPagamento: forma,
      itens: itens.map(it => ({
        produtoId: Number(it.produtoId),
        quantidade: Number(it.quantidade),
      })),
    }

    setSalvando(true)
    try {
      if (editando) {
        await vendasServico.atualizar(venda.id, payload)
      } else {
        await vendasServico.registrar(payload)
      }
      onSalvo?.()
      onFechar()
    } catch (err) {
      const status = err?.response?.status
      setErro(
        status === 405
          ? 'Backend desatualizado para editar venda. Reinicie o backend e tente novamente.'
          : err?.response?.data?.mensagem ?? `Erro ao ${editando ? 'atualizar' : 'registrar'} venda. Tente novamente.`,
      )
    } finally {
      setSalvando(false)
    }
  }

  async function cancelarVenda() {
    if (!editando || cancelada) return
    setErro(null)
    setCancelando(true)
    try {
      await vendasServico.cancelar(venda.id, { motivo: motivoCancelamento || null })
      onCancelada?.()
      onFechar()
    } catch (err) {
      setErro(err?.response?.data?.mensagem ?? 'Erro ao cancelar venda. Tente novamente.')
    } finally {
      setCancelando(false)
    }
  }

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onFechar()}
    >
      <div
        className="w-full max-w-2xl rounded-[14px] sm:rounded-[16px] border border-[var(--linha-suave)] shadow-[var(--sombra-md)] p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 max-h-[calc(100dvh-16px)] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden"
        style={{ background: 'var(--fundo-1)' }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-[var(--texto-0)]">
              {editando ? `Venda #${venda.id}` : 'Nova venda'}
            </h2>
            <p className="text-[12px] text-[var(--texto-3)] mt-0.5 break-words">
              {editando
                ? `${formatarDataHora(venda.dataVenda)} Â· ${cancelada ? 'cancelada' : 'ativa'}`
                : 'Registre os itens e o responsável pela venda'}
            </p>
          </div>
          <button
            onClick={onFechar}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--fundo-2)] text-[var(--texto-2)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {cancelada && (
          <div className="rounded-[10px] border border-[oklch(0.65_0.18_28/0.35)] bg-[oklch(0.65_0.18_28/0.1)] px-4 py-3 text-[13px] text-[var(--negativo)]">
            Esta venda foi cancelada. Motivo: {venda.motivoCancelamento || 'não informado'}.
          </div>
        )}

        <form onSubmit={salvar} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Funcionário responsável *
              </label>
              <select
                className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors"
                value={funcionarioId}
                disabled={cancelada}
                onChange={e => setFuncionarioId(e.target.value)}
              >
                <option value="">Selecione o funcionário...</option>
                {funcionarios.map(f => (
                  <option key={f.id} value={f.id}>{f.nome} - {f.cargo}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Cliente {forma === 'FIADO' ? '*' : '(opcional)'}
              </label>
              <select
                className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors"
                value={clienteId}
                disabled={cancelada}
                onChange={e => setClienteId(e.target.value)}
              >
                <option value="">Sem cliente vinculado</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
              Forma de pagamento *
            </label>
            <div className="grid grid-cols-2 min-[420px]:grid-cols-3 sm:flex sm:flex-wrap gap-1.5">
              {FORMAS.map(f => (
                <button
                  key={f.valor}
                  type="button"
                  disabled={cancelada}
                  aria-pressed={forma === f.valor}
                  onClick={() => setForma(f.valor)}
                  className={[
                    'h-9 text-[12px] px-3 rounded-[9px] border font-semibold transition-all disabled:opacity-60 inline-flex items-center justify-center gap-1.5',
                    forma === f.valor
                      ? 'bg-[var(--botao-primario-bg)] border-[var(--acento)] text-[var(--botao-primario-texto)] shadow-[0_0_0_2px_oklch(0.48_0.07_145/0.28)]'
                      : 'bg-[var(--fundo-2)] border-[var(--linha-suave)] text-[var(--texto-1)] hover:text-[var(--texto-0)] hover:border-[var(--linha)]',
                  ].join(' ')}
                >
                  {forma === f.valor && <CheckCircle2 size={13} />}
                  {f.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
              Itens da venda *
            </label>

            {itens.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[minmax(0,1fr)_72px_32px] sm:grid-cols-[minmax(0,1fr)_82px_32px] gap-2 items-center">
                <select
                  className="h-9 min-w-0 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors"
                  value={item.produtoId}
                  disabled={cancelada}
                  onChange={e => atualizarItem(idx, 'produtoId', e.target.value)}
                >
                  <option value="">Selecione o produto...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} - {formatarMoeda(p.precoUnitario)}</option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  className="h-9 min-w-0 px-2 sm:px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] text-center outline-none focus:border-[var(--acento)] transition-colors"
                  value={item.quantidade}
                  disabled={cancelada}
                  onChange={e => atualizarItem(idx, 'quantidade', e.target.value)}
                />

                {itens.length > 1 && !cancelada ? (
                  <button
                    type="button"
                    onClick={() => removerItem(idx)}
                    className="w-8 h-8 flex items-center justify-center rounded-[7px] hover:bg-[var(--fundo-2)] text-[var(--texto-3)] hover:text-[var(--negativo)] transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : <span />}
              </div>
            ))}

            {!cancelada && (
              <button
                type="button"
                onClick={adicionarItem}
                className="flex items-center gap-1.5 text-[12px] text-[var(--acento)] hover:text-[var(--acento-forte)] transition-colors w-fit"
              >
                <Plus size={13} />
                Adicionar item
              </button>
            )}
          </div>

          {total > 0 && (
            <div className="flex justify-between items-center gap-3 px-4 py-3 rounded-[10px] border border-[var(--linha-suave)] bg-[var(--fundo-2)]">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Total</span>
              <span className="font-mono text-[18px] font-semibold text-[var(--texto-0)]">{formatarMoeda(total)}</span>
            </div>
          )}

          {editando && podeCancelar && !cancelada && (
            <div className="rounded-[12px] border border-[oklch(0.65_0.18_28/0.32)] bg-[oklch(0.65_0.18_28/0.08)] p-4 flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-[var(--negativo)] mt-0.5" />
                <div>
                  <h3 className="text-[13px] font-semibold text-[var(--texto-0)]">Cancelar venda</h3>
                  <p className="text-[12px] text-[var(--texto-2)] mt-0.5">
                    O estoque será estornado e o saldo em fiado será abatido, quando existir.
                  </p>
                </div>
              </div>
              <textarea
                className="px-3 py-2 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--negativo)] transition-colors resize-none"
                rows={2}
                placeholder="Motivo do cancelamento"
                value={motivoCancelamento}
                onChange={e => setMotivoCancelamento(e.target.value)}
              />
              <button
                type="button"
                onClick={cancelarVenda}
                disabled={cancelando}
                className="w-fit px-4 py-2 rounded-[8px] text-[13px] font-semibold text-white bg-[var(--negativo)] hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <XCircle size={14} />
                {cancelando ? 'Cancelando...' : 'Cancelar venda'}
              </button>
            </div>
          )}

          {erro && (
            <p className="text-[12px] text-[var(--negativo)] bg-[var(--fundo-2)] px-3 py-2 rounded-[8px] border border-[var(--negativo)]/30">
              {erro}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-1">
            <Botao variante="fantasma" type="button" onClick={onFechar} className="w-full sm:w-auto justify-center">Fechar</Botao>
            {!cancelada && (
              <Botao variante="primario" type="submit" disabled={salvando} className="w-full sm:w-auto justify-center">
                {salvando ? 'Salvando...' : editando ? 'Salvar venda' : 'Registrar venda'}
              </Botao>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

