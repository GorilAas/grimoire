import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, Menu } from 'lucide-react'
import Botao from '@/componentes/ui/Botao'
import PainelNotificacoes from './PainelNotificacoes'
import PainelAcessibilidade from '@/componentes/acessibilidade/PainelAcessibilidade'
import { buscarTelaPorRota, telasPermitidasParaUsuario } from '@/configuracao/telasSistema'
import { useAuth } from '@/contextos/AuthContexto'

function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function Cabecalho({ tema, alternarTema, onAbrirMenu }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [busca, setBusca] = useState('')
  const [aberto, setAberto] = useState(false)
  const buscaRef = useRef(null)

  const meta = buscarTelaPorRota(pathname) ?? { secao: 'Sistema', rotulo: pathname }
  const telas = useMemo(() => telasPermitidasParaUsuario(usuario), [usuario])

  const resultados = useMemo(() => {
    const termo = normalizar(busca)
    if (!termo) return telas.slice(0, 6)
    return telas
      .filter(tela => {
        const base = [tela.rotulo, tela.secao, ...(tela.termos ?? [])].join(' ')
        return normalizar(base).includes(termo)
      })
      .slice(0, 8)
  }, [busca, telas])

  function irParaTela(tela) {
    setBusca('')
    setAberto(false)
    navigate(tela.rota)
  }

  function aoEnviar(evento) {
    evento.preventDefault()
    if (resultados[0]) irParaTela(resultados[0])
  }

  useEffect(() => {
    if (!aberto) return

    function aoClicarFora(evento) {
      if (buscaRef.current && !buscaRef.current.contains(evento.target)) {
        setAberto(false)
      }
    }

    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [aberto])

  return (
    <header
      className="sticky top-0 z-[4] h-16 flex items-center gap-4 px-7 border-b border-[var(--linha-suave)]"
      style={{
        background: 'var(--fundo-0)',
        backdropFilter: 'blur(20px) saturate(140%)',
        borderColor: 'var(--linha-suave)',
      }}
    >
      <Botao
        variante="fantasma"
        icone
        className="botao-menu-mobile w-10 h-10 shrink-0"
        onClick={onAbrirMenu}
        aria-label="Abrir menu"
      >
        <Menu size={17} />
      </Botao>

      <div className="trilha-cabecalho flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--texto-3)]">
        <span>{meta.secao}</span>
        <span className="opacity-50">/</span>
        <strong className="text-[var(--texto-0)] font-semibold">{meta.rotulo ?? meta.titulo}</strong>
      </div>

      <div className="flex-1" />

      <div className="acoes-cabecalho flex items-center gap-3">
        <form
          ref={buscaRef}
          onSubmit={aoEnviar}
          className="busca-cabecalho relative flex items-center h-[34px] px-3 gap-2 rounded-[9px] border border-[var(--linha)] w-64"
          style={{ background: 'var(--fundo-2)' }}
        >
          <Search size={14} className="text-[var(--texto-2)] shrink-0" />
          <input
            data-busca-global
            className="bg-transparent border-0 outline-none flex-1 text-[13px] text-[var(--texto-0)] placeholder:text-[var(--texto-3)]"
            placeholder="Buscar telas..."
            aria-label="Buscar telas"
            value={busca}
            onChange={evento => {
              setBusca(evento.target.value)
              setAberto(true)
            }}
            onFocus={() => setAberto(true)}
            onKeyDown={evento => {
              if (evento.key === 'Escape') {
                setAberto(false)
                evento.currentTarget.blur()
              }
            }}
          />
          {aberto && resultados.length > 0 && (
            <div
              className="absolute left-0 right-0 top-[calc(100%+8px)] rounded-[12px] border border-[var(--linha-suave)] overflow-hidden z-50"
              style={{ background: 'var(--fundo-1)', boxShadow: 'var(--sombra-md)' }}
            >
              {resultados.map(tela => {
                const Icone = tela.Icone
                return (
                  <button
                    key={tela.id}
                    type="button"
                    onMouseDown={evento => evento.preventDefault()}
                    onClick={() => irParaTela(tela)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[var(--fundo-2)] transition-colors"
                  >
                    <Icone size={14} className="text-[var(--texto-2)]" />
                    <span className="text-[13px] text-[var(--texto-0)]">{tela.rotulo}</span>
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--texto-3)]">
                      {tela.secao}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </form>

        <PainelAcessibilidade />
        <PainelNotificacoes />

        <Botao
          variante="fantasma"
          icone
          className="w-10 h-10 shrink-0"
          onClick={alternarTema}
          aria-label="Alternar tema"
        >
          {tema === 'escuro' ? <Sun size={15} /> : <Moon size={15} />}
        </Botao>

      </div>
    </header>
  )
}
