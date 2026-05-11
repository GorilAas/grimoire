import { useEffect, useState } from 'react'
import { Pencil, Tags, Trash2, X } from 'lucide-react'
import Botao from '@/componentes/ui/Botao'
import categoriaServico from '@/servicos/categoriaServico'

export default function ModalCategorias({ aberto, onFechar, onAlterado }) {
  const [categorias, setCategorias] = useState([])
  const [nome, setNome] = useState('')
  const [editando, setEditando] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function carregar() {
    const res = await categoriaServico.listar()
    setCategorias(res.data ?? [])
  }

  useEffect(() => {
    if (!aberto) return
    setNome('')
    setEditando(null)
    setErro('')
    setSucesso('')
    carregar().catch(() => setErro('Erro ao carregar categorias.'))
  }, [aberto])

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    if (!nome.trim()) return setErro('Nome da categoria e obrigatorio.')

    setSalvando(true)
    try {
      if (editando) {
        await categoriaServico.atualizar(editando.id, nome.trim())
      } else {
        await categoriaServico.criar(nome.trim())
      }
      const mensagem = editando ? 'Categoria atualizada.' : 'Categoria criada.'
      setNome('')
      setEditando(null)
      await carregar()
      onAlterado?.()
      setSucesso(mensagem)
    } catch (err) {
      setErro(err?.response?.data?.mensagem ?? 'Erro ao salvar categoria.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir(categoria) {
    setErro('')
    setSucesso('')
    setSalvando(true)
    try {
      await categoriaServico.excluir(categoria.id)
      await carregar()
      onAlterado?.()
      setSucesso(`Categoria "${categoria.nome}" excluida.`)
    } catch (err) {
      setErro(err?.response?.data?.mensagem ?? 'Erro ao excluir categoria.')
    } finally {
      setSalvando(false)
    }
  }

  function iniciarEdicao(categoria) {
    setEditando(categoria)
    setNome(categoria.nome)
    setErro('')
    setSucesso('')
  }

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onFechar()}
    >
      <div
        className="w-full max-w-[460px] rounded-[16px] border border-[var(--linha-suave)] shadow-[var(--sombra-md)] p-6 flex flex-col gap-5"
        style={{ background: 'var(--fundo-1)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Tags size={16} className="text-[var(--acento)]" />
            <div>
              <h2 className="text-[16px] font-semibold text-[var(--texto-0)]">Categorias</h2>
              <p className="text-[12px] text-[var(--texto-3)]">Organize os produtos por grupos</p>
            </div>
          </div>
          <button onClick={onFechar} className="w-8 h-8 grid place-items-center rounded-full hover:bg-[var(--fundo-2)] text-[var(--texto-2)]">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={salvar} className="flex gap-2">
          <input
            className="flex-1 h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome da categoria"
          />
          <Botao variante="primario" type="submit" disabled={salvando}>
            {editando ? 'Salvar' : 'Criar'}
          </Botao>
        </form>

        {erro && (
          <p className="text-[12px] text-[var(--negativo)] bg-[var(--fundo-2)] px-3 py-2 rounded-[8px] border border-[var(--negativo)]/30">
            {erro}
          </p>
        )}
        {sucesso && (
          <p className="text-[12px] text-[var(--positivo)] bg-[var(--fundo-2)] px-3 py-2 rounded-[8px] border border-[var(--positivo)]/30">
            {sucesso}
          </p>
        )}

        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto">
          {categorias.map(categoria => (
            <div
              key={categoria.id}
              className="flex items-center gap-2 px-3 py-2 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)]"
            >
              <span className="flex-1 text-[13px] text-[var(--texto-0)]">{categoria.nome}</span>
              <button
                type="button"
                onClick={() => iniciarEdicao(categoria)}
                className="w-7 h-7 grid place-items-center rounded-[6px] text-[var(--texto-3)] hover:text-[var(--acento)] hover:bg-[var(--fundo-3)]"
                title="Editar categoria"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => excluir(categoria)}
                className="w-7 h-7 grid place-items-center rounded-[6px] text-[var(--texto-3)] hover:text-[var(--negativo)] hover:bg-[var(--fundo-3)]"
                title="Excluir categoria"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {categorias.length === 0 && (
            <p className="py-8 text-center text-[13px] text-[var(--texto-3)]">Nenhuma categoria cadastrada.</p>
          )}
        </div>
      </div>
    </div>
  )
}
