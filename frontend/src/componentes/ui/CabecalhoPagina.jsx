export default function CabecalhoPagina({ titulo, subtitulo, acoes }) {
  return (
    <div className="cabecalho-pagina flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2
          className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[var(--texto-0)] font-sans"
          style={{ animation: 'respirarPeso 8s ease-in-out infinite' }}
        >
          {titulo}
        </h2>
        {subtitulo && (
          <p className="mt-1 text-[13px] text-[var(--texto-2)]">{subtitulo}</p>
        )}
      </div>
      {acoes && <div className="acoes-pagina flex gap-2">{acoes}</div>}
    </div>
  )
}
