import { X, ShoppingBag, TrendingDown } from 'lucide-react'
import Chip from '@/componentes/ui/Chip'
import EstadoCarregando from '@/componentes/ui/EstadoCarregando'
import vendasServico from '@/servicos/vendasServico'
import { formatarMoeda, formatarDataHora } from '@/utilitarios/formatadores'
import { useDadosApi } from '@/hooks/useDadosApi'

const ROTULOS_FORMA = {
  DINHEIRO: 'Dinheiro',
  DEBITO:   'Débito',
  CREDITO:  'Crédito',
  PIX:      'PIX',
  FIADO:    'Fiado',
}

export default function ModalComprasCliente({ cliente, onFechar }) {
  const { dados, carregando, erro } = useDadosApi(
    () => vendasServico.listarPorCliente(cliente.id),
    [cliente?.id],
    Boolean(cliente?.id),
  )

  if (!cliente) return null

  const vendas = dados ?? []
  const ativas     = vendas.filter(v => v.status !== 'CANCELADA')
  const totalGasto = ativas.reduce((acc, v) => acc + Number(v.valorTotal ?? 0), 0)
  const emFiado    = ativas.filter(v => v.statusFiado === 'PENDENTE')
    .reduce((acc, v) => acc + Number(v.valorTotal ?? 0), 0)

  function chipVenda(v) {
    if (v.status === 'CANCELADA') return <Chip variante="erro">Cancelada</Chip>
    if (v.statusFiado === 'PENDENTE') return <Chip variante="alerta">Fiado</Chip>
    if (v.statusFiado === 'PAGO') return <Chip variante="mudo">Quitado</Chip>
    return <Chip variante="ok">Paga</Chip>
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onFechar()}
    >
      <div
        className="w-full max-w-[600px] rounded-[18px] border border-[var(--linha-suave)] shadow-[var(--sombra-md)] flex flex-col max-h-[85vh] overflow-hidden"
        style={{ background: 'var(--fundo-1)' }}
      >

        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--linha-suave)] shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={16} className="text-[var(--acento)]" />
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--texto-0)]">
                Histórico de compras
              </h2>
              <p className="text-[11px] text-[var(--texto-3)] mt-0.5">{cliente.nome}</p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="text-[var(--texto-2)] hover:text-[var(--texto-0)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>


        <div className="px-6 py-3 border-b border-[var(--linha-suave)] shrink-0 flex gap-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Total gasto</p>
            <p className="text-[16px] font-semibold font-mono text-[var(--texto-0)]">{formatarMoeda(totalGasto)}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Compras</p>
            <p className="text-[16px] font-semibold font-mono text-[var(--texto-0)]">{ativas.length}</p>
          </div>
          {emFiado > 0 && (
            <div className="flex items-start gap-1.5">
              <TrendingDown size={14} className="text-[var(--negativo)] mt-[3px]" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--negativo)]">Fiado em aberto</p>
                <p className="text-[16px] font-semibold font-mono text-[var(--negativo)]">{formatarMoeda(emFiado)}</p>
              </div>
            </div>
          )}
        </div>


        <div className="overflow-y-auto flex-1">
          {carregando && (
            <div className="p-5">
              <EstadoCarregando linhas={5} />
            </div>
          )}

          {!carregando && erro && (
            <p className="p-5 text-[13px] text-[var(--negativo)]">Erro ao carregar histórico de compras.</p>
          )}

          {!carregando && !erro && vendas.length === 0 && (
            <div className="p-10 text-center text-[13px] text-[var(--texto-3)]">
              Nenhuma compra registrada para este cliente.
            </div>
          )}

          {!carregando && vendas.length > 0 && (
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  {['Data/Hora', 'Forma', 'Total', 'Status'].map(col => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)] font-medium border-b border-[var(--linha-suave)] sticky top-0"
                      style={{ background: 'var(--fundo-1)' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...vendas].reverse().map(v => (
                  <tr
                    key={v.id}
                    className={[
                      'border-b border-[var(--linha-suave)] last:border-0',
                      v.status === 'CANCELADA' ? 'opacity-40' : '',
                    ].join(' ')}
                  >
                    <td className="px-5 py-3 font-mono text-[12px] text-[var(--texto-2)]">
                      {formatarDataHora(v.dataVenda)}
                    </td>
                    <td className="px-5 py-3 text-[var(--texto-2)]">
                      {ROTULOS_FORMA[v.formaPagamento] ?? v.formaPagamento ?? '—'}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-[var(--texto-0)]">
                      {formatarMoeda(v.valorTotal)}
                    </td>
                    <td className="px-5 py-3">
                      {chipVenda(v)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
