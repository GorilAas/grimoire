import { useId } from 'react'

export default function Sparkline({ dados, altura = 36, cor = 'var(--acento-forte)' }) {
  const id = useId()
  if (!dados || dados.length < 2) return null

  const largura = 120
  const min = Math.min(...dados)
  const max = Math.max(...dados)
  const intervalo = max - min || 1
  const passo = largura / (dados.length - 1)
  const pontos = dados.map((v, i) => [
    i * passo,
    altura - ((v - min) / intervalo) * (altura - 6) - 3,
  ])
  const caminho = pontos
    .map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`))
    .join(' ')
  const area = `${caminho} L${largura},${altura} L0,${altura} Z`
  const idGradiente = `spark-${id.replace(/:/g, '')}`

  return (
    <svg
      viewBox={`0 0 ${largura} ${altura}`}
      preserveAspectRatio="none"
      width="100%"
      height={altura}
    >
      <defs>
        <linearGradient id={idGradiente} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={cor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={cor} stopOpacity="0"   />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${idGradiente})`} />
      <path d={caminho} fill="none" stroke={cor} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
