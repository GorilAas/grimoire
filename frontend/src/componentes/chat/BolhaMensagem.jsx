import { Sparkles } from 'lucide-react'
import { useAuth } from '@/contextos/AuthContexto'
import RenderizadorGenerativo from './renderizadores/RenderizadorGenerativo'

function iniciaisNome(nome) {
  if (!nome) return 'EU'
  return nome.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase()
}

export default function BolhaMensagem({ mensagem }) {
  const { usuario } = useAuth()
  const eUsuario = mensagem.papel === 'usuario'

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: '32px 1fr' }}>
      <div
        className="w-8 h-8 rounded-[9px] grid place-items-center text-[11px] font-mono font-bold shrink-0"
        style={eUsuario
          ? { background: 'linear-gradient(135deg, oklch(0.78 0.135 70), oklch(0.62 0.13 60))', color: 'oklch(0.2 0.02 80)' }
          : { background: 'linear-gradient(135deg, var(--acento-forte), oklch(0.32 0.05 145))', color: 'var(--fundo-0)', boxShadow: '0 0 0 1px oklch(0.48 0.07 145 / 0.3), 0 4px 12px oklch(0.48 0.07 145 / 0.25)' }
        }
      >
        {eUsuario ? iniciaisNome(usuario?.nome) : <Sparkles size={14} />}
      </div>

      <div>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-[13px] font-semibold text-[var(--texto-0)]">
            {eUsuario ? (usuario?.nome?.split(' ')[0] ?? 'Voce') : 'Assistente FresQUIM'}
          </span>
          <small className="font-mono text-[11px] text-[var(--texto-3)] tracking-[0.06em]">
            {mensagem.hora}
          </small>
        </div>

        <div className="flex flex-col gap-2">
          {mensagem.conteudo && (
            <p className="text-[14px] leading-[1.6] text-[var(--texto-1)]">{mensagem.conteudo}</p>
          )}
          {mensagem.blocos?.map((bloco, i) => (
            <RenderizadorGenerativo key={i} bloco={bloco} />
          ))}
        </div>
      </div>
    </div>
  )
}
