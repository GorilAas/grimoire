import Chip from '@/componentes/ui/Chip'

function CelulaValor({ valor }) {
  if (typeof valor === 'object' && valor?.tipo === 'chip') {
    const mapa = { ok: 'ok', alerta: 'alerta', erro: 'erro' }
    return <Chip variante={mapa[valor.tom] ?? 'mudo'}>{valor.rotulo}</Chip>
  }

  if (valor && typeof valor === 'object') {
    const texto =
      valor.nome ??
      valor.rotulo ??
      valor.label ??
      valor.valor ??
      Object.entries(valor).map(([chave, item]) => `${chave}: ${item}`).join(', ')

    return <span>{texto}</span>
  }

  return <span>{valor}</span>
}

export default function RenderizadorTabela({ colunas, linhas }) {
  return (
    <div className="mt-2.5 overflow-x-auto">
      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr>
            {colunas.map(c => (
              <th
                key={c}
                className="text-left font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--texto-3)] font-medium px-3 py-2 border-b border-[var(--linha-suave)]"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, ri) => (
            <tr key={ri} className="hover:bg-[var(--fundo-2)] transition-colors">
              {linha.map((cel, ci) => (
                <td
                  key={ci}
                  className="px-3 py-2 border-b border-[var(--linha-suave)] text-[var(--texto-1)] last:border-b-0"
                >
                  <CelulaValor valor={cel} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
