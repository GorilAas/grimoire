import { useEffect, useState } from 'react'
import { RotateCcw, UserRound, UserX, X } from 'lucide-react'
import Botao from '@/componentes/ui/Botao'
import clientesServico from '@/servicos/clientesServico'
import { mascaraInputCpf, mascaraInputTelefone } from '@/utilitarios/formatadores'

const FORMULARIO_VAZIO = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  endereco: '',
}

export default function ModalCliente({ aberto, cliente, onFechar, onSalvo }) {
  const [form, setForm] = useState(FORMULARIO_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [alterandoStatus, setAlterandoStatus] = useState(false)
  const [erro, setErro] = useState('')

  const editando = Boolean(cliente)

  useEffect(() => {
    if (!aberto) return
    setErro('')
    setForm(cliente ? {
      nome: cliente.nome ?? '',
      cpf: cliente.cpf ?? '',
      telefone: cliente.telefone ?? '',
      email: cliente.email ?? '',
      endereco: cliente.endereco ?? '',
    } : FORMULARIO_VAZIO)
  }, [aberto, cliente])

  function alterarCampo(campo, valor) {
    setForm(atual => ({ ...atual, [campo]: valor }))
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')

    if (!form.nome.trim()) return setErro('Nome é obrigatório.')
    if (form.cpf.replace(/\D/g, '').length !== 11) return setErro('CPF deve estar no formato 000.000.000-00.')

    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf,
      telefone: form.telefone.trim() || null,
      email: form.email.trim() || null,
      endereco: form.endereco.trim() || null,
    }

    setSalvando(true)
    try {
      if (editando) {
        await clientesServico.atualizar(cliente.id, payload)
      } else {
        await clientesServico.criar(payload)
      }
      onSalvo?.()
      onFechar()
    } catch (err) {
      setErro(err?.response?.data?.mensagem ?? 'Erro ao salvar cliente.')
    } finally {
      setSalvando(false)
    }
  }

  async function alterarStatus() {
    if (!editando || alterandoStatus) return

    setErro('')

    if (cliente.ativo) {
      const confirmou = window.confirm(`Deseja realmente inativar o cliente "${cliente.nome}"?`)
      if (!confirmou) return
    }

    setAlterandoStatus(true)
    try {
      cliente.ativo
        ? await clientesServico.inativar(cliente.id)
        : await clientesServico.reativar(cliente.id)
      onSalvo?.()
      onFechar()
    } catch (err) {
      setErro(err?.response?.data?.mensagem ?? 'Erro ao alterar status do cliente.')
    } finally {
      setAlterandoStatus(false)
    }
  }

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0 0 0 / 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onFechar()}
    >
      <div
        className="w-full max-w-[520px] rounded-[16px] border border-[var(--linha-suave)] shadow-[var(--sombra-md)] p-6 flex flex-col gap-5"
        style={{ background: 'var(--fundo-1)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserRound size={16} className="text-[var(--acento)]" />
            <div>
              <h2 className="text-[16px] font-semibold text-[var(--texto-0)]">
                {editando ? 'Editar cliente' : 'Novo cliente'}
              </h2>
              <p className="text-[12px] text-[var(--texto-3)]">
                {editando ? `Editando: ${cliente.nome}` : 'Cadastre os dados do cliente'}
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--fundo-2)] text-[var(--texto-2)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={salvar} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Nome *</label>
              <input
                className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors"
                value={form.nome}
                onChange={e => alterarCampo('nome', e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">CPF *</label>
              <input
                className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors"
                value={form.cpf}
                onChange={e => alterarCampo('cpf', mascaraInputCpf(e.target.value))}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Telefone</label>
              <input
                className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors"
                value={form.telefone}
                onChange={e => alterarCampo('telefone', mascaraInputTelefone(e.target.value))}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">E-mail</label>
              <input
                type="email"
                className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors"
                value={form.email}
                onChange={e => alterarCampo('email', e.target.value)}
                placeholder="cliente@email.com"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">Endereço</label>
              <textarea
                rows={2}
                className="px-3 py-2 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)] transition-colors resize-none"
                value={form.endereco}
                onChange={e => alterarCampo('endereco', e.target.value)}
              />
            </div>
          </div>

          {erro && (
            <p className="text-[12px] text-[var(--negativo)] bg-[var(--fundo-2)] px-3 py-2 rounded-[8px] border border-[var(--negativo)]/30">
              {erro}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            {editando ? (
              <button
                type="button"
                onClick={alterarStatus}
                disabled={alterandoStatus || salvando}
                className={[
                  'h-9 px-3 inline-flex items-center justify-center gap-2 rounded-[8px] border text-[12.5px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed',
                  cliente.ativo
                    ? 'border-[var(--negativo)]/35 text-[var(--negativo)] hover:bg-[var(--negativo)]/10'
                    : 'border-[var(--acento)]/40 text-[var(--acento)] hover:bg-[var(--acento-suave)]',
                ].join(' ')}
              >
                {cliente.ativo ? <UserX size={13} /> : <RotateCcw size={13} />}
                {alterandoStatus
                  ? 'Alterando...'
                  : cliente.ativo
                    ? 'Inativar cliente'
                    : 'Reativar cliente'}
              </button>
            ) : (
              <span />
            )}

            <div className="flex justify-end gap-2">
            <Botao variante="fantasma" type="button" onClick={onFechar} disabled={salvando || alterandoStatus}>Cancelar</Botao>
            <Botao variante="primario" type="submit" disabled={salvando || alterandoStatus}>
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar cliente'}
            </Botao>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
