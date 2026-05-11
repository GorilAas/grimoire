import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Eye, Plus, Search } from 'lucide-react'
import CabecalhoPagina from '@/componentes/ui/CabecalhoPagina'
import Chip from '@/componentes/ui/Chip'
import Campo from '@/componentes/ui/Campo'
import Botao from '@/componentes/ui/Botao'
import Cartao from '@/componentes/ui/Cartao'
import Paginador from '@/componentes/ui/Paginador'
import EstadoCarregando from '@/componentes/ui/EstadoCarregando'
import EstadoVazio from '@/componentes/ui/EstadoVazio'
import ModalVenda from '@/componentes/modais/ModalVenda'
import { useDadosApi } from '@/hooks/useDadosApi'
import { useAuth } from '@/contextos/AuthContexto'
import vendasServico from '@/servicos/vendasServico'
import { formatarMoeda, formatarDataHora } from '@/utilitarios/formatadores'

const ROTULOS_FORMA = {
  DINHEIRO: 'Dinheiro',
  DEBITO: 'Debito',
  CREDITO: 'Credito',
  PIX: 'PIX',
  FIADO: 'Fiado',
}

const POR_PAGINA = 20

const ABAS = [
  { id: 'todas', rotulo: 'Todas as vendas' },
  { id: 'fiado', rotulo: 'Fiado em aberto' },
]

function dataVendaDia(venda) {
  return venda.dataVenda ? String(venda.dataVenda).slice(0, 10) : ''
}

