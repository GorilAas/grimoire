import { useState, useEffect } from 'react'
import { X, UserPlus, Pencil } from 'lucide-react'
import Botao from '@/componentes/ui/Botao'
import funcionariosServico from '@/servicos/funcionariosServico'
import cargosServico from '@/servicos/cargosServico'
import { mascaraInputTelefone } from '@/utilitarios/formatadores'

const CAMPO = 'w-full px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-[var(--texto-0)] bg-[var(--fundo-3)] border border-[var(--linha-suave)] outline-none transition-all placeholder:text-[var(--texto-3)] focus:border-[var(--acento)] focus:ring-2 focus:ring-[oklch(0.48_0.07_145/0.2)]'

export default function ModalFuncionario({ aberto, funcionario, onFechar, onSalvo }) {
  const ehEdicao = Boolean(funcionario)

  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('ATENDENTE')
  const [telefone, setTelefone] = useState('')
  const [dataAdmissao, setDataAdmissao] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [cargaHorariaDiaria, setCargaHorariaDiaria] = useState('8')
  const [cargos, setCargos] = useState([])
  const [carregandoCargos, setCarregandoCargos] = useState(false)
  const [erroCargos, setErroCargos] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!aberto) return
    setCarregandoCargos(true)
    setErroCargos('')
    cargosServico.listarAtivos()
      .then(r => setCargos(r.data ?? []))
      .catch(() => {
        setCargos([])
        setErroCargos('Não foi possível carregar os cargos cadastrados.')
      })
      .finally(() => setCarregandoCargos(false))
  }, [aberto])

  useEffect(() => {
    if (!aberto) return
    setErro('')
    setSalvando(false)
    if (funcionario) {
      setNome(funcionario.nome ?? '')
      setCargo(funcionario.cargo ?? 'ATENDENTE')
      setTelefone(funcionario.telefone ?? '')
      setDataAdmissao(funcionario.dataAdmissao ?? '')
      setDataNascimento(funcionario.dataNascimento ?? '')
      setCargaHorariaDiaria(String(funcionario.cargaHorariaDiaria ?? 8))
    } else {
      setNome('')
      setCargo('ATENDENTE')
      setTelefone('')
      setDataAdmissao(new Date().toISOString().split('T')[0])
      setDataNascimento('')
      setCargaHorariaDiaria('8')
    }
  }, [aberto, funcionario])

  useEffect(() => {
    if (!ehEdicao && cargos.length > 0 && !cargos.some(item => item.nome === cargo)) {
      setCargo(cargos[0].nome)
    }
  }, [cargos, cargo, ehEdicao])

  async function salvar(e) {
    e.preventDefault()
    setErro('')

    if (!nome.trim()) return setErro('O nome é obrigatório.')
    if (cargos.length === 0) return setErro('Cadastre cargos no banco antes de criar funcionários.')
    if (!cargo) return setErro('Selecione um cargo.')
    if (!dataAdmissao) return setErro('Data de admissão é obrigatória.')
    const carga = parseFloat(cargaHorariaDiaria)
    if (Number.isNaN(carga) || carga < 1 || carga > 12) {
      return setErro('Carga horária deve ser entre 1 e 12 horas.')
    }

    const dados = {
      nome: nome.trim(),
      cargo,
      telefone: telefone.replace(/\D/g, '') || null,
      dataAdmissao,
      dataNascimento: dataNascimento || null,
      cargaHorariaDiaria: carga,
    }

    setSalvando(true)
    try {
      ehEdicao
        ? await funcionariosServico.atualizar(funcionario.id, dados)
        : await funcionariosServico.criar(dados)
      onSalvo?.()
      onFechar()
    } catch (err) {
      const msg = err?.response?.data?.mensagem
        || err?.response?.data?.message
        || err?.mensagemAmigavel
        || 'Erro ao salvar funcionário.'
      setErro(String(msg))
    } finally {
      setSalvando(false)
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
        className="w-full max-w-[520px] rounded-[18px] border border-[var(--linha-suave)] shadow-[var(--sombra-md)] overflow-hidden"
        style={{ background: 'var(--fundo-1)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--linha-suave)]">
          <div className="flex items-center gap-2.5">
            {ehEdicao ? <Pencil size={16} className="text-[var(--acento)]" /> : <UserPlus size={16} className="text-[var(--acento)]" />}
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--texto-0)]">
                {ehEdicao ? 'Editar funcionário' : 'Novo funcionário'}
              </h2>
              {ehEdicao && <p className="text-[11px] text-[var(--texto-3)] mt-0.5">{funcionario.nome}</p>}
            </div>
          </div>
          <button onClick={onFechar} className="text-[var(--texto-2)] hover:text-[var(--texto-0)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={salvar} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
              Nome completo *
            </label>
            <input className={CAMPO} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ana Souza" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Cargo *
              </label>
              <select className={CAMPO} value={cargo} onChange={e => setCargo(e.target.value)}>
                {carregandoCargos && <option value="">Carregando cargos...</option>}
                {!carregandoCargos && cargos.length === 0 && <option value="">Nenhum cargo encontrado</option>}
                {cargos.map(item => (
                  <option key={item.id} value={item.nome}>{item.nome}</option>
                ))}
              </select>
              {erroCargos && (
                <span className="text-[11.5px] text-[var(--negativo)]">
                  {erroCargos}
                </span>
              )}
              {!erroCargos && !carregandoCargos && cargos.length === 0 && (
                <span className="text-[11.5px] text-[var(--texto-3)]">
                  Cadastre ou reative um cargo em Configurações.
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Data de admissão *
              </label>
              <input
                type="date"
                className={CAMPO}
                value={dataAdmissao}
                onChange={e => setDataAdmissao(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Telefone
              </label>
              <input className={CAMPO} value={telefone} onChange={e => setTelefone(mascaraInputTelefone(e.target.value))} placeholder="(11) 99999-9999" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Data de nascimento
              </label>
              <input
                type="date"
                className={CAMPO}
                value={dataNascimento}
                onChange={e => setDataNascimento(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
              Carga horária diária (horas)
            </label>
            <input type="number" min="1" max="12" step="0.5" className={CAMPO} value={cargaHorariaDiaria} onChange={e => setCargaHorariaDiaria(e.target.value)} />
          </div>

          {erro && (
            <p className="text-[12px] text-[var(--negativo)] bg-[oklch(0.65_0.18_28/0.08)] px-3 py-2 rounded-[8px] border border-[oklch(0.65_0.18_28/0.25)]">
              {erro}
            </p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Botao variante="fantasma" type="button" onClick={onFechar} disabled={salvando}>Cancelar</Botao>
            <Botao variante="primario" type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : ehEdicao ? 'Salvar alterações' : 'Criar funcionário'}
            </Botao>
          </div>
        </form>
      </div>
    </div>
  )
}
