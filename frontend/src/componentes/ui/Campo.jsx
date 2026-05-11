import { cn } from '@/lib/utils'

export default function Campo({ icone: Icone, className, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center h-[34px] px-3 gap-2 rounded-[9px]',
        'bg-[var(--fundo-2)] border border-[var(--linha)] text-[var(--texto-0)]',
        'transition-all duration-160',
        'focus-within:border-musgo-400 focus-within:shadow-[0_0_0_4px_oklch(0.48_0.07_145/0.15)]',
        className,
      )}
    >
      {Icone && <Icone size={14} className="text-[var(--texto-2)] shrink-0" />}
      <input
        className="bg-transparent border-0 outline-none flex-1 w-full text-[13px] text-[var(--texto-0)] placeholder:text-[var(--texto-3)]"
        {...props}
      />
    </div>
  )
}
