import RespostaTexto from './RespostaTexto'
import CartaoKpiChat from './CartaoKpiChat'
import RenderizadorTabela from './RenderizadorTabela'
import { GraficoBarrasChat, GraficoAreaChat, GraficoPizzaChat } from './RenderizadorGrafico'

export default function RenderizadorGenerativo({ bloco }) {
  const envolto = (filho) => (
    <div className="mt-2.5 p-[18px] rounded-[16px] border border-[var(--linha-suave)] backdrop-blur-sm"
      style={{ background: 'linear-gradient(180deg, oklch(0.24 0.014 90 / 0.6), oklch(0.21 0.012 90 / 0.5))' }}
    >
      {filho}
    </div>
  )

  switch (bloco.tipo) {
    case 'texto':
      return <RespostaTexto conteudo={bloco.conteudo} />
    case 'kpis':
      return envolto(<CartaoKpiChat itens={bloco.itens} />)
    case 'tabela':
      return envolto(<RenderizadorTabela colunas={bloco.colunas} linhas={bloco.linhas} />)
    case 'grafico_barras':
      return envolto(<GraficoBarrasChat titulo={bloco.titulo} dados={bloco.dados} />)
    case 'grafico_area':
      return envolto(<GraficoAreaChat titulo={bloco.titulo} dados={bloco.dados} />)
    case 'grafico_pizza':
      return envolto(<GraficoPizzaChat titulo={bloco.titulo} dados={bloco.dados} />)
    default:
      return null
  }
}