export default function Vendas() {
  const [aba, setAba] = useState('todas')
  const [busca, setBusca] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtroForma, setFiltroForma] = useState('todas')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [ordenacao, setOrdenacao] = useState('data-desc')
  const [pagina, setPagina] = useState(1)
  const [pagandoId, setPagandoId] = useState(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [vendaSelecionada, setVendaSelecionada] = useState(null)

  const { temPermissao } = useAuth()
  const podeGerenciar = temPermissao(['ADMIN', 'GERENTE'])

  const { dados: todas, carregando: cTodas, recarregar: recarregarTodas } = useDadosApi(
    () => vendasServico.listarTodas(),
  )
  const { dados: fiado, carregando: cFiado, recarregar: recarregarFiado } = useDadosApi(
    () => vendasServico.listarFiadoEmAberto(),
  )

  useEffect(() => {
    function abrirNovaVenda() {
      setVendaSelecionada(null)
      setModalAberto(true)
    }

    window.addEventListener('fresquim:nova-venda', abrirNovaVenda)
    return () => window.removeEventListener('fresquim:nova-venda', abrirNovaVenda)
  }, [])

  const listaBase = useMemo(
    () => aba === 'todas' ? (todas ?? []) : (fiado ?? []),
    [aba, todas, fiado],
  )
  const carregando = aba === 'todas' ? cTodas : cFiado

  const lista = useMemo(() => {
    let base = listaBase

    if (busca.trim()) {
      const termo = busca.toLowerCase()
      base = base.filter(v =>
        String(v.id).includes(termo) ||
        v.clienteNome?.toLowerCase().includes(termo) ||
        v.funcionarioNome?.toLowerCase().includes(termo),
      )
    }

    if (dataInicio) {
      base = base.filter(v => dataVendaDia(v) >= dataInicio)
    }

    if (dataFim) {
      base = base.filter(v => dataVendaDia(v) <= dataFim)
    }

    if (filtroForma !== 'todas') {
      base = base.filter(v => v.formaPagamento === filtroForma)
    }

    if (filtroStatus !== 'todos') {
      base = base.filter(v => {
        if (filtroStatus === 'canceladas') return v.status === 'CANCELADA'
        if (filtroStatus === 'fiado-pendente') return v.statusFiado === 'PENDENTE'
        if (filtroStatus === 'fiado-pago') return v.statusFiado === 'PAGO'
        return v.status !== 'CANCELADA'
      })
    }

    return [...base].sort((a, b) => {
      if (ordenacao === 'data-asc') return String(a.dataVenda ?? '').localeCompare(String(b.dataVenda ?? ''))
      if (ordenacao === 'valor-desc') return Number(b.valorTotal ?? 0) - Number(a.valorTotal ?? 0)
      if (ordenacao === 'valor-asc') return Number(a.valorTotal ?? 0) - Number(b.valorTotal ?? 0)
      if (ordenacao === 'cliente-asc') return (a.clienteNome ?? '').localeCompare(b.clienteNome ?? '')
      return String(b.dataVenda ?? '').localeCompare(String(a.dataVenda ?? ''))
    })
  }, [listaBase, busca, dataInicio, dataFim, filtroForma, filtroStatus, ordenacao])

  const total = lista.length
  const paginaDados = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  function alterarFiltro(setter, valor) {
    setter(valor)
    setPagina(1)
  }

  function recarregarTudo() {
    recarregarFiado()
    recarregarTodas()
  }

  function abrirNovaVenda() {
    setVendaSelecionada(null)
    setModalAberto(true)
  }

  function abrirVenda(venda) {
    setVendaSelecionada(venda)
    setModalAberto(true)
  }

  function trocarAba(novaAba) {
    setAba(novaAba)
    setPagina(1)
  }

  async function marcarPago(id) {
    setPagandoId(id)
    try {
      await vendasServico.marcarComoPago(id)
      recarregarTudo()
    } finally {
      setPagandoId(null)
    }
  }

  function chipStatus(v) {
    if (v.status === 'CANCELADA') return <Chip variante="erro">Cancelada</Chip>
    if (v.statusFiado === 'PENDENTE') return <Chip variante="alerta">Fiado</Chip>
    if (v.statusFiado === 'PAGO') return <Chip variante="mudo">Quitado</Chip>
    return <Chip variante="ok">Paga</Chip>
  }

  const colunasAba = ['Data/Hora', 'Cliente', 'Forma', 'Total', aba === 'fiado' ? 'Acao' : 'Status', '']

  return (
    <div className="pagina-entrada p-7 flex flex-col gap-5">
      <CabecalhoPagina
        titulo="Vendas"
        subtitulo={`${total} ${total === 1 ? 'registro' : 'registros'}`}
        acoes={
          <Botao variante="primario" onClick={abrirNovaVenda}>
            <Plus size={13} />
            Nova venda
          </Botao>
        }
      />

      <div
        className="flex gap-1 p-1 rounded-[10px] border border-[var(--linha-suave)] w-fit"
        style={{ background: 'var(--fundo-2)' }}
      >
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => trocarAba(a.id)}
            className={[
              'text-[12.5px] px-4 py-1.5 rounded-[7px] font-medium transition-all duration-160',
              aba === a.id
                ? 'bg-[var(--fundo-0)] text-[var(--texto-0)] shadow-sm border border-[var(--linha-suave)]'
                : 'text-[var(--texto-2)] hover:text-[var(--texto-0)]',
            ].join(' ')}
          >
            {a.rotulo}
            {a.id === 'fiado' && (fiado ?? []).length > 0 && (
              <span className="ml-1.5 font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--negativo)] text-white">
                {(fiado ?? []).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <Campo
        icone={Search}
        placeholder="Buscar por cliente, funcionario ou numero da venda..."
        value={busca}
        onChange={e => alterarFiltro(setBusca, e.target.value)}
      />

      <div className="grid gap-2 md:grid-cols-5">
        <label className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--texto-3)] shrink-0">
            Inicial
          </span>
          <input
            type="date"
            aria-label="Data inicial"
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[var(--texto-0)] outline-none"
            value={dataInicio}
            onChange={e => alterarFiltro(setDataInicio, e.target.value)}
          />
        </label>
        <label className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--texto-3)] shrink-0">
            Final
          </span>
          <input
            type="date"
            aria-label="Data final"
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-[var(--texto-0)] outline-none"
            value={dataFim}
            onChange={e => alterarFiltro(setDataFim, e.target.value)}
          />
        </label>
        <select
          className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none"
          value={filtroForma}
          onChange={e => alterarFiltro(setFiltroForma, e.target.value)}
        >
          <option value="todas">Todas as formas</option>
          {Object.entries(ROTULOS_FORMA).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>{rotulo}</option>
          ))}
        </select>
        <select
          className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none"
          value={filtroStatus}
          onChange={e => alterarFiltro(setFiltroStatus, e.target.value)}
        >
          <option value="todos">Todos os status</option>
          <option value="ativas">Ativas</option>
          <option value="canceladas">Canceladas</option>
          <option value="fiado-pendente">Fiado pendente</option>
          <option value="fiado-pago">Fiado quitado</option>
        </select>
        <select
          className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none"
          value={ordenacao}
          onChange={e => alterarFiltro(setOrdenacao, e.target.value)}
        >
          <option value="data-desc">Mais recentes</option>
          <option value="data-asc">Mais antigas</option>
          <option value="valor-desc">Maior valor</option>
          <option value="valor-asc">Menor valor</option>
          <option value="cliente-asc">Cliente A-Z</option>
        </select>
      </div>

      {carregando && <EstadoCarregando linhas={8} />}

      <ModalVenda
        aberto={modalAberto}
        venda={vendaSelecionada}
        podeCancelar={podeGerenciar}
        onFechar={() => setModalAberto(false)}
        onSalvo={recarregarTudo}
        onCancelada={recarregarTudo}
      />

      {!carregando && lista.length === 0 && (
        <EstadoVazio
          mensagem={
            aba === 'fiado'
              ? 'Nenhuma venda em fiado em aberto para esses filtros.'
              : 'Nenhuma venda encontrada para esses filtros.'
          }
        />
      )}

      {!carregando && lista.length > 0 && (
        <Cartao className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  {colunasAba.map((col, i) => (
                    <th
                      key={i}
                      className="px-5 py-3.5 text-left font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)] font-medium border-b border-[var(--linha-suave)]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginaDados.map(v => (
                  <tr
                    key={v.id}
                    onClick={() => abrirVenda(v)}
                    className={[
                      'border-b border-[var(--linha-suave)] last:border-0 hover:bg-[var(--fundo-2)] transition-colors cursor-pointer',
                      v.status === 'CANCELADA' ? 'opacity-50' : '',
                    ].join(' ')}
                  >
                    <td className="px-5 py-3 font-mono text-[12px] text-[var(--texto-2)]">
                      {formatarDataHora(v.dataVenda)}
                    </td>
                    <td className="px-5 py-3 text-[var(--texto-1)]">
                      {v.clienteNome ?? '-'}
                    </td>
                    <td className="px-5 py-3">
                      <Chip variante={v.statusFiado === 'PENDENTE' ? 'alerta' : 'mudo'}>
                        {ROTULOS_FORMA[v.formaPagamento] ?? v.formaPagamento ?? '-'}
                      </Chip>
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-[var(--texto-0)]">
                      {formatarMoeda(v.valorTotal)}
                    </td>
                    <td className="px-5 py-3">
                      {aba === 'fiado' && v.status !== 'CANCELADA' ? (
                        <Botao
                          variante="primario"
                          tamanho="sm"
                          onClick={e => {
                            e.stopPropagation()
                            marcarPago(v.id)
                          }}
                          disabled={pagandoId === v.id}
                        >
                          <CheckCircle2 size={12} />
                          {pagandoId === v.id ? 'Salvando...' : 'Marcar pago'}
                        </Botao>
                      ) : chipStatus(v)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          abrirVenda(v)
                        }}
                        title="Abrir venda"
                        className="w-7 h-7 inline-flex items-center justify-center rounded-[6px] hover:bg-[var(--fundo-3)] text-[var(--texto-3)] hover:text-[var(--texto-0)] transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > POR_PAGINA && (
            <div className="px-5 py-3 border-t border-[var(--linha-suave)]">
              <Paginador
                total={total}
                porPagina={POR_PAGINA}
                paginaAtual={pagina}
                onMudar={setPagina}
              />
            </div>
          )}
        </Cartao>
      )}
    </div>
  )
}
