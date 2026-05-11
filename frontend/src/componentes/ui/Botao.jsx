import { cn } from '@/lib/utils'

const variantes = {
  primario: 'border hover:brightness-[1.03]',
  secundario: 'bg-[var(--fundo-2)] text-[var(--texto-0)] border-[var(--linha)] hover:bg-[var(--fundo-3)]',
  fantasma: 'bg-transparent border-transparent text-[var(--texto-1)] hover:bg-[var(--fundo-2)] hover:text-[var(--texto-0)]',
  destrutivo: 'bg-gradient-to-b from-red-500 to-red-700 text-white border-red-700/50',
}

export default function Botao({
  children,
  variante = 'secundario',
  tamanho = 'md',
  icone = false,
  className,
  style,
  ...props
}) {
  const estiloPrimario = variante === 'primario'
    ? {
        background: 'var(--botao-primario-bg)',
        color: 'var(--botao-primario-texto)',
        borderColor: 'var(--botao-primario-borda)',
        boxShadow: 'var(--botao-primario-sombra)',
      }
    : {}

  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 border rounded-[9px] font-medium transition-all duration-150',
        'hover:-translate-y-px active:translate-y-0',
        tamanho === 'sm' && 'h-7 px-3 text-[11.5px]',
        tamanho === 'md' && 'h-[34px] px-[14px] text-[12.5px]',
        tamanho === 'lg' && 'h-10 px-5 text-[13px]',
        icone && 'w-9 px-0 justify-center shrink-0',
        variantes[variante],
        className,
      )}
      style={{ ...estiloPrimario, ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
