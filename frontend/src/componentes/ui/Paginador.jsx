export default function Paginador({ total, porPagina = 10, paginaAtual = 1, onMudar }) {
  const totalPaginas = Math.ceil(total / porPagina)
  if (totalPaginas <= 1) return null

  const inicio = (paginaAtual - 1) * porPagina + 1
  const fim = Math.min(paginaAtual * porPagina, total)

  return (
    <div className="flex items-center justify-between pt-3 font-mono text-[11px] text-[var(--texto-3)] tracking-[0.06em]">
      <span>
        Mostrando {inicio}–{fim} de {total}
      </span>
      <div className="flex gap-0.5">
        {['‹', ...Array.from({ length: totalPaginas }, (_, i) => i + 1), '›'].map((p, i) => {
          const pNum = typeof p === 'number' ? p : p === '‹' ? paginaAtual - 1 : paginaAtual + 1
          const desabilitado = (p === '‹' && paginaAtual === 1) || (p === '›' && paginaAtual === totalPaginas)
          const ativa = p === paginaAtual

          return (
            <button
              key={i}
              onClick={() => !desabilitado && onMudar?.(pNum)}
              disabled={desabilitado}
              className={[
                'min-w-[26px] h-[26px] grid place-items-center rounded-[6px] text-[11px] transition-all duration-160',
                ativa
                  ? 'bg-[var(--acento-suave)] text-[var(--texto-0)] shadow-[inset_0_0_0_1px_oklch(0.48_0.07_145/0.4)]'
                  : 'text-[var(--texto-2)] hover:bg-[var(--fundo-3)] hover:text-[var(--texto-0)]',
                desabilitado && 'opacity-30 cursor-not-allowed',
              ].filter(Boolean).join(' ')}
            >
              {p}
            </button>
          )
        })}
      </div>
    </div>
  )
}
