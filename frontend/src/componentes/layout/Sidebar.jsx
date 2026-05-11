import { NavLink, useNavigate } from 'react-router-dom'
import { HelpCircle, LogOut, Settings, X } from 'lucide-react'
import { useAuth } from '@/contextos/AuthContexto'
import { telasPermitidasParaUsuario } from '@/configuracao/telasSistema'

const ROTULOS_PERFIL = {
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  ATENDENTE: 'Atendente',
  PADEIRO: 'Padeiro',
}

function ItemNav({ rota, rotulo, Icone, badge, exato = false, onNavegar }) {
  const IconeItem = Icone
  return (
    <NavLink
      to={rota}
      end={exato}
      onClick={onNavegar}
      className={({ isActive }) => [
        'flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-[13px] font-medium transition-all duration-160 relative group',
        isActive
          ? 'bg-[var(--acento-suave)] text-[var(--texto-0)] shadow-[inset_0_0_0_1px_oklch(0.48_0.07_145/0.3)]'
          : 'text-[var(--texto-1)] hover:bg-[var(--fundo-2)] hover:text-[var(--texto-0)]',
      ].join(' ')}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute -left-3.5 top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-musgo-200 to-musgo-500 shadow-[0_0_8px_oklch(0.48_0.07_145/0.6)]" />
          )}
          <IconeItem
            size={16}
            strokeWidth={1.6}
            className={isActive ? 'text-[var(--acento-forte)]' : 'text-[var(--texto-2)]'}
          />
          <span className="flex-1">{rotulo}</span>
          {badge && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 bg-[var(--fundo-3)] rounded-full text-[var(--texto-1)]">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ abertoMobile = false, onFecharMobile }) {
  const { usuario, sair } = useAuth()
  const navigate = useNavigate()
  const telasUsuario = telasPermitidasParaUsuario(usuario)
  const telas = telasUsuario.filter(tela => !['ajuda', 'configuracoes'].includes(tela.id))
  const podeVerAjuda = telasUsuario.some(tela => tela.id === 'ajuda')
  const podeVerConfiguracoes = telasUsuario.some(tela => tela.id === 'configuracoes')
  const grupos = telas.reduce((acc, tela) => {
    acc[tela.secao] = [...(acc[tela.secao] ?? []), tela]
    return acc
  }, {})

  function handleSair() {
    sair()
    navigate('/login', { replace: true })
  }

  const iniciais = usuario?.nome
    ? usuario.nome.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
    : '?'

  return (
    <aside
      className={[
        'sidebar-app sticky top-0 h-screen flex flex-col px-3.5 py-[18px] border-r border-[var(--linha-suave)] z-[5]',
        abertoMobile && 'sidebar-app-aberta',
      ].filter(Boolean).join(' ')}
      style={{
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(18px) saturate(120%)',
      }}
    >
      <button
        type="button"
        className="botao-fechar-menu-mobile absolute top-4 right-4 w-8 h-8 rounded-[8px] place-items-center text-[var(--texto-2)] hover:text-[var(--texto-0)] hover:bg-[var(--fundo-2)]"
        onClick={onFecharMobile}
        aria-label="Fechar menu"
      >
        <X size={16} />
      </button>

      <NavLink
        to="/"
        onClick={onFecharMobile}
        className="flex items-center gap-2.5 pb-[18px] pr-12 px-2.5 mb-3.5 border-b border-[var(--linha-suave)] group outline-none"
        title="Ir para o Dashboard"
      >
        <div
          className="w-[30px] h-[30px] rounded-[9px] grid place-items-center font-mono font-bold text-[14px] tracking-[-0.04em] transition-transform duration-160 group-hover:scale-105"
          style={{
            background: 'var(--marca-bg)',
            color: 'var(--marca-texto)',
            boxShadow: 'var(--marca-sombra)',
          }}
        >
          PF
        </div>
        <div className="flex flex-col gap-px leading-none">
          <b className="text-[14px] font-bold tracking-[-0.02em]">
            Pão<em className="not-italic font-mono font-semibold text-[var(--acento)] tracking-[-0.04em]">FresQUIM</em>
          </b>
          <small className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--texto-3)]">
            Painel v1.0
          </small>
        </div>
      </NavLink>

      <nav className="flex flex-col gap-1 flex-1">
        {Object.entries(grupos).map(([secao, links], i) => (
          <div
            key={secao}
            className={[
              'flex flex-col gap-0.5 py-2',
              i > 0 && 'border-t border-[var(--linha-suave)] mt-1.5 pt-3.5',
            ].filter(Boolean).join(' ')}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--texto-3)] px-2.5 pb-1.5">
              {secao}
            </span>
            {links.map(link => (
              <ItemNav key={link.id} {...link} onNavegar={onFecharMobile} />
            ))}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-2 pt-3.5 border-t border-[var(--linha-suave)]">
        <div className="flex flex-col gap-0.5">
          {podeVerAjuda && (
            <NavLink
              to="/ajuda"
              onClick={onFecharMobile}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-[13px] font-medium text-[var(--texto-1)] hover:bg-[var(--fundo-2)] hover:text-[var(--texto-0)] transition-all duration-160"
            >
              <HelpCircle size={16} strokeWidth={1.6} className="text-[var(--texto-2)]" />
              Ajuda
            </NavLink>
          )}
          {podeVerConfiguracoes && (
            <NavLink
              to="/configuracoes"
              onClick={onFecharMobile}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-[13px] font-medium text-[var(--texto-1)] hover:bg-[var(--fundo-2)] hover:text-[var(--texto-0)] transition-all duration-160"
            >
              <Settings size={16} strokeWidth={1.6} className="text-[var(--texto-2)]" />
              Configurações
            </NavLink>
          )}
        </div>

        <div
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] border border-[var(--linha-suave)]"
          style={{ background: 'var(--fundo-2)' }}
        >
          <div
            className="w-[30px] h-[30px] rounded-full grid place-items-center font-mono font-bold text-[12px] shrink-0"
            style={{
              background: 'var(--marca-bg)',
              color: 'var(--marca-texto)',
            }}
          >
            {iniciais}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-[var(--texto-0)] leading-[1.1] truncate">
              {usuario?.nome ?? '-'}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--texto-3)]">
              {ROTULOS_PERFIL[usuario?.perfil] ?? usuario?.perfil ?? '-'}
            </div>
          </div>
          <button
            onClick={handleSair}
            title="Sair"
            className="text-[var(--texto-2)] hover:text-[var(--negativo)] transition-colors"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}

