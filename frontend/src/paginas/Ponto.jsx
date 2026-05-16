import { useState, useEffect } from 'react'
import { Clock, CheckCircle2, LogIn, LogOut, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import CabecalhoPagina from '@/componentes/ui/CabecalhoPagina'
import Cartao from '@/componentes/ui/Cartao'
import Chip from '@/componentes/ui/Chip'
import EstadoCarregando from '@/componentes/ui/EstadoCarregando'
import { useAuth } from '@/contextos/AuthContexto'
import { useDadosApi } from '@/hooks/useDadosApi'
import pontoServico from '@/servicos/pontoServico'
import funcionariosServico from '@/servicos/funcionariosServico'

function formatarHora(isoStr) {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function semanaAtual() {
  const now = new Date()
  const dia = now.getDay()
  const diff = dia === 0 ? -6 : 1 - dia
  const seg = new Date(now); seg.setDate(now.getDate() + diff)
  const sex = new Date(seg); sex.setDate(seg.getDate() + 6)
  return {
    inicio: seg.toISOString().split('T')[0],
    fim:    sex.toISOString().split('T')[0],
  }
}

export default function Ponto() {
  const { usuario, temPermissao } = useAuth()
  const ehAdmin = temPermissao(['ADMIN', 'GERENTE'])

  const [batendo, setBatendo] = useState(false)
  const [mensagem, setMensagem] = useState(null)
  const [funcId, setFuncId] = useState(null)

  const { dados: funcionarios } = useDadosApi(() => funcionariosServico.listarAtivos(), [], ehAdmin)
  const { dados: meuFuncionario } = useDadosApi(() => funcionariosServico.buscarMeuFuncionario(), [], !ehAdmin)
  useEffect(() => {
    if (!funcId && usuario) {
      if (ehAdmin && funcionarios?.length > 0) {
        setFuncId(funcionarios[0].id)
      } else if (!ehAdmin && meuFuncionario?.id) {
        setFuncId(meuFuncionario.id)
      }
    }
  }, [funcionarios, meuFuncionario, usuario, ehAdmin, funcId])
  const { dados: registrosHoje, recarregar: recarregarHoje } = useDadosApi(
    () => funcId ? pontoServico.hoje(funcId) : Promise.resolve({ data: [] }),
    [funcId]
  )
  const semana = semanaAtual()
  const { dados: resumoSemana, recarregar: recarregarResumo } = useDadosApi(
    () => funcId ? pontoServico.resumo(funcId, semana.inicio, semana.fim) : Promise.resolve({ data: [] }),
    [funcId]
  )

  const registros = registrosHoje ?? []
  const resumo    = resumoSemana  ?? []
  const ultimoRegistro = registros[registros.length - 1]
  const emAndamento    = ultimoRegistro?.tipo === 'ENTRADA'
  const saldoSemana = resumo.reduce((acc, d) => acc + (d.saldoDecimal ?? 0), 0)

  async function baterPonto() {
    if (!funcId) return
    setBatendo(true)
    setMensagem(null)
    try {
      const res = await pontoServico.bater(funcId)
      const tipo = res.data.tipo
      setMensagem({
        tipo: 'ok',
        texto: tipo === 'ENTRADA' ? 'Entrada registrada!' : 'Saída registrada!'
      })
      recarregarHoje()
      recarregarResumo()
    } catch {
      setMensagem({ tipo: 'erro', texto: 'Erro ao registrar ponto.' })
    } finally {
      setBatendo(false)
    }
  }

  return (
    <div className="pagina-entrada p-7 flex flex-col gap-5">
      <CabecalhoPagina
        titulo="Ponto Eletrônico"
        subtitulo={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
      />


      {ehAdmin && funcionarios?.length > 0 && (
        <div className="flex items-center gap-3">
          <label className="text-[12px] font-medium text-[var(--texto-2)]">Funcionário:</label>
          <select
            value={funcId ?? ''}
            onChange={e => setFuncId(Number(e.target.value))}
            className="h-9 px-3 rounded-[8px] border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[13px] text-[var(--texto-0)] outline-none focus:border-[var(--acento)]"
          >
            {funcionarios.map(f => (
              <option key={f.id} value={f.id}>{f.nome} — {f.cargo}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">


        <Cartao className="p-6 flex flex-col items-center gap-4">
          <div
            className={[
              'w-20 h-20 rounded-full grid place-items-center transition-all duration-300',
              emAndamento
                ? 'bg-[oklch(0.74_0.13_145/0.15)] border-2 border-[var(--positivo)] shadow-[0_0_24px_oklch(0.74_0.13_145/0.3)]'
                : 'bg-[var(--fundo-3)] border-2 border-[var(--linha-suave)]',
            ].join(' ')}
          >
            <Clock size={32} className={emAndamento ? 'text-[var(--positivo)]' : 'text-[var(--texto-3)]'} />
          </div>

          <div className="text-center">
            <p className="text-[13px] text-[var(--texto-2)]">
              {emAndamento ? 'Em serviço desde' : 'Fora do serviço'}
            </p>
            {emAndamento && (
              <p className="text-[20px] font-bold text-[var(--texto-0)] font-mono">
                {formatarHora(ultimoRegistro?.momento)}
              </p>
            )}
          </div>

          <button
            onClick={baterPonto}
            disabled={batendo || !funcId}
            className={[
              'w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-[14px] font-semibold transition-all duration-160 disabled:opacity-60',
              emAndamento
                ? 'bg-[oklch(0.65_0.18_28/0.15)] border border-[oklch(0.65_0.18_28/0.4)] text-[var(--negativo)] hover:bg-[oklch(0.65_0.18_28/0.25)]'
                : 'text-[var(--fundo-0)] hover:opacity-90',
            ].join(' ')}
            style={!emAndamento ? {
              background: 'linear-gradient(135deg, var(--acento-forte), oklch(0.48 0.07 145))',
              boxShadow: '0 4px 14px oklch(0.48 0.07 145 / 0.35)',
            } : {}}
          >
            {emAndamento ? <LogOut size={16} /> : <LogIn size={16} />}
            {batendo ? 'Registrando…' : (emAndamento ? 'Registrar Saída' : 'Registrar Entrada')}
          </button>

          {mensagem && (
            <div className={[
              'flex items-center justify-center gap-1.5 text-[12.5px] px-3 py-2 rounded-[8px] border w-full',
              mensagem.tipo === 'ok'
                ? 'bg-[oklch(0.74_0.13_145/0.1)] border-[oklch(0.74_0.13_145/0.3)] text-[var(--positivo)]'
                : 'bg-[oklch(0.65_0.18_28/0.1)] border-[oklch(0.65_0.18_28/0.3)] text-[var(--negativo)]',
            ].join(' ')}>
              {mensagem.tipo === 'ok' && <CheckCircle2 size={13} />}
              {mensagem.texto}
            </div>
          )}
        </Cartao>


        <Cartao className="p-5 flex flex-col gap-3">
          <h3 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)]">
            Registros de hoje
          </h3>
          {registros.length === 0 ? (
            <p className="text-[13px] text-[var(--texto-3)] text-center py-4">Nenhum registro</p>
          ) : (
            <div className="flex flex-col gap-2">
              {registros.map(r => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-[8px] bg-[var(--fundo-2)]"
                >
                  <div className={[
                    'w-2 h-2 rounded-full shrink-0',
                    r.tipo === 'ENTRADA' ? 'bg-[var(--positivo)]' : 'bg-[var(--negativo)]',
                  ].join(' ')} />
                  <span className="text-[12.5px] font-medium text-[var(--texto-0)]">
                    {r.tipo === 'ENTRADA' ? 'Entrada' : 'Saída'}
                  </span>
                  <span className="font-mono text-[12px] text-[var(--texto-2)] ml-auto">
                    {formatarHora(r.momento)}
                  </span>
                  {r.ajusteManual && (
                    <span className="text-[10px] font-mono text-[var(--alerta)]">ajuste</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Cartao>


        <Cartao className="p-5 flex flex-col gap-3">
          <h3 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)]">
            Semana atual
          </h3>


          <div className="flex flex-col items-center gap-1 py-2">
            <span className="text-[11px] text-[var(--texto-3)]">Saldo acumulado</span>
            <span className={[
              'text-[24px] font-bold font-mono',
              saldoSemana >= 0 ? 'text-[var(--positivo)]' : 'text-[var(--negativo)]',
            ].join(' ')}>
              {saldoSemana >= 0 ? '+' : ''}{Math.floor(Math.abs(saldoSemana))}h{' '}
              {Math.round((Math.abs(saldoSemana) % 1) * 60)}min
            </span>
            <span className="text-[11px] text-[var(--texto-3)]">
              {saldoSemana >= 0 ? 'horas extras' : 'horas a compensar'}
            </span>
          </div>


          <div className="flex flex-col gap-1.5">
            {resumo.map(d => (
              <div key={d.data} className="flex items-center gap-2 text-[12px]">
                <span className="text-[var(--texto-3)] w-8 shrink-0">
                  {new Date(d.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--fundo-3)] overflow-hidden">
                  <div
                    className={[
                      'h-full rounded-full transition-all',
                      d.saldoDecimal >= 0 ? 'bg-[var(--positivo)]' : 'bg-[var(--negativo)]',
                    ].join(' ')}
                    style={{
                      width: `${Math.min(100, (d.horasTrabalhadasDecimal / (d.horasEsperadasDecimal || 8)) * 100)}%`
                    }}
                  />
                </div>
                <span className="text-[var(--texto-2)] font-mono w-16 text-right shrink-0">
                  {d.horasTrabalhadas}
                </span>
              </div>
            ))}
            {resumo.length === 0 && (
              <p className="text-[12px] text-[var(--texto-3)] text-center py-2">
                Sem registros esta semana
              </p>
            )}
          </div>
        </Cartao>
      </div>
    </div>
  )
}
