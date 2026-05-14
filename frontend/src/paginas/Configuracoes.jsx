import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import CabecalhoPagina from '@/componentes/ui/CabecalhoPagina'
import Cartao from '@/componentes/ui/Cartao'
import Botao from '@/componentes/ui/Botao'
import Chip from '@/componentes/ui/Chip'
import EstadoCarregando from '@/componentes/ui/EstadoCarregando'
import { useDadosApi } from '@/hooks/useDadosApi'
import cargosServico from '@/servicos/cargosServico'

const PERFIS = ['ADMIN', 'GERENTE', 'ATENDENTE', 'PADEIRO']

const VAZIO = {
  nome: '',
  descricao: '',
  perfilPadrao: 'ATENDENTE',
}

export default function Configurações() {
  const [form, setForm] = useState(VAZIO)
  const [editando, setEditando] = useState(null)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [salvando, setSalvando] = useState(false)
  const { dados, carregando, erro: erroListagem, recarregar } = useDadosApi(() => cargosServico.listarTodos())
  const cargos = dados ?? []

  function campo(chave, valor) {
    setForm(atual => ({ ...atual, [chave]: valor }))
  }

  function editar(cargo) {
    setEditando(cargo)
    setForm({
      nome: cargo.nome ?? '',
      descricao: cargo.descricao ?? '',
      perfilPadrao: cargo.perfilPadrao ?? 'ATENDENTE',
    })
  }

  function limpar() {
    setEditando(null)
    setForm(VAZIO)
    setErro('')
    setMensagem('')
  }

  async function salvar(evento) {
    evento.preventDefault()
    setErro('')
    setMensagem('')
    if (!form.nome.trim()) return setErro('Nome do cargo é obrigatório.')

    setSalvando(true)
    try {
      const payload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        perfilPadrao: form.perfilPadrao,
      }
      editando
        ? await cargosServico.atualizar(editando.id, payload)
        : await cargosServico.criar(payload)
      const mensagemSucesso = editando ? 'Cargo atualizado.' : 'Cargo criado.'
      limpar()
      setMensagem(mensagemSucesso)
      recarregar()
    } catch (err) {
      setErro(err?.response?.data?.mensagem ?? 'Erro ao salvar cargo.')
    } finally {
      setSalvando(false)
    }
  }

  async function alternarAtivo(cargo) {
    setErro('')
    setMensagem('')
    try {
      cargo.ativo
        ? await cargosServico.inativar(cargo.id)
        : await cargosServico.reativar(cargo.id)
      setMensagem(cargo.ativo ? `Cargo ${cargo.nome} inativado.` : `Cargo ${cargo.nome} reativado.`)
      recarregar()
    } catch (err) {
      setErro(err?.response?.data?.mensagem ?? 'Erro ao alterar status do cargo.')
    }
  }

  return (
    <div className="pagina-entrada p-7 flex flex-col gap-5 max-w-[1200px] mx-auto">
      <CabecalhoPagina
        titulo="Configurações"
        subtitulo="Parâmetros do sistema, cargos e regras de acesso"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4 items-start">
        <Cartao className="p-5">
          <form onSubmit={salvar} className="flex flex-col gap-4">
            <div>
              <h3 className="text-[15px] font-semibold text-[var(--texto-0)]">
                {editando ? 'Editar cargo' : 'Novo cargo'}
              </h3>
              <p className="text-[12px] text-[var(--texto-3)] mt-1">
                Cargo é a função da pessoa na padaria. Perfil é a permissão base no sistema.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Nome do cargo
              </label>
              <input
                className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)]"
                value={form.nome}
                onChange={evento => campo('nome', evento.target.value)}
                placeholder="Ex: Balconista"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Perfil padrão
              </label>
              <select
                className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)]"
                value={form.perfilPadrao}
                onChange={evento => campo('perfilPadrao', evento.target.value)}
              >
                {PERFIS.map(perfil => <option key={perfil} value={perfil}>{perfil}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Descrição
              </label>
              <textarea
                rows={3}
                className="px-3 py-2 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] resize-none"
                value={form.descricao}
                onChange={evento => campo('descricao', evento.target.value)}
                placeholder="Responsabilidades principais..."
              />
            </div>

            {erro && <p className="text-[12px] text-[var(--negativo)]">{erro}</p>}
            {mensagem && <p className="text-[12px] text-[var(--positivo)]">{mensagem}</p>}

            <div className="flex gap-2 justify-end">
              {editando && <Botao type="button" variante="fantasma" onClick={limpar}>Cancelar</Botao>}
              <Botao type="submit" variante="primario" disabled={salvando}>
                {editando ? <Save size={13} /> : <Plus size={13} />}
                {salvando ? 'Salvando...' : editando ? 'Salvar cargo' : 'Criar cargo'}
              </Botao>
            </div>
          </form>
        </Cartao>

        <Cartao className="p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--linha-suave)]">
            <h3 className="text-[15px] font-semibold text-[var(--texto-0)]">Cargos cadastrados</h3>
          </div>
          {carregando ? (
            <div className="p-5"><EstadoCarregando linhas={5} /></div>
          ) : erroListagem ? (
            <div className="p-5">
              <p className="text-[13px] text-[var(--negativo)]">
                Não foi possível carregar os cargos. Verifique se o backend foi reiniciado.
              </p>
            </div>
          ) : cargos.length === 0 ? (
            <div className="p-5">
              <p className="text-[13px] text-[var(--texto-3)]">
                Nenhum cargo cadastrado ainda.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--linha-suave)]">
              {cargos.map(cargo => (
                <div key={cargo.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[var(--texto-0)] break-all">{cargo.nome}</span>
                      <Chip variante={cargo.ativo ? 'ok' : 'mudo'}>{cargo.ativo ? 'Ativo' : 'Inativo'}</Chip>
                      <Chip variante="info">{cargo.perfilPadrao}</Chip>
                    </div>
                    {cargo.descricao && (
                      <p className="text-[12px] text-[var(--texto-3)] mt-1">{cargo.descricao}</p>
                    )}
                  </div>
                  <div className="flex w-full sm:w-auto gap-2">
                    <Botao tamanho="sm" variante="secundario" className="flex-1 sm:flex-none" onClick={() => editar(cargo)}>Editar</Botao>
                    <Botao tamanho="sm" variante="secundario" className="flex-1 sm:flex-none" onClick={() => alternarAtivo(cargo)}>
                      {cargo.ativo ? 'Inativar' : 'Reativar'}
                    </Botao>
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

