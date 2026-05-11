export default function EstadoVazio({ mensagem = 'Nenhum registro encontrado.', icone: Icone }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--texto-3)]">
      {Icone && <Icone size={32} strokeWidth={1.2} />}
      <p className="font-mono text-[12px] tracking-[0.08em] uppercase">{mensagem}</p>
    </div>
  )
}
