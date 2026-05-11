import { useState, useMemo } from 'react'
import { Pencil, Plus, Search, History } from 'lucide-react'
import CabecalhoPagina from '@/componentes/ui/CabecalhoPagina'
import Chip from '@/componentes/ui/Chip'
import Campo from '@/componentes/ui/Campo'
import Botao from '@/componentes/ui/Botao'
import Paginador from '@/componentes/ui/Paginador'
import EstadoCarregando from '@/componentes/ui/EstadoCarregando'
import EstadoVazio from '@/componentes/ui/EstadoVazio'
import Avatar from '@/componentes/ui/Avatar'
import Cartao from '@/componentes/ui/Cartao'
import ModalComprasCliente from '@/componentes/modais/ModalComprasCliente'
import ModalCliente from '@/componentes/modais/ModalCliente'
import { useDadosApi } from '@/hooks/useDadosApi'
import { useAuth } from '@/contextos/AuthContexto'
import clientesServico from '@/servicos/clientesServico'
import { formatarMoeda, formatarCpf } from '@/utilitarios/formatadores'

const POR_PAGINA = 15

export default function Clientes() {
  const [busca, setBusca]                 = useState('')
  const [filtroStatus, setFiltroStatus]   = useState('todos')
  const [filtroFiado, setFiltroFiado]     = useState('todos')
  const [ordenacao, setOrdenacao]         = useState('nome-asc')
  const [pagina, setPagina]               = useState(1)
  const [clienteHistorico, setClienteHistorico] = useState(null)
  const [modalCliente, setModalCliente] = useState({ aberto: false, cliente: null })
  const { temPermissao } = useAuth()
  const podeEditar = temPermissao(['ADMIN', 'GERENTE', 'ATENDENTE'])
  const { dados, carregando, erro, recarregar } = useDadosApi(() => clientesServico.listarTodos())

  const lista = useMemo(() => dados ?? [], [dados])

  const filtrados = useMemo(() => {
    let base = lista

    if (filtroStatus !== 'todos') {
      base = base.filter(c => filtroStatus === 'ativos' ? c.ativo : !c.ativo)
    }

    if (filtroFiado !== 'todos') {
      base = base.filter(c => {
        const deve = Number(c.saldoDevedor ?? 0) > 0
        return filtroFiado === 'com-fiado' ? deve : !deve
      })
    }

    const q = busca.toLowerCase()
    const cpfQ = busca.replace(/\D/g, '')
    if (busca.trim()) {
      base = base.filter(c =>
        c.nome?.toLowerCase().includes(q) ||
        (cpfQ && c.cpf?.replace(/\D/g, '').includes(cpfQ)),
      )
    }

    return [...base].sort((a, b) => {
      if (ordenacao === 'nome-desc') return (b.nome ?? '').localeCompare(a.nome ?? '')
      if (ordenacao === 'saldo-desc') return Number(b.saldoDevedor ?? 0) - Number(a.saldoDevedor ?? 0)
      if (ordenacao === 'saldo-asc') return Number(a.saldoDevedor ?? 0) - Number(b.saldoDevedor ?? 0)
      return (a.nome ?? '').localeCompare(b.nome ?? '')
    })
  }, [lista, busca, filtroStatus, filtroFiado, ordenacao])

  const total = filtrados.length
  const paginaDados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  function handleBusca(e) {
    setBusca(e.target.value)
    setPagina(1)
  }

  function alterarFiltro(setter, valor) {
    setter(valor)
    setPagina(1)
  }

  function abrirNovo() {
    setModalCliente({ aberto: true, cliente: null })
  }

  function abrirEdicao(cliente) {
    setModalCliente({ aberto: true, cliente })
  }

  return (
    <div className="pagina-entrada p-7 flex flex-col gap-5">
      <CabecalhoPagina
        titulo="Clientes"
        subtitulo={total > 0 ? `${total} clientes encontrados` : undefined}
        acoes={
          <Botao variante="primario" onClick={abrirNovo}>
            <Plus size={13} />
            Novo cliente
          </Botao>
        }
      />

      <Campo
        icone={Search}
        placeholder="Buscar por nome ou CPF..."
        value={busca}
        onChange={handleBusca}
      />

      <div className="grid gap-2 md:grid-cols-3">
        <select
          className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none"
          value={filtroStatus}
          onChange={e => alterarFiltro(setFiltroStatus, e.target.value)}
        >
          <option value="todos">Todos os status</option>
          <option value="ativos">Somente ativos</option>
          <option value="inativos">Somente inativos</option>
        </select>
        <select
          className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none"
          value={filtroFiado}
          onChange={e => alterarFiltro(setFiltroFiado, e.target.value)}
        >
          <option value="todos">Todos os saldos</option>
          <option value="com-fiado">Com saldo devedor</option>
          <option value="sem-fiado">Sem saldo devedor</option>
        </select>
        <select
          className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none"
          value={ordenacao}
          onChange={e => alterarFiltro(setOrdenacao, e.target.value)}
        >
          <option value="nome-asc">Nome A-Z</option>
          <option value="nome-desc">Nome Z-A</option>
          <option value="saldo-desc">Maior saldo devedor</option>
          <option value="saldo-asc">Menor saldo devedor</option>
        </select>
      </div>

      {carregando && <EstadoCarregando linhas={8} />}

      {!carregando && !erro && filtrados.length === 0 && (
        <EstadoVazio
          mensagem={
            busca
              ? 'Nenhum cliente encontrado para essa busca.'
              : 'Nenhum cliente cadastrado ainda.'
          }
        />
      )}

      {!carregando && filtrados.length > 0 && (
        <Cartao className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  {['Cliente', 'CPF', 'Saldo Devedor', 'Negativado', 'Status', 'Ações'].map((col, i) => (
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
                {paginaDados.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => setClienteHistorico(c)}
                    className="border-b border-[var(--linha-suave)] last:border-0 hover:bg-[var(--fundo-2)] transition-colors cursor-pointer"
                    title="Ver histórico de compras"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar nome={c.nome} />
                        <span className="text-[var(--texto-0)] font-medium">{c.nome}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-[12px] text-[var(--texto-2)]">
                      {formatarCpf(c.cpf)}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-[var(--texto-0)]">
                      {formatarMoeda(c.saldoDevedor)}
                    </td>
                    <td className="px-5 py-3">
                      <Chip variante={c.negativado ? 'erro' : 'ok'}>
                        {c.negativado ? 'Sim' : 'Não'}
                      </Chip>
                    </td>
                    <td className="px-5 py-3">
                      <Chip variante={c.ativo ? 'ok' : 'mudo'}>
                        {c.ativo ? 'Ativo' : 'Inativo'}
                      </Chip>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                      <button
                        onClick={e => { e.stopPropagation(); setClienteHistorico(c) }}
                        title="Histórico de compras"
                        className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[var(--fundo-3)] text-[var(--texto-3)] hover:text-[var(--acento)] transition-colors"
                      >
                        <History size={13} />
                      </button>
                      {podeEditar && (
                        <button
                          onClick={e => { e.stopPropagation(); abrirEdicao(c) }}
                          title="Editar cliente"
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[var(--fundo-3)] text-[var(--texto-3)] hover:text-[var(--texto-0)] transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                      )}
                      </div>
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

      {erro && (
        <Cartao className="p-5">
          <p className="text-[13px] text-[var(--negativo)]">
            Erro ao carregar clientes. Verifique a conexão com o backend.
          </p>
        </Cartao>
      )}

      <ModalComprasCliente
        cliente={clienteHistorico}
        onFechar={() => setClienteHistorico(null)}
      />

      <ModalCliente
        aberto={modalCliente.aberto}
        cliente={modalCliente.cliente}
        onFechar={() => setModalCliente({ aberto: false, cliente: null })}
        onSalvo={recarregar}
      />
    </div>
  )
}
