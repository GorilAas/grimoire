export default function EstadoCarregando({ linhas = 5 }) {
  return (
    <div className="flex flex-col gap-3 p-2 animate-pulse">
      {Array.from({ length: linhas }).map((_, i) => (
        <div
          key={i}
          className="h-10 rounded-[8px] bg-[var(--fundo-2)]"
          style={{ opacity: 1 - i * 0.12 }}
        />
      ))}
    </div>
  )
}
