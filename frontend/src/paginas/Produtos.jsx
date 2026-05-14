import { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Pencil, AlertTriangle, PackagePlus, Tags } from 'lucide-react'
import CabecalhoPagina from '@/componentes/ui/CabecalhoPagina'
import Chip from '@/componentes/ui/Chip'
import Campo from '@/componentes/ui/Campo'
import Botao from '@/componentes/ui/Botao'
import Paginador from '@/componentes/ui/Paginador'
import EstadoCarregando from '@/componentes/ui/EstadoCarregando'
import EstadoVazio from '@/componentes/ui/EstadoVazio'
import Cartao from '@/componentes/ui/Cartao'
import ModalProduto from '@/componentes/modais/ModalProduto'
import ModalCategorias from '@/componentes/modais/ModalCategorias'
import ModalAjusteEstoque from '@/componentes/modais/ModalAjusteEstoque'
import { useDadosApi } from '@/hooks/useDadosApi'
import { useAuth } from '@/contextos/AuthContexto'
import produtosServico from '@/servicos/produtosServico'
import categoriaServico from '@/servicos/categoriaServico'
import { formatarMoeda } from '@/utilitarios/formatadores'

const POR_PAGINA = 15

export default function Produtos() {
  const [busca, setBusca] = useState('')
  const [catFiltro, setCatFiltro] = useState(null)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroEstoque, setFiltroEstoque] = useState('todos')
  const [ordenacao, setOrdenacao] = useState('nome-asc')
  const [pagina, setPagina] = useState(1)
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState(null)
  const [modalCategorias, setModalCategorias] = useState(false)
  const [produtoAjuste, setProdutoAjuste] = useState(null)
  const [categorias, setCategorias] = useState([])
  const { temPermissao } = useAuth()
  const podeGerenciar = temPermissao(['ADMIN', 'GERENTE'])

  const { dados, carregando, erro, recarregar } = useDadosApi(() => produtosServico.listarTodos())

  function carregarCategorias() {
    categoriaServico.listar()
      .then(r => setCategorias(r.data ?? []))
      .catch(() => {})
  }

  useEffect(() => {
    carregarCategorias()
  }, [])

  const lista = useMemo(() => dados ?? [], [dados])

  const filtrados = useMemo(() => {
    let base = lista

    if (catFiltro !== null) {
      base = base.filter(p => p.categoriaId === catFiltro)
    }

    if (filtroStatus !== 'todos') {
      base = base.filter(p => filtroStatus === 'ativos' ? p.ativo : !p.ativo)
    }

    if (filtroEstoque !== 'todos') {
      base = base.filter(p => {
        const estoque = Number(p.quantidadeEstoque ?? 0)
        if (filtroEstoque === 'abaixo-minimo') return p.abaixoDoMinimo
        if (filtroEstoque === 'sem-estoque') return estoque <= 0
        return estoque > 0
      })
    }

    if (busca.trim()) {
      const q = busca.toLowerCase()
      base = base.filter(p =>
        p.nome?.toLowerCase().includes(q) ||
        p.codigoBarras?.includes(busca),
      )
    }

    return [...base].sort((a, b) => {
      if (ordenacao === 'nome-desc') return (b.nome ?? '').localeCompare(a.nome ?? '')
      if (ordenacao === 'preco-desc') return Number(b.precoUnitario ?? 0) - Number(a.precoUnitario ?? 0)
      if (ordenacao === 'preco-asc') return Number(a.precoUnitario ?? 0) - Number(b.precoUnitario ?? 0)
      if (ordenacao === 'estoque-desc') return Number(b.quantidadeEstoque ?? 0) - Number(a.quantidadeEstoque ?? 0)
      if (ordenacao === 'estoque-asc') return Number(a.quantidadeEstoque ?? 0) - Number(b.quantidadeEstoque ?? 0)
      return (a.nome ?? '').localeCompare(b.nome ?? '')
    })
  }, [lista, busca, catFiltro, filtroStatus, filtroEstoque, ordenacao])

  const total = filtrados.length
  const paginaDados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)
  const totalAbaixoMinimo = lista.filter(p => p.abaixoDoMinimo).length
  const totalAtivos = lista.filter(p => p.ativo).length
  const totalInativos = lista.filter(p => !p.ativo).length

  function alterarFiltro(setter, valor) {
    setter(valor)
    setPagina(1)
  }

  function abrirNovo() {
    setProdutoEditando(null)
    setModalAberto(true)
  }

  function abrirEdicao(produto) {
    setProdutoEditando(produto)
    setModalAberto(true)
  }

  return (
    <div className="pagina-entrada p-7 flex flex-col gap-5">
      <CabecalhoPagina
        titulo="Produtos"
        subtitulo={total > 0 ? `${total} produtos encontrados` : undefined}
        acoes={
          <div className="flex items-center gap-2">
            {totalAbaixoMinimo > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[oklch(0.75_0.15_55/0.12)] border border-[oklch(0.75_0.15_55/0.3)] text-[12px] font-medium text-[oklch(0.55_0.15_55)]">
                <AlertTriangle size={13} />
                {totalAbaixoMinimo} abaixo do mínimo
              </div>
            )}
            {podeGerenciar && (
              <Botao variante="secundario" onClick={() => setModalCategorias(true)}>
                <Tags size={13} />
                Categorias
              </Botao>
            )}
            <Botao variante="primario" onClick={abrirNovo}>
              <Plus size={13} />
              Novo produto
            </Botao>
          </div>
        }
      />

      {categorias.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => alterarFiltro(setCatFiltro, null)}
            className={[
              'text-[12.5px] px-4 py-1.5 rounded-full border font-medium transition-all duration-160',
              catFiltro === null
                ? 'bg-[var(--acento-suave)] border-musgo-400 text-[var(--texto-0)] shadow-[0_0_0_1px_oklch(0.48_0.07_145/0.3)]'
                : 'border-[var(--linha-suave)] text-[var(--texto-1)] hover:border-musgo-400 hover:text-[var(--texto-0)]',
            ].join(' ')}
          >
            Todas
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => alterarFiltro(setCatFiltro, cat.id)}
              className={[
                'text-[12.5px] px-4 py-1.5 rounded-full border font-medium transition-all duration-160',
                catFiltro === cat.id
                  ? 'bg-[var(--acento-suave)] border-musgo-400 text-[var(--texto-0)] shadow-[0_0_0_1px_oklch(0.48_0.07_145/0.3)]'
                  : 'border-[var(--linha-suave)] text-[var(--texto-1)] hover:border-musgo-400 hover:text-[var(--texto-0)]',
              ].join(' ')}
            >
              {cat.nome}
            </button>
          ))}
        </div>
      )}

      <Campo
        icone={Search}
        placeholder="Buscar por nome ou codigo de barras..."
        value={busca}
        onChange={e => alterarFiltro(setBusca, e.target.value)}
      />

      <div className="grid gap-2 md:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
            Status do produto
          </label>
          <select
            className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none"
            value={filtroStatus}
            onChange={e => alterarFiltro(setFiltroStatus, e.target.value)}
          >
            <option value="todos">Todos os status ({lista.length})</option>
            <option value="ativos">Ativos ({totalAtivos})</option>
            <option value="inativos">Inativos ({totalInativos})</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
            Estoque
          </label>
          <select
            className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none"
            value={filtroEstoque}
            onChange={e => alterarFiltro(setFiltroEstoque, e.target.value)}
          >
            <option value="todos">Todos os estoques</option>
            <option value="abaixo-minimo">Abaixo do mínimo</option>
            <option value="sem-estoque">Sem estoque</option>
            <option value="com-estoque">Com estoque</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
            Ordenação
          </label>
          <select
            className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none"
            value={ordenacao}
            onChange={e => alterarFiltro(setOrdenacao, e.target.value)}
          >
            <option value="nome-asc">Nome A-Z</option>
            <option value="nome-desc">Nome Z-A</option>
            <option value="preco-desc">Maior preço</option>
            <option value="preco-asc">Menor preço</option>
            <option value="estoque-desc">Maior estoque</option>
            <option value="estoque-asc">Menor estoque</option>
          </select>
        </div>
      </div>

      {carregando && <EstadoCarregando linhas={8} />}

      {!carregando && !erro && filtrados.length === 0 && (
        <EstadoVazio
          mensagem={
            busca || catFiltro !== null || filtroStatus !== 'todos' || filtroEstoque !== 'todos'
              ? 'Nenhum produto encontrado para esses filtros.'
              : 'Nenhum produto cadastrado ainda.'
          }
        />
      )}

      {!carregando && filtrados.length > 0 && (
        <Cartao className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr>
                  {['Produto', 'Categoria', 'Código de barras', 'Estoque', 'Preço', 'Status', 'Ações'].map((col, i) => (
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
                {paginaDados.map(p => (
                  <tr
                    key={p.id}
                    className={[
                      'border-b border-[var(--linha-suave)] last:border-0 hover:bg-[var(--fundo-2)] transition-colors',
                      !p.ativo ? 'opacity-70' : '',
                    ].join(' ')}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className={[
                          'text-[var(--texto-0)] font-medium',
                          !p.ativo ? 'line-through decoration-[var(--texto-3)]' : '',
                        ].join(' ')}>
                          {p.nome}
                        </span>
                        {p.abaixoDoMinimo && (
                          <span title="Estoque abaixo do mínimo">
                            <AlertTriangle size={13} className="text-[oklch(0.65_0.18_55)]" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[var(--texto-2)]">
                      {p.categoriaNome ?? <span className="text-[var(--texto-3)]">-</span>}
                    </td>
                    <td className="px-5 py-3 font-mono text-[12px] text-[var(--texto-2)]">
                      {p.codigoBarras ?? '-'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={[
                        'font-mono text-[12px]',
                        p.abaixoDoMinimo ? 'font-semibold text-[oklch(0.55_0.15_55)]' : 'text-[var(--texto-2)]',
                      ].join(' ')}>
                        {Number(p.quantidadeEstoque ?? 0).toFixed(0)}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-[var(--texto-0)]">
                      {formatarMoeda(p.precoUnitario)}
                    </td>
                    <td className="px-5 py-3">
                      <Chip variante={p.ativo ? 'ok' : 'mudo'}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </Chip>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {podeGerenciar && (
                          <button
                            onClick={() => setProdutoAjuste(p)}
                            className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[var(--fundo-3)] text-[var(--texto-3)] hover:text-[var(--acento)] transition-colors"
                            title="Ajustar estoque"
                          >
                            <PackagePlus size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => abrirEdicao(p)}
                          className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[var(--fundo-3)] text-[var(--texto-3)] hover:text-[var(--texto-0)] transition-colors"
                          title="Editar produto"
                        >
                          <Pencil size={13} />
                        </button>
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
            Erro ao carregar produtos. Verifique a conexão com o backend.
          </p>
        </Cartao>
      )}

      <ModalProduto
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        produto={produtoEditando}
        onSalvo={recarregar}
      />
      <ModalCategorias
        aberto={modalCategorias}
        onFechar={() => setModalCategorias(false)}
        onAlterado={carregarCategorias}
      />
      <ModalAjusteEstoque
        produto={produtoAjuste}
        onFechar={() => setProdutoAjuste(null)}
        onSalvo={recarregar}
      />
    </div>
  )
}

