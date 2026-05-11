export default function RespostaTexto({ conteudo }) {
  const partes = conteudo.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} className="text-[var(--texto-0)] font-semibold bg-[var(--acento-suave)] px-1 rounded">{p.slice(2, -2)}</strong>
      : <span key={i}>{p}</span>
  )
  return (
    <p className="text-[14px] leading-[1.6] text-[var(--texto-1)] max-w-[720px]">
      {partes}
    </p>
  )
}
