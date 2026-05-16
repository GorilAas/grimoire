import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AcessibilidadeContexto = createContext(null)

const CHAVE_CONFIG = 'fresquim_acessibilidade'

const NIVEIS_FONTE = [
  { id: 'normal', rotulo: 'Normal', escala: 1 },
  { id: 'grande', rotulo: 'Grande', escala: 1.12 },
  { id: 'extra', rotulo: 'Extra grande', escala: 1.24 },
]

function carregarConfiguracao() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CONFIG) || '{}')
  } catch {
    return {}
  }
}

function salvarConfiguracao(configuracao) {
  localStorage.setItem(CHAVE_CONFIG, JSON.stringify(configuracao))
}

function obterTextoDaTela() {
  const conteudo = document.querySelector('#conteudo-principal')
  const texto = conteudo?.innerText || document.body.innerText || ''
  return texto
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3500)
}

export function AcessibilidadeProvider({ children }) {
  const inicial = carregarConfiguracao()
  const [nivelFonte, setNivelFonte] = useState(inicial.nivelFonte || 'normal')
  const [altoContraste, setAltoContraste] = useState(Boolean(inicial.altoContraste))
  const [lendo, setLendo] = useState(false)
  const [avisoLeitor, setAvisoLeitor] = useState('')
  const [painelAtalhosAberto, setPainelAtalhosAberto] = useState(false)

  const nivelAtual = useMemo(
    () => NIVEIS_FONTE.find(nivel => nivel.id === nivelFonte) || NIVEIS_FONTE[0],
    [nivelFonte],
  )

  useEffect(() => {
    document.documentElement.dataset.fonte = nivelAtual.id
    document.documentElement.style.setProperty('--escala-interface', String(nivelAtual.escala))
  }, [nivelAtual])

  useEffect(() => {
    document.documentElement.dataset.contraste = altoContraste ? 'alto' : 'normal'
  }, [altoContraste])

  useEffect(() => {
    salvarConfiguracao({ nivelFonte, altoContraste })
  }, [nivelFonte, altoContraste])

  const anunciar = useCallback((mensagem) => {
    setAvisoLeitor('')
    window.setTimeout(() => setAvisoLeitor(mensagem), 20)
  }, [])

  const alterarFonte = useCallback((novoNivel) => {
    setNivelFonte(novoNivel)
    const nivel = NIVEIS_FONTE.find(item => item.id === novoNivel)
    anunciar(`Tamanho da fonte alterado para ${nivel?.rotulo || 'normal'}.`)
  }, [anunciar])

  const aumentarFonte = useCallback(() => {
    setNivelFonte(atual => {
      const indice = NIVEIS_FONTE.findIndex(nivel => nivel.id === atual)
      const proximo = NIVEIS_FONTE[Math.min(NIVEIS_FONTE.length - 1, indice + 1)] || NIVEIS_FONTE[0]
      anunciar(`Tamanho da fonte alterado para ${proximo.rotulo}.`)
      return proximo.id
    })
  }, [anunciar])

  const diminuirFonte = useCallback(() => {
    setNivelFonte(atual => {
      const indice = NIVEIS_FONTE.findIndex(nivel => nivel.id === atual)
      const anterior = NIVEIS_FONTE[Math.max(0, indice - 1)] || NIVEIS_FONTE[0]
      anunciar(`Tamanho da fonte alterado para ${anterior.rotulo}.`)
      return anterior.id
    })
  }, [anunciar])

  const restaurarFonte = useCallback(() => {
    setNivelFonte('normal')
    anunciar('Tamanho da fonte restaurado para normal.')
  }, [anunciar])

  const alternarContraste = useCallback(() => {
    setAltoContraste(atual => {
      const novoValor = !atual
      anunciar(novoValor ? 'Alto contraste ativado.' : 'Alto contraste desativado.')
      return novoValor
    })
  }, [anunciar])

  const pararLeitura = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setLendo(false)
    anunciar('Leitura interrompida.')
  }, [anunciar])

  const abrirPainelAtalhos = useCallback(() => {
    setPainelAtalhosAberto(true)
    anunciar('Painel de atalhos aberto.')
  }, [anunciar])

  const fecharPainelAtalhos = useCallback(() => {
    setPainelAtalhosAberto(false)
  }, [])

  const alternarPainelAtalhos = useCallback(() => {
    setPainelAtalhosAberto(atual => {
      const novoValor = !atual
      anunciar(novoValor ? 'Painel de atalhos aberto.' : 'Painel de atalhos fechado.')
      return novoValor
    })
  }, [anunciar])

  const lerTexto = useCallback((texto) => {
    if (!('speechSynthesis' in window)) {
      anunciar('Leitura por voz não está disponível neste navegador.')
      return
    }

    const conteudo = texto?.trim()
    if (!conteudo) {
      anunciar('Não há conteúdo para ler nesta tela.')
      return
    }

    window.speechSynthesis.cancel()
    const fala = new SpeechSynthesisUtterance(conteudo)
    fala.lang = 'pt-BR'
    fala.rate = 0.95
    fala.pitch = 1
    fala.onstart = () => {
      setLendo(true)
      anunciar('Leitura iniciada.')
    }
    fala.onend = () => setLendo(false)
    fala.onerror = () => {
      setLendo(false)
      anunciar('Não foi possível concluir a leitura por voz.')
    }
    window.speechSynthesis.speak(fala)
  }, [anunciar])

  const lerTelaAtual = useCallback(() => {
    lerTexto(obterTextoDaTela())
  }, [lerTexto])

  const valor = {
    niveisFonte: NIVEIS_FONTE,
    nivelFonte,
    nivelAtual,
    altoContraste,
    lendo,
    avisoLeitor,
    painelAtalhosAberto,
    anunciar,
    alterarFonte,
    aumentarFonte,
    diminuirFonte,
    restaurarFonte,
    alternarContraste,
    lerTexto,
    lerTelaAtual,
    pararLeitura,
    abrirPainelAtalhos,
    fecharPainelAtalhos,
    alternarPainelAtalhos,
  }

  return (
    <AcessibilidadeContexto.Provider value={valor}>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {avisoLeitor}
      </div>
    </AcessibilidadeContexto.Provider>
  )
}

export function useAcessibilidade() {
  const contexto = useContext(AcessibilidadeContexto)
  if (!contexto) {
    throw new Error('useAcessibilidade deve ser usado dentro de AcessibilidadeProvider')
  }
  return contexto
}
