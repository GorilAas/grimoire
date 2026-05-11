import Sparkline from '@/componentes/ui/Sparkline'

export default function CartaoKpiChat({ itens }) {
  return (
    <div className="grid grid-cols-4 gap-2.5 mt-2.5">
      {itens.map((item, i) => {
        const direcao = item.delta >= 0 ? 'pos' : 'neg'
        return (
          <div
            key={i}
            className="px-3.5 py-3 rounded-[10px] border border-[var(--linha-suave)]"
            style={{
              background: 'oklch(0.22 0.014 90 / 0.6)',
              animationDelay: `${i * 60}ms`,
            }}
          >
            <div className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--texto-3)]">
              {item.rotulo}
            </div>
            <div className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--texto-0)] tabular-nums mt-0.5">
              {item.valor}
            </div>
            <div className={['flex items-center gap-1.5 font-mono text-[10.5px] mt-1',
              direcao === 'pos' ? 'text-[var(--positivo)]' : 'text-[var(--negativo)]'
            ].join(' ')}>
              {direcao === 'pos' ? '↑' : '↓'}
              {Math.abs(item.delta).toFixed(1)}%
              <span className="text-[var(--texto-3)]">{item.rotuloReferencia}</span>
            </div>
            {item.sparkline && (
              <div className="mt-2">
                <Sparkline
                  dados={item.sparkline}
                  altura={28}
                  cor={direcao === 'pos' ? 'var(--positivo)' : 'var(--negativo)'}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
