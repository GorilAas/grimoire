import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  DollarSign, ShoppingBag, TrendingUp, AlertCircle,
  RefreshCcw, AlertTriangle, Vault, Package,
} from 'lucide-react'
import CartaoKpi from '@/componentes/ui/CartaoKpi'
import CabecalhoPagina from '@/componentes/ui/CabecalhoPagina'
import Cartao from '@/componentes/ui/Cartao'
import Botao from '@/componentes/ui/Botao'
import Chip from '@/componentes/ui/Chip'
import EstadoCarregando from '@/componentes/ui/EstadoCarregando'
import { useDadosApi } from '@/hooks/useDadosApi'
import vendasServico from '@/servicos/vendasServico'
import produtosServico from '@/servicos/produtosServico'
import caixaServico from '@/servicos/caixaServico'
import { formatarMoeda, formatarDataHora, hoje, somarValorTotal } from '@/utilitarios/formatadores'

const ROTULOS_FORMA = {
  DINHEIRO: 'Dinheiro',
  DEBITO:   'Débito',
  CREDITO:  'Crédito',
  PIX:      'PIX',
  FIADO:    'Fiado',
}

function agruparPorHora(vendas) {
  const horas = Array.from({ length: 17 }, (_, i) => ({
    hora: `${String(i + 6).padStart(2, '0')}h`,
    receita: 0,
  }))
  vendas.forEach(v => {
    const h = new Date(v.dataVenda).getHours()
    if (h >= 6 && h <= 22) horas[h - 6].receita += Number(v.valorTotal ?? 0)
  })
  return horas
}

function agruparPorForma(vendas) {
  const mapa = {}
  vendas.forEach(v => {
    const k = v.formaPagamento ?? 'OUTRO'
    mapa[k] = (mapa[k] ?? 0) + Number(v.valorTotal ?? 0)
  })
  return Object.entries(mapa).map(([k, v]) => ({
    rotulo: ROTULOS_FORMA[k] ?? k,
    valor: Math.round(v * 100) / 100,
  }))
}

function TooltipMoeda({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-[8px] border border-[var(--linha-suave)] text-[12px] font-mono"
      style={{ background: 'var(--fundo-1)' }}
    >
      {formatarMoeda(payload[0].value)}
    </div>
  )
}

