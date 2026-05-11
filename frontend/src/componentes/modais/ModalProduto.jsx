import { useState, useEffect } from 'react'
import { X, Package } from 'lucide-react'
import Botao from '@/componentes/ui/Botao'
import produtosServico from '@/servicos/produtosServico'
import categoriaServico from '@/servicos/categoriaServico'

const VAZIO = {
  nome: '',
  descricao: '',
  precoUnitario: '',
  precoCusto: '',
  codigoBarras: '',
  categoriaId: '',
  quantidadeEstoque: '0',
  estoqueMinimo: '0',
}

const CLASSE_CAMPO = 'h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors'

export default function ModalProduto({ aberto, onFechar, produto, onSalvo }) {
  const [form, setForm] = useState(VAZIO)
  const [categorias, setCategorias] = useState([])
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState(null)

  const editando = !!produto

  useEffect(() => {
    if (!aberto) return
    categoriaServico
      .listar()
      .then(r => setCategorias(r.data ?? []))
      .catch(() => setCategorias([]))
  }, [aberto])

  useEffect(() => {
    if (!aberto) return

    setErro(null)
    setForm(produto ? {
      nome: produto.nome ?? '',
      descricao: produto.descricao ?? '',
      precoUnitario: produto.precoUnitario ?? '',
      precoCusto: produto.precoCusto ?? '',
      codigoBarras: produto.codigoBarras ?? '',
      categoriaId: produto.categoriaId ?? '',
      quantidadeEstoque: produto.quantidadeEstoque ?? '0',
      estoqueMinimo: produto.estoqueMinimo ?? '0',
    } : VAZIO)
  }, [aberto, produto])

  const campo = (chave, valor) => setForm(atual => ({ ...atual, [chave]: valor }))

  async function salvar(evento) {
    evento.preventDefault()
    setErro(null)

    if (!form.nome.trim()) return setErro('Nome é obrigatório.')
    if (!form.precoUnitario || Number(form.precoUnitario) < 0) {
      return setErro('Preço de venda inválido.')
    }
    if (!editando && Number(form.quantidadeEstoque || 0) < 0) {
      return setErro('Estoque inicial não pode ser negativo.')
    }

    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      precoUnitario: Number(form.precoUnitario),
      precoCusto: form.precoCusto !== '' ? Number(form.precoCusto) : null,
      codigoBarras: form.codigoBarras.trim() || null,
      categoriaId: form.categoriaId !== '' ? Number(form.categoriaId) : null,
      estoqueMinimo: form.estoqueMinimo !== '' ? Number(form.estoqueMinimo) : 0,
      quantidadeEstoque: !editando && form.quantidadeEstoque !== ''
        ? Number(form.quantidadeEstoque)
        : null,
    }

    setSalvando(true)
    try {
      editando
        ? await produtosServico.atualizar(produto.id, payload)
        : await produtosServico.criar(payload)
      onSalvo?.()
      onFechar()
    } catch (err) {
      setErro(err?.response?.data?.mensagem ?? 'Erro ao salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={evento => evento.target === evento.currentTarget && onFechar()}
    >
      <div
        className="w-full max-w-lg rounded-[16px] border border-[var(--linha-suave)] shadow-[var(--sombra-md)] p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--fundo-1)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package size={16} className="text-[var(--acento)]" />
            <div>
              <h2 className="text-[16px] font-semibold text-[var(--texto-0)]">
                {editando ? 'Editar produto' : 'Novo produto'}
              </h2>
              <p className="text-[12px] text-[var(--texto-3)]">
                {editando ? `Editando: ${produto.nome}` : 'Preencha os dados do produto'}
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--fundo-2)] text-[var(--texto-2)] transition-colors"
            aria-label="Fechar modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={salvar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
              Nome *
            </label>
            <input
              className={CLASSE_CAMPO}
              placeholder="Ex: Pão Francês"
              value={form.nome}
              onChange={evento => campo('nome', evento.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
              Categoria
            </label>
            <select
              className={CLASSE_CAMPO}
              value={form.categoriaId}
              onChange={evento => campo('categoriaId', evento.target.value)}
            >
              <option value="">Sem categoria</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Preço de venda (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={CLASSE_CAMPO}
                placeholder="0,00"
                value={form.precoUnitario}
                onChange={evento => campo('precoUnitario', evento.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Preço de custo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={CLASSE_CAMPO}
                placeholder="0,00"
                value={form.precoCusto}
                onChange={evento => campo('precoCusto', evento.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                {editando ? 'Estoque atual' : 'Estoque inicial'}
              </label>
              <input
                type="number"
                step="1"
                min="0"
                disabled={editando}
                className={[
                  CLASSE_CAMPO,
                  editando ? 'opacity-70 cursor-not-allowed' : '',
                ].join(' ')}
                placeholder="0"
                value={form.quantidadeEstoque}
                onChange={evento => campo('quantidadeEstoque', evento.target.value)}
              />
              {editando && (
                <span className="text-[10.5px] text-[var(--texto-3)]">
                  Use ajuste de estoque para alterar.
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Estoque mínimo
              </label>
              <input
                type="number"
                step="1"
                min="0"
                className={CLASSE_CAMPO}
                placeholder="0"
                value={form.estoqueMinimo}
                onChange={evento => campo('estoqueMinimo', evento.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
              Código de barras
            </label>
            <input
              className={CLASSE_CAMPO}
              placeholder="Opcional"
              value={form.codigoBarras}
              onChange={evento => campo('codigoBarras', evento.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
              Descrição
            </label>
            <textarea
              rows={2}
              className="px-3 py-2 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors resize-none"
              placeholder="Descrição opcional..."
              value={form.descricao}
              onChange={evento => campo('descricao', evento.target.value)}
            />
          </div>

          {erro && (
            <p className="text-[12px] text-[var(--negativo)] bg-[var(--fundo-2)] px-3 py-2 rounded-[8px] border border-[var(--negativo)]/30">
              {erro}
            </p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Botao variante="fantasma" type="button" onClick={onFechar}>Cancelar</Botao>
            <Botao variante="primario" type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar produto'}
            </Botao>
          </div>
        </form>
      </div>
    </div>
  )
}

