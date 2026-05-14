import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

const CORES_PIZZA = [
  'var(--acento-forte)',
  'oklch(0.62 0.13 200)',
  'oklch(0.65 0.18 55)',
  'oklch(0.55 0.15 300)',
  'oklch(0.70 0.14 170)',
  'oklch(0.60 0.12 250)',
]

const estiloDica = {
  background: 'var(--fundo-2)',
  border: '1px solid var(--linha-suave)',
  borderRadius: 8,
  color: 'var(--texto-0)',
  fontSize: 12,
}

function primeiroValor(item, chaves) {
  for (const chave of chaves) {
    if (item?.[chave] !== undefined && item?.[chave] !== null) return item[chave]
  }
  return undefined
}

function converterNumero(valor) {
  if (typeof valor === 'number') return valor
  if (typeof valor !== 'string') return Number(valor ?? 0)

  const limpo = valor
    .replace(/[^\d,.-]/g, '')
    .replace(/\.(?=\d{3}(,|$))/g, '')
    .replace(',', '.')

  return Number(limpo || 0)
}

function normalizarDados(dados = [], tipo = 'barra') {
  return dados
    .map((item, indice) => {
      const rotulo = primeiroValor(item, ['rotulo', 'label', 'nome', 'forma', 'categoria', 'x']) ?? `Item ${indice + 1}`
      const valorBruto = primeiroValor(item, ['valor', 'value', 'total', 'totalVendas', 'vendas', 'quantidade', 'quantidadeVendas', 'receita', 'count', 'y'])
      const valor = converterNumero(valorBruto)

      return {
        rotulo: String(rotulo),
        valor: Number.isFinite(valor) ? valor : 0,
        x: String(rotulo),
        y: Number.isFinite(valor) ? valor : 0,
      }
    })
    .filter(item => tipo === 'area' || item.valor !== 0 || dados.length <= 1)
}

function larguraMinima(qtd) {
  return Math.max(280, Math.min(720, qtd * 76))
}

function SemDadosGrafico() {
  return (
    <div className="min-h-[180px] flex items-center justify-center rounded-[12px] border border-dashed border-[var(--linha-suave)] text-center px-5">
      <p className="text-[12px] text-[var(--texto-3)]">
        Sem dados suficientes para desenhar o gráfico.
      </p>
    </div>
  )
}

export function GraficoBarrasChat({ titulo, dados }) {
  const normalizados = normalizarDados(dados, 'barra')
  const temDados = normalizados.some(item => item.valor !== 0)

  return (
    <div className="min-w-0 overflow-x-auto">
      {titulo && (
        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)] mb-3">
          {titulo}
        </p>
      )}
      {!temDados && <SemDadosGrafico />}
      {temDados && (
      <div style={{ minWidth: larguraMinima(normalizados.length) }}>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={normalizados} margin={{ top: 8, right: 8, left: 0, bottom: 18 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--linha-suave)" vertical={false} />
            <XAxis
              dataKey="rotulo"
              tick={{ fill: 'var(--texto-2)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-18}
              textAnchor="end"
              height={42}
            />
            <YAxis tick={{ fill: 'var(--texto-2)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={38} />
            <Tooltip contentStyle={estiloDica} cursor={{ fill: 'var(--acento-suave)' }} />
            <Bar dataKey="valor" fill="var(--acento-forte)" radius={[4, 4, 0, 0]} minPointSize={3} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  )
}

export function GraficoAreaChat({ titulo, dados }) {
  const normalizados = normalizarDados(dados, 'area')
  const temDados = normalizados.some(item => item.y !== 0)

  return (
    <div className="min-w-0 overflow-x-auto">
      {titulo && (
        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)] mb-3">
          {titulo}
        </p>
      )}
      {!temDados && <SemDadosGrafico />}
      {temDados && (
      <div style={{ minWidth: larguraMinima(normalizados.length) }}>
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={normalizados} margin={{ top: 8, right: 8, left: 0, bottom: 18 }}>
            <defs>
              <linearGradient id="gradChat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="var(--acento-forte)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--acento-forte)" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--linha-suave)" vertical={false} />
            <XAxis
              dataKey="x"
              tick={{ fill: 'var(--texto-2)', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-18}
              textAnchor="end"
              height={42}
            />
            <YAxis tick={{ fill: 'var(--texto-2)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={38} />
            <Tooltip contentStyle={estiloDica} />
            <Area type="monotone" dataKey="y" stroke="var(--acento-forte)" strokeWidth={2} fill="url(#gradChat)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  )
}

export function GraficoPizzaChat({ titulo, dados }) {
  const normalizados = normalizarDados(dados, 'pizza')
  const temDados = normalizados.some(item => item.valor !== 0)

  return (
    <div className="min-w-0 overflow-x-auto">
      {titulo && (
        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)] mb-3">
          {titulo}
        </p>
      )}
      {!temDados && <SemDadosGrafico />}
      {temDados && (
      <div className="min-w-[280px]">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={normalizados}
              dataKey="valor"
              nameKey="rotulo"
              cx="50%"
              cy="45%"
              innerRadius={44}
              outerRadius={72}
              paddingAngle={3}
              strokeWidth={0}
            >
              {normalizados.map((_, i) => (
                <Cell key={i} fill={CORES_PIZZA[i % CORES_PIZZA.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={estiloDica} />
            <Legend
              iconType="circle"
              iconSize={8}
              verticalAlign="bottom"
              formatter={(value) => (
                <span style={{ color: 'var(--texto-2)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  )
}
