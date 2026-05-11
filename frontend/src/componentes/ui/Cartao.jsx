import { cn } from '@/lib/utils'

export default function Cartao({ children, className, style, ...props }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[16px] border border-[var(--linha-suave)]',
        'p-5 backdrop-blur-sm',
        'transition-all duration-280 ease-out',
        'hover:-translate-y-0.5 hover:shadow-[var(--sombra-md)] hover:border-[var(--linha)]',
        className,
      )}
      style={{ background: 'var(--cartao-bg)', ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
