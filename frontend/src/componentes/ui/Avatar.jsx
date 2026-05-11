import { iniciais } from '@/utilitarios/formatadores'
import { cn } from '@/lib/utils'

export default function Avatar({ nome, variante = 'musgo', tamanho = 'sm' }) {
  const texto = iniciais(nome)

  return (
    <span
      className={cn(
        'rounded-full grid place-items-center font-mono font-bold shrink-0',
        tamanho === 'sm' && 'w-[26px] h-[26px] text-[10px]',
        tamanho === 'md' && 'w-[30px] h-[30px] text-[12px]',
        variante === 'musgo'  && 'bg-gradient-to-br from-musgo-400 to-musgo-700 text-[var(--fundo-0)]',
        variante === 'dourado'&& 'bg-gradient-to-br from-dourado-400 to-dourado-600 text-[oklch(0.2_0.02_80)]',
      )}
    >
      {texto}
    </span>
  )
}