export default function Dashboard() {
  const { dados: vendas,   carregando, erro, recarregar } = useDadosApi(
    () => vendasServico.listarPorPeriodo(hoje(), hoje()),
  )
  const { dados: fiado,    recarregar: recarregarFiado } = useDadosApi(
    () => vendasServico.listarFiadoEmAberto(),
  )
  const { dados: baixoEstoque, recarregar: recarregarEstoque } = useDadosApi(
    () => produtosServico.abaixoDoMinimo(),
  )
  const { dados: caixaAberto, recarregar: recarregarCaixa } = useDadosApi(
    () => caixaServico.buscarAberto(),
  )

  function atualizar() {
    recarregar()
    recarregarFiado()
    recarregarEstoque()
    recarregarCaixa()
  }

  const lista = useMemo(() => vendas ?? [], [vendas])
  const receita = somarValorTotal(lista)
  const tickets = lista.length
  const ticketMedio = tickets ? receita / tickets : 0
  const fiadoCount = (fiado ?? []).length
  const alertasEstoque = baixoEstoque ?? []
  const caixa = (caixaAberto && caixaAberto.id) ? caixaAberto : null

  const dadosHora  = useMemo(() => agruparPorHora(lista),  [lista])
  const dadosForma = useMemo(() => agruparPorForma(lista), [lista])

  const tickStyle = { fill: 'var(--texto-3)', fontSize: 10, fontFamily: 'var(--font-mono)' }
  const axisProps = { axisLine: false, tickLine: false }

  return (
    <div className="pagina-entrada p-7 flex flex-col gap-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <CabecalhoPagina
          titulo="Dashboard"
          subtitulo={`Dados do dia - ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}`}
        />
        <Botao variante="fantasma" onClick={atualizar}>
          <RefreshCcw size={13} />
          Atualizar
        </Botao>
      </div>

      {carregando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <EstadoCarregando key={i} linhas={3} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 escalonado">
          <CartaoKpi
            rotulo="Receita do dia"
            valor={formatarMoeda(receita)}
            icone={DollarSign}
            rotuloReferencia="hoje"
          />
          <CartaoKpi
            rotulo="Tickets"
            valor={String(tickets)}
            icone={ShoppingBag}
            rotuloReferencia="hoje"
          />
          <CartaoKpi
            rotulo="Ticket médio"
            valor={formatarMoeda(ticketMedio)}
            icone={TrendingUp}
            rotuloReferencia="hoje"
          />
          <CartaoKpi
            rotulo="Fiado em aberto"
            valor={String(fiadoCount)}
            icone={AlertCircle}
            delta={fiadoCount > 0 ? -fiadoCount : 0}
            rotuloReferencia="total"
          />
        </div>
      )}

      {(alertasEstoque.length > 0 || caixa !== null) && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
          {alertasEstoque.length > 0 && (
            <Cartao className="overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--linha-suave)]">
                <AlertTriangle size={14} className="text-[oklch(0.65_0.18_55)]" />
                <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--texto-2)]">
                  Estoque abaixo do mínimo
                </h3>
                <span className="ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-[oklch(0.75_0.15_55/0.2)] text-[oklch(0.55_0.15_55)] font-semibold">
                  {alertasEstoque.length}
                </span>
              </div>
              <div className="divide-y divide-[var(--linha-suave)]">
                {alertasEstoque.slice(0, 8).map(p => (
                  <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <Package size={13} className="text-[var(--texto-3)] shrink-0" />
                      <span className="truncate text-[13px] text-[var(--texto-0)]">{p.nome}</span>
                      {p.categoriaNome && (
                        <span className="hidden sm:inline text-[11px] text-[var(--texto-3)]">- {p.categoriaNome}</span>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-[12px] text-[oklch(0.55_0.15_55)] font-semibold">
                      {Number(p.quantidadeEstoque ?? 0).toFixed(0)} / {Number(p.estoqueMinimo ?? 0).toFixed(0)}
                    </span>
                  </div>
                ))}
                {alertasEstoque.length > 8 && (
                  <div className="px-5 py-2 text-[12px] text-[var(--texto-3)]">
                    +{alertasEstoque.length - 8} produtos...
                  </div>
                )}
              </div>
            </Cartao>
          )}

          {caixa !== null && (
            <Cartao className="p-5 flex flex-col gap-3 lg:min-w-[220px]">
              <div className="flex items-center gap-2">
                <Vault size={14} className="text-[var(--acento)]" />
                <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--texto-2)]">
                  Caixa
                </h3>
              </div>
              <Chip variante="ok" className="w-fit">Aberto</Chip>
              {caixa.funcionarioNome && (
                <p className="text-[12px] text-[var(--texto-2)]">
                  <span className="text-[var(--texto-3)]">Operador: </span>
                  {caixa.funcionarioNome}
                </p>
              )}
              {caixa.abertoEm && (
                <p className="text-[11.5px] font-mono text-[var(--texto-3)]">
                  Desde {formatarDataHora(caixa.abertoEm)}
                </p>
              )}
              {caixa.valorAbertura != null && (
                <p className="text-[13px] font-mono font-semibold text-[var(--texto-0)]">
                  Abertura: {formatarMoeda(caixa.valorAbertura)}
                </p>
              )}
            </Cartao>
          )}
        </div>
      )}

      {!carregando && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          <Cartao className="p-5 min-w-0">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--texto-3)] mb-4">
              Receita por hora
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dadosHora} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--acento-forte)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--acento-forte)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--linha-suave)" vertical={false} />
                <XAxis dataKey="hora" tick={tickStyle} {...axisProps} />
                <YAxis
                  tickFormatter={v => formatarMoeda(v).replace('R$ ', 'R$ ')}
                  tick={tickStyle}
                  {...axisProps}
                  width={64}
                />
                <Tooltip content={<TooltipMoeda />} />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="var(--acento-forte)"
                  strokeWidth={2}
                  fill="url(#gradReceita)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Cartao>

          <Cartao className="p-5 min-w-0">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--texto-3)] mb-4">
              Por forma de pagamento
            </h3>
            {dadosForma.length === 0 ? (
              <div className="h-[220px] grid place-items-center text-[13px] text-[var(--texto-3)]">
                Sem vendas hoje
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={dadosForma} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--linha-suave)" vertical={false} />
                  <XAxis dataKey="rotulo" tick={tickStyle} {...axisProps} />
                  <YAxis
                    tickFormatter={v => formatarMoeda(v).replace('R$ ', 'R$ ')}
                    tick={tickStyle}
                    {...axisProps}
                    width={64}
                  />
                  <Tooltip content={<TooltipMoeda />} />
                  <Bar dataKey="valor" fill="var(--acento-forte)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Cartao>
        </div>
      )}

      {!carregando && lista.length > 0 && (
        <Cartao className="overflow-hidden">
          <div className="p-5 pb-3 border-b border-[var(--linha-suave)]">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--texto-3)]">
              Últimas vendas do dia
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  {['Horário', 'Cliente', 'Forma', 'Total'].map(col => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)] font-medium"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...lista].reverse().slice(0, 8).map(v => (
                  <tr
                    key={v.id}
                    className="border-t border-[var(--linha-suave)] hover:bg-[var(--fundo-2)] transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-[12px] text-[var(--texto-2)]">
                      {formatarDataHora(v.dataVenda)}
                    </td>
                    <td className="px-5 py-3 text-[var(--texto-1)]">
                      {v.clienteNome ?? '-'}
                    </td>
                    <td className="px-5 py-3 text-[var(--texto-2)]">
                      {ROTULOS_FORMA[v.formaPagamento] ?? v.formaPagamento ?? '-'}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-[var(--texto-0)]">
                      {formatarMoeda(v.valorTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Cartao>
      )}

      {erro && (
        <Cartao className="p-5">
          <p className="text-[13px] text-[var(--negativo)]">
            Erro ao carregar dados do dia. Backend disponível? Verifique a conexão.
          </p>
        </Cartao>
      )}
    </div>
  )
}
