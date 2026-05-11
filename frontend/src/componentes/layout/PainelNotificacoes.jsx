import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Package, TrendingDown, CheckCheck, RefreshCcw, X } from 'lucide-react'
import produtosServico from '@/servicos/produtosServico'
import vendasServico from '@/servicos/vendasServico'
import { formatarMoeda } from '@/utilitarios/formatadores'

const INTERVALO_MS = 2 * 60 * 1000 // 2 minutos

function GrupoNotificacao({ icone: Icone, cor, titulo, items, onItem, onFechar }) {
  if (!items.length) return null
  const IconeGrupo = Icone
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2">
        <IconeGrupo size={12} className={cor} />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--texto-3)]">
          {titulo}
        </span>
        <span
          className="ml-auto font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: 'var(--fundo-3)', color: 'var(--texto-2)' }}
        >
          {items.length}
        </span>
      </div>
      <div className="flex flex-col">
        {items.slice(0, 5).map(item => (
          <button
            key={item.id}
            onClick={() => { onItem(item); onFechar() }}
            className="flex items-start justify-between gap-3 px-4 py-2.5 text-left hover:bg-[var(--fundo-2)] transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[var(--texto-0)] truncate">
                {item.titulo}
              </p>
              <p className="text-[11.5px] text-[var(--texto-3)] mt-0.5 truncate">
                {item.subtitulo}
              </p>
            </div>
            {item.badge && (
              <span className={`shrink-0 text-[11px] font-mono font-semibold mt-0.5 ${item.badgeCor}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
        {items.length > 5 && (
          <p className="px-4 py-2 text-[11.5px] text-[var(--texto-3)] italic">
            +{items.length - 5} mais…
          </p>
        )}
      </div>
    </div>
  )
}

export default function PainelNotificacoes() {
  const navigate = useNavigate()
  const [aberto,          setAberto]          = useState(false)
  const [estoqueBaixo,    setEstoqueBaixo]    = useState([])
  const [fiadoAberto,     setFiadoAberto]     = useState([])
  const [carregando,      setCarregando]      = useState(false)
  const [ultimaAtt,       setUltimaAtt]       = useState(null)
  const painelRef = useRef(null)

  const buscarAlertas = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true)
    try {
      const [resEstoque, resFiado] = await Promise.allSettled([
        produtosServico.abaixoDoMinimo(),
        vendasServico.listarFiadoEmAberto(),
      ])
      if (resEstoque.status === 'fulfilled') setEstoqueBaixo(resEstoque.value.data ?? [])
      if (resFiado.status === 'fulfilled')   setFiadoAberto(resFiado.value.data ?? [])
      setUltimaAtt(new Date())
    } finally {
      if (!silencioso) setCarregando(false)
    }
  }, [])

  // Busca inicial
  useEffect(() => { buscarAlertas() }, [buscarAlertas])

  // Auto-refresh a cada 2 minutos
  useEffect(() => {
    const id = setInterval(() => buscarAlertas(true), INTERVALO_MS)
    return () => clearInterval(id)
  }, [buscarAlertas])

  // Fecha ao clicar fora
  useEffect(() => {
    if (!aberto) return
    function handleFora(e) {
      if (painelRef.current && !painelRef.current.contains(e.target)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handleFora)
    return () => document.removeEventListener('mousedown', handleFora)
  }, [aberto])

  // Fecha com Escape
  useEffect(() => {
    if (!aberto) return
    function handleKey(e) { if (e.key === 'Escape') setAberto(false) }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [aberto])

  const totalAlertas = estoqueBaixo.length + fiadoAberto.length

  // Monta os itens de cada grupo
  const itensEstoque = estoqueBaixo.map(p => ({
    id:        `estoque-${p.id}`,
    titulo:    p.nome,
    subtitulo: `${Number(p.quantidadeEstoque ?? 0).toFixed(0)} em estoque / mínimo: ${Number(p.estoqueMinimo ?? 0).toFixed(0)}`,
    badge:     p.categoriaNome,
    badgeCor:  'text-[var(--texto-3)]',
    rota:      '/produtos',
  }))

  const itensFiado = fiadoAberto.map(v => ({
    id:        `fiado-${v.id}`,
    titulo:    v.clienteNome ?? 'Cliente sem nome',
    subtitulo: `Fiado desde ${v.dataVenda ? new Date(v.dataVenda).toLocaleDateString('pt-BR') : '—'}`,
    badge:     formatarMoeda(v.valorTotal),
    badgeCor:  'text-[oklch(0.55_0.15_55)]',
    rota:      '/vendas',
  }))

  const horaAtt = ultimaAtt
    ? ultimaAtt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="relative" ref={painelRef}>
      {/* Botão sino */}
      <button
        onClick={() => setAberto(v => !v)}
        aria-label="Notificações"
        className={[
          'relative w-10 h-10 shrink-0 flex items-center justify-center rounded-[10px] transition-all duration-160',
          aberto
            ? 'bg-[var(--acento-suave)] text-[var(--acento-forte)]'
            : 'text-[var(--texto-2)] hover:bg-[var(--fundo-2)] hover:text-[var(--texto-0)]',
        ].join(' ')}
      >
        <Bell size={17} />
        {totalAlertas > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-[4px] rounded-full flex items-center justify-center font-mono font-bold text-[9px] text-white pointer-events-none ring-2 ring-[var(--fundo-0)]"
            style={{ background: 'var(--negativo)' }}
          >
            {totalAlertas > 99 ? '99+' : totalAlertas}
          </span>
        )}
      </button>

      {/* Painel dropdown */}
      {aberto && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] w-[360px] rounded-[16px] border border-[var(--linha-suave)] overflow-hidden z-50"
          style={{
            background:  'var(--fundo-1)',
            boxShadow:   'var(--sombra-md)',
          }}
        >
          {/* Header do painel */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--linha-suave)]">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-[var(--acento)]" />
              <span className="text-[14px] font-semibold text-[var(--texto-0)]">Alertas</span>
              {totalAlertas > 0 && (
                <span
                  className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: 'var(--negativo)' }}
                >
                  {totalAlertas}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => buscarAlertas()}
                title="Atualizar"
                className={[
                  'w-7 h-7 flex items-center justify-center rounded-[7px] text-[var(--texto-3)] hover:text-[var(--texto-0)] hover:bg-[var(--fundo-2)] transition-all',
                  carregando ? 'animate-spin' : '',
                ].join(' ')}
              >
                <RefreshCcw size={13} />
              </button>
              <button
                onClick={() => setAberto(false)}
                className="w-7 h-7 flex items-center justify-center rounded-[7px] text-[var(--texto-3)] hover:text-[var(--texto-0)] hover:bg-[var(--fundo-2)] transition-all"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="max-h-[420px] overflow-y-auto">
            {!carregando && totalAlertas === 0 && (
              <div className="flex flex-col items-center gap-3 py-12 px-4">
                <div
                  className="w-10 h-10 rounded-full grid place-items-center"
                  style={{ background: 'var(--acento-suave)' }}
                >
                  <CheckCheck size={18} className="text-[var(--acento-forte)]" />
                </div>
                <div className="text-center">
                  <p className="text-[13.5px] font-semibold text-[var(--texto-0)]">
                    Tudo em ordem
                  </p>
                  <p className="text-[12px] text-[var(--texto-3)] mt-0.5">
                    Nenhum alerta no momento
                  </p>
                </div>
              </div>
            )}

            {itensEstoque.length > 0 && (
              <>
                <GrupoNotificacao
                  icone={Package}
                  cor="text-[oklch(0.65_0.18_55)]"
                  titulo="Estoque abaixo do mínimo"
                  items={itensEstoque}
                  onItem={item => navigate(item.rota)}
                  onFechar={() => setAberto(false)}
                />
                {itensFiado.length > 0 && (
                  <div className="border-t border-[var(--linha-suave)] mx-4" />
                )}
              </>
            )}

            {itensFiado.length > 0 && (
              <GrupoNotificacao
                icone={TrendingDown}
                cor="text-[var(--negativo)]"
                titulo="Fiado em aberto"
                items={itensFiado}
                onItem={item => navigate(item.rota)}
                onFechar={() => setAberto(false)}
              />
            )}
          </div>

          {/* Rodapé com hora */}
          {horaAtt && (
            <div className="px-4 py-2.5 border-t border-[var(--linha-suave)]">
              <p className="text-[11px] text-[var(--texto-3)] font-mono">
                Atualizado às {horaAtt} · atualiza a cada 2 min
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
