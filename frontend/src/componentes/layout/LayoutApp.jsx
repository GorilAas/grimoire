import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Cabecalho from './Cabecalho'
import AtalhosTeclado from '@/componentes/acessibilidade/AtalhosTeclado'

export default function LayoutApp() {
  const [tema, setTema] = useState('escuro')
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-tema', tema)
  }, [tema])

  function alternarTema() {
    setTema(t => (t === 'escuro' ? 'claro' : 'escuro'))
  }

  return (
    <div className="app-shell">
      <a href="#conteudo-principal" className="atalho-pular">
        Pular para o conteúdo principal
      </a>
      <AtalhosTeclado />

      {menuMobileAberto && (
        <button
          type="button"
          className="menu-mobile-fundo"
          aria-label="Fechar menu"
          onClick={() => setMenuMobileAberto(false)}
        />
      )}

      <Sidebar
        abertoMobile={menuMobileAberto}
        onFecharMobile={() => setMenuMobileAberto(false)}
      />

      <div className="flex flex-col min-w-0">
        <Cabecalho
          tema={tema}
          alternarTema={alternarTema}
          onAbrirMenu={() => setMenuMobileAberto(true)}
        />
        <main id="conteudo-principal" className="flex-1" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
