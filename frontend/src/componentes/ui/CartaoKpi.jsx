import Cartao from './Cartao'
import Sparkline from './Sparkline'

export default function CartaoKpi({
  rotulo,
  valor,
  delta,
  rotuloReferencia = 'vs. semana anterior',
  icone: Icone,
  sparkline,
}) {
  const direcao = delta > 0 ? 'pos' : delta < 0 ? 'neg' : 'neutro'

  return (
    <Cartao className="flex flex-col gap-1 p-[18px] min-w-0">
      <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)]">
        {Icone && <Icone size={11} className="shrink-0 text-[var(--texto-2)]" />}
        <span className="truncate">{rotulo}</span>
      </div>

      <div className="mt-1.5 font-sans text-[clamp(1.55rem,7vw,1.875rem)] font-semibold text-[var(--texto-0)] tabular-nums leading-[1.1]">
        {valor}
      </div>

      {delta !== undefined && (
        <div
          className={[
            'flex items-center gap-1.5 text-[11.5px] font-mono mt-0.5 min-w-0',
            direcao === 'pos' && 'text-[var(--positivo)]',
            direcao === 'neg' && 'text-[var(--negativo)]',
            direcao === 'neutro' && 'text-[var(--texto-3)]',
          ].filter(Boolean).join(' ')}
        >
          {direcao === 'pos' && <span>+</span>}
          {direcao === 'neg' && <span>-</span>}
          <span>{direcao === 'neutro' ? '-' : `${Math.abs(delta).toFixed(1)}%`}</span>
          <span className="truncate text-[var(--texto-3)]">{rotuloReferencia}</span>
        </div>
      )}

      {sparkline && (
        <div className="mt-2.5 h-9">
          <Sparkline
            dados={sparkline}
            altura={36}
            cor={direcao === 'neg' ? 'var(--negativo)' : 'var(--acento-forte)'}
          />
        </div>
      )}
    </Cartao>
  )
}
