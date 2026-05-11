import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAcessibilidade } from '@/contextos/AcessibilidadeContexto'

function estaDigitando(evento) {
  const tag = evento.target?.tagName?.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || evento.target?.isContentEditable
}

export default function AtalhosTeclado() {
  const navigate = useNavigate()
  const {
    aumentarFonte,
    diminuirFonte,
    restaurarFonte,
    alternarContraste,
    lerTelaAtual,
    pararLeitura,
    anunciar,
    painelAtalhosAberto,
    alternarPainelAtalhos,
    fecharPainelAtalhos,
  } = useAcessibilidade()

  useEffect(() => {
    function aoPressionarTecla(evento) {
      const tecla = evento.key.toLowerCase()

      if (tecla === 'escape') {
        pararLeitura()
        fecharPainelAtalhos()
        return
      }

      if (estaDigitando(evento)) return

      if (evento.key === 'F9' && !evento.ctrlKey && !evento.metaKey && !evento.altKey) {
        evento.preventDefault()
        alternarPainelAtalhos()
        return
      }

      if (!painelAtalhosAberto || evento.ctrlKey || evento.metaKey || evento.altKey) return

      const atalhos = {
        '+': aumentarFonte,
        '=': aumentarFonte,
        '-': diminuirFonte,
        n: restaurarFonte,
        c: alternarContraste,
        l: lerTelaAtual,
        b: () => {
          const campoBusca = document.querySelector('[data-busca-global]')
          campoBusca?.focus()
          anunciar('Busca global selecionada.')
        },
        1: () => navigate('/'),
        2: () => navigate('/vendas'),
        3: () => navigate('/produtos'),
        4: () => navigate('/clientes'),
        5: () => navigate('/ponto'),
      }

      const acao = atalhos[tecla]
      if (acao) {
        evento.preventDefault()
        acao()
      }
    }

    document.addEventListener('keydown', aoPressionarTecla)
    return () => document.removeEventListener('keydown', aoPressionarTecla)
  }, [
    aumentarFonte,
    diminuirFonte,
    restaurarFonte,
    alternarContraste,
    lerTelaAtual,
    pararLeitura,
    anunciar,
    painelAtalhosAberto,
    alternarPainelAtalhos,
    fecharPainelAtalhos,
    navigate,
  ])

  return null
}
