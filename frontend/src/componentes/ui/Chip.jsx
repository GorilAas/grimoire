import { cn } from '@/lib/utils'

const estilos = {
  ok:     'text-[var(--positivo)] bg-[oklch(0.74_0.13_145/0.12)] border-[oklch(0.74_0.13_145/0.3)]',
  alerta: 'text-[var(--alerta)]  bg-[oklch(0.78_0.14_80/0.12)]  border-[oklch(0.78_0.14_80/0.3)]',
  erro:   'text-[var(--negativo)] bg-[oklch(0.65_0.18_28/0.12)] border-[oklch(0.65_0.18_28/0.3)]',
  mudo:   'text-[var(--texto-2)] bg-[var(--fundo-3)] border-[var(--linha-suave)]',
  dourado:'text-dourado-400 bg-[oklch(0.62_0.13_60/0.14)] border-[oklch(0.62_0.13_60/0.3)]',
  info:   'text-[var(--info)] bg-[oklch(0.7_0.1_220/0.14)] border-[oklch(0.7_0.1_220/0.3)]',
}

export default function Chip({ variante = 'mudo', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center h-[22px] px-2 text-[11px] font-mono tracking-[0.04em] rounded-[5px] border',
        estilos[variante],
        className,
      )}
    >
      {children}
    </span>
  )
}
