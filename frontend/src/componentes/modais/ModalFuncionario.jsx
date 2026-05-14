import { useState, useEffect, useMemo } from 'react'
import { X, UserPlus, Pencil, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import Botao from '@/componentes/ui/Botao'
import funcionariosServico from '@/servicos/funcionariosServico'
import cargosServico from '@/servicos/cargosServico'
import authServico from '@/servicos/authServico'
import { TELAS_SISTEMA } from '@/configuracao/telasSistema'
import { mascaraInputTelefone } from '@/utilitarios/formatadores'

const CAMPO = 'w-full px-3.5 py-2.5 rounded-[10px] text-[13.5px] text-[var(--texto-0)] bg-[var(--fundo-3)] border border-[var(--linha-suave)] outline-none transition-all placeholder:text-[var(--texto-3)] focus:border-[var(--acento)] focus:ring-2 focus:ring-[oklch(0.48_0.07_145/0.2)]'
const ESTILO_CHECKBOX = { accentColor: 'oklch(0.62 0.1 145)' }

function perfilPadraoDoCargo(cargo, cargos = []) {
  const cargoCadastrado = cargos.find(item => item.nome === cargo)
  if (cargoCadastrado?.perfilPadrao) return cargoCadastrado.perfilPadrao

  const cargoNormalizado = String(cargo || '').trim().toUpperCase()
  if (cargoNormalizado === 'GERENTE') return 'GERENTE'
  if (cargoNormalizado === 'PADEIRO') return 'PADEIRO'
  return 'ATENDENTE'
}

function telasPadraoPorPerfil(perfil) {
  if (perfil === 'ADMIN' || perfil === 'GERENTE') return []
  return TELAS_SISTEMA
    .filter(tela => tela.perfis?.includes(perfil))
    .map(tela => tela.id)
}

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

  const [gerenciarAcesso, setGerenciarAcesso] = useState(false)
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [perfilAcesso, setPerfilAcesso] = useState('ATENDENTE')
  const [telasPermitidas, setTelasPermitidas] = useState([])

  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const ehAdmin = perfilAcesso === 'ADMIN'
  const possuiAcesso = Boolean(funcionario?.possuiAcesso)

  const telasSelecionaveis = useMemo(() => {
    if (ehAdmin) return TELAS_SISTEMA
    return TELAS_SISTEMA.filter(tela => tela.perfis?.includes(perfilAcesso))
  }, [ehAdmin, perfilAcesso])

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
    setSenhaVisivel(false)

    if (funcionario) {
      const perfil = perfilPadraoDoCargo(funcionario.cargo, cargos)
      setNome(funcionario.nome ?? '')
      setCargo(funcionario.cargo ?? 'ATENDENTE')
      setTelefone(funcionario.telefone ?? '')
      setDataAdmissao(funcionario.dataAdmissao ?? '')
      setDataNascimento(funcionario.dataNascimento ?? '')
      setCargaHorariaDiaria(String(funcionario.cargaHorariaDiaria ?? 8))
      setGerenciarAcesso(Boolean(funcionario.possuiAcesso))
      setLogin(funcionario.emailAcesso ?? '')
      setSenha('')
      setPerfilAcesso(perfil)
      setTelasPermitidas(funcionario.telasPermitidas ?? telasPadraoPorPerfil(perfil))
    } else {
      setNome('')
      setCargo('ATENDENTE')
      setTelefone('')
      setDataAdmissao(new Date().toISOString().split('T')[0])
      setDataNascimento('')
      setCargaHorariaDiaria('8')
      setGerenciarAcesso(false)
      setLogin('')
      setSenha('')
      setPerfilAcesso('ATENDENTE')
      setTelasPermitidas(telasPadraoPorPerfil('ATENDENTE'))
    }
  }, [aberto, funcionario, cargos])

  useEffect(() => {
    if (!ehEdicao && cargos.length > 0 && !cargos.some(item => item.nome === cargo)) {
      setCargo(cargos[0].nome)
      setPerfilAcesso(perfilPadraoDoCargo(cargos[0].nome, cargos))
    }
  }, [cargos, cargo, ehEdicao])

  useEffect(() => {
    if (!aberto) return
    const perfil = perfilPadraoDoCargo(cargo, cargos)
    setPerfilAcesso(perfil)
    setTelasPermitidas(telasPadraoPorPerfil(perfil))
  }, [aberto, cargo, cargos])

  function alternarTela(id) {
    setTelasPermitidas(atual => atual.includes(id)
      ? atual.filter(item => item !== id)
      : [...atual, id])
  }

  function validarAcesso() {
    if (!gerenciarAcesso && !possuiAcesso) return true
    if (!login.trim()) {
      setErro('Informe o login do funcionário.')
      return false
    }
    if (!possuiAcesso && senha.length < 6) {
      setErro('Informe uma senha com no mínimo 6 caracteres.')
      return false
    }
    if (senha && senha.length < 6) {
      setErro('A nova senha deve ter no mínimo 6 caracteres.')
      return false
    }
    return true
  }

  async function salvarAcesso(funcionarioId) {
    if (!gerenciarAcesso && !possuiAcesso) return

    const dadosAcesso = {
      email: login.trim(),
      senha: senha || null,
      perfil: perfilAcesso,
      telasPermitidas: ehAdmin ? [] : telasPermitidas,
    }

    if (possuiAcesso) {
      await authServico.atualizarAcesso(funcionarioId, dadosAcesso)
      return
    }

    await authServico.criarAcesso(
      funcionarioId,
      dadosAcesso.email,
      senha,
      dadosAcesso.perfil,
      dadosAcesso.telasPermitidas,
    )
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')

    if (!nome.trim()) return setErro('O nome é obrigatório.')
    if (cargos.length === 0) return setErro('Cadastre cargos em Configurações antes de criar funcionários.')
    if (!cargo) return setErro('Selecione um cargo.')
    if (!dataAdmissao) return setErro('Data de admissão é obrigatória.')
    const carga = parseFloat(cargaHorariaDiaria)
    if (Number.isNaN(carga) || carga < 1 || carga > 12) {
      return setErro('Carga horária deve ser entre 1 e 12 horas.')
    }
    if (!validarAcesso()) return

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
      const resposta = ehEdicao
        ? await funcionariosServico.atualizar(funcionario.id, dados)
        : await funcionariosServico.criar(dados)

      const funcionarioId = ehEdicao ? funcionario.id : resposta.data.id
      await salvarAcesso(funcionarioId)

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
        className="w-full max-w-[760px] rounded-[18px] border border-[var(--linha-suave)] shadow-[var(--sombra-md)] overflow-hidden max-h-[92vh] flex flex-col"
        style={{ background: 'var(--fundo-1)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--linha-suave)]">
          <div className="flex items-center gap-2.5">
            {ehEdicao ? <Pencil size={16} className="text-[var(--acento)]" /> : <UserPlus size={16} className="text-[var(--acento)]" />}
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--texto-0)]">
                {ehEdicao ? 'Editar funcionário' : 'Novo funcionário'}
              </h2>
              <p className="text-[11px] text-[var(--texto-3)] mt-0.5">
                Dados profissionais e acesso ao sistema
              </p>
            </div>
          </div>
          <button type="button" onClick={onFechar} className="text-[var(--texto-2)] hover:text-[var(--texto-0)] transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={salvar} autoComplete="off" className="px-6 py-5 flex flex-col gap-5 overflow-y-auto">
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                Nome completo *
              </label>
              <input className={CAMPO} value={nome} onChange={e => setNome(e.target.value)} placeholder="Ana Souza" required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                {erroCargos && <span className="text-[11.5px] text-[var(--negativo)]">{erroCargos}</span>}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          </section>

          <section className="rounded-[14px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] p-4 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <KeyRound size={16} className="text-[var(--acento)] mt-0.5" />
                <div>
                  <h3 className="text-[13.5px] font-semibold text-[var(--texto-0)]">Acesso ao sistema</h3>
                  <p className="text-[11.5px] text-[var(--texto-3)] mt-0.5">
                    Defina login, senha, perfil e telas permitidas para este funcionário.
                  </p>
                </div>
              </div>
              {!possuiAcesso && (
                <label className="flex items-center gap-2 text-[12.5px] text-[var(--texto-1)] select-none">
                  <input
                    type="checkbox"
                    style={ESTILO_CHECKBOX}
                    checked={gerenciarAcesso}
                    onChange={e => setGerenciarAcesso(e.target.checked)}
                  />
                  Criar acesso
                </label>
              )}
            </div>

            {(gerenciarAcesso || possuiAcesso) && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                      Login *
                    </label>
                    <input
                      className={CAMPO}
                      value={login}
                      onChange={e => setLogin(e.target.value)}
                      placeholder="ana.souza ou ana@email.com"
                      name="fresquim-login-funcionario"
                      autoComplete="new-password"
                      data-lpignore="true"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                      {possuiAcesso ? 'Nova senha' : 'Senha *'}
                    </label>
                    <div className="relative">
                      <input
                        type={senhaVisivel ? 'text' : 'password'}
                        className={`${CAMPO} pr-11`}
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        placeholder={possuiAcesso ? 'Deixe vazio para manter' : 'mínimo 6 caracteres'}
                        name="fresquim-senha-funcionario"
                        autoComplete="new-password"
                        data-lpignore="true"
                      />
                      <button
                        type="button"
                        onClick={() => setSenhaVisivel(atual => !atual)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-[8px] grid place-items-center text-[var(--texto-2)] hover:text-[var(--texto-0)] hover:bg-[var(--fundo-3)]"
                        aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {senhaVisivel ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-[10px] border border-[var(--linha-suave)] bg-[var(--fundo-1)] px-3.5 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[var(--texto-3)]">
                      Perfil de acesso
                    </p>
                    <p className="text-[11.5px] text-[var(--texto-3)] mt-1">
                      Definido automaticamente pelo cargo selecionado.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--acento-suave)] text-[11.5px] font-semibold text-[var(--texto-0)]">
                    {perfilAcesso}
                  </span>
                </div>

                {ehAdmin ? (
                  <div className="rounded-[10px] border border-[oklch(0.74_0.12_145/0.35)] bg-[oklch(0.74_0.12_145/0.1)] px-3 py-2.5 flex items-center gap-2 text-[12.5px] text-[var(--texto-1)]">
                    <ShieldCheck size={14} className="text-[var(--positivo)]" />
                    Administradores acessam todas as telas e não podem ter permissões restringidas.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div>
                      <h4 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)]">
                        Telas permitidas
                      </h4>
                      <p className="text-[11.5px] text-[var(--texto-3)] mt-1">
                        Se nenhuma tela for marcada, o sistema usa o acesso padrão do perfil.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {telasSelecionaveis.map(tela => {
                        const Icone = tela.Icone
                        const marcado = telasPermitidas.includes(tela.id)
                        return (
                          <label
                            key={tela.id}
                            className="flex items-center gap-2 rounded-[9px] border border-[var(--linha-suave)] bg-[var(--fundo-1)] px-3 py-2 text-[13px] text-[var(--texto-1)]"
                          >
                            <input
                              type="checkbox"
                              style={ESTILO_CHECKBOX}
                              checked={marcado}
                              onChange={() => alternarTela(tela.id)}
                            />
                            <Icone size={13} className="text-[var(--texto-3)]" />
                            {tela.rotulo}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

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
