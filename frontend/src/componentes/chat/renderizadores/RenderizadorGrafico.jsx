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

export function GraficoBarrasChat({ titulo, dados }) {
  return (
    <div>
      {titulo && (
        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)] mb-3">
          {titulo}
        </p>
      )}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="var(--linha-suave)" vertical={false} />
          <XAxis dataKey="rotulo" tick={{ fill: 'var(--texto-3)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--texto-3)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={36} />
          <Tooltip contentStyle={estiloDica} cursor={{ fill: 'var(--acento-suave)' }} />
          <Bar dataKey="valor" fill="var(--acento-forte)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function GraficoAreaChat({ titulo, dados }) {
  return (
    <div>
      {titulo && (
        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)] mb-3">
          {titulo}
        </p>
      )}
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={dados} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <defs>
            <linearGradient id="gradChat" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="var(--acento-forte)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--acento-forte)" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="var(--linha-suave)" vertical={false} />
          <XAxis dataKey="x" tick={{ fill: 'var(--texto-3)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--texto-3)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={false} tickLine={false} width={36} />
          <Tooltip contentStyle={estiloDica} />
          <Area type="monotone" dataKey="y" stroke="var(--acento-forte)" strokeWidth={2} fill="url(#gradChat)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function GraficoPizzaChat({ titulo, dados }) {
  return (
    <div>
      {titulo && (
        <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)] mb-3">
          {titulo}
        </p>
      )}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={dados}
            dataKey="valor"
            nameKey="rotulo"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={80}
            paddingAngle={3}
            strokeWidth={0}
          >
            {dados.map((_, i) => (
              <Cell key={i} fill={CORES_PIZZA[i % CORES_PIZZA.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={estiloDica} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: 'var(--texto-2)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
