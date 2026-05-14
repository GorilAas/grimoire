import { useEffect, useRef } from 'react'
import { Accessibility, ALargeSmall, Contrast, Keyboard, Volume2, VolumeX, X } from 'lucide-react'
import Botao from '@/componentes/ui/Botao'
import { useAcessibilidade } from '@/contextos/AcessibilidadeContexto'

const ATALHOS = [
  ['F9', 'Abrir atalhos'],
  ['+', 'Aumentar fonte'],
  ['-', 'Diminuir fonte'],
  ['N', 'Fonte normal'],
  ['C', 'Alto contraste'],
  ['L', 'Ler tela atual'],
  ['B', 'Buscar no painel'],
  ['Esc', 'Parar leitura'],
  ['1', 'Dashboard'],
  ['2', 'Vendas'],
  ['3', 'Produtos'],
  ['4', 'Clientes'],
  ['5', 'Ponto'],
]

export default function PainelAcessibilidade() {
  const painelRef = useRef(null)
  const {
    niveisFonte,
    nivelFonte,
    altoContraste,
    lendo,
    alterarFonte,
    alternarContraste,
    lerTelaAtual,
    pararLeitura,
    painelAtalhosAberto,
    alternarPainelAtalhos,
    fecharPainelAtalhos,
  } = useAcessibilidade()
  const aberto = painelAtalhosAberto

  useEffect(() => {
    if (!aberto) return
    function aoClicarFora(evento) {
      if (painelRef.current && !painelRef.current.contains(evento.target)) {
        fecharPainelAtalhos()
      }
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [aberto, fecharPainelAtalhos])

  useEffect(() => {
    if (!aberto) return
    function aoPressionar(evento) {
      if (evento.key === 'Escape') fecharPainelAtalhos()
    }
    document.addEventListener('keydown', aoPressionar)
    return () => document.removeEventListener('keydown', aoPressionar)
  }, [aberto, fecharPainelAtalhos])

  return (
    <div className="relative" ref={painelRef}>
      <Botao
        variante={aberto ? 'secundario' : 'fantasma'}
        icone
        className="w-10 h-10 shrink-0"
        onClick={alternarPainelAtalhos}
        aria-label="Abrir recursos de acessibilidade"
        aria-expanded={aberto}
      >
        <Accessibility size={17} />
      </Botao>

      {aberto && (
        <div
          className="fixed left-3 right-3 top-[116px] max-h-[calc(100dvh-132px)] rounded-[16px] border border-[var(--linha-suave)] overflow-hidden z-50 sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+8px)] sm:w-[380px] sm:max-h-none"
          style={{ background: 'var(--fundo-1)', boxShadow: 'var(--sombra-md)' }}
          role="dialog"
          aria-label="Painel de acessibilidade"
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--linha-suave)]">
            <div className="flex items-center gap-2">
              <Accessibility size={14} className="text-[var(--acento)]" />
              <span className="text-[14px] font-semibold text-[var(--texto-0)]">Acessibilidade</span>
            </div>
            <button
              onClick={fecharPainelAtalhos}
              className="w-7 h-7 flex items-center justify-center rounded-[7px] text-[var(--texto-3)] hover:text-[var(--texto-0)] hover:bg-[var(--fundo-2)] transition-all"
              aria-label="Fechar painel de acessibilidade"
            >
              <X size={13} />
            </button>
          </div>

          <div className="p-3 sm:p-4 flex flex-col gap-4 max-h-[calc(100dvh-210px)] sm:max-h-[70vh] overflow-y-auto">
            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <ALargeSmall size={14} className="text-[var(--acento)]" />
                <h3 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)]">
                  Tamanho da fonte
                </h3>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {niveisFonte.map(nivel => (
                  <button
                    key={nivel.id}
                    onClick={() => alterarFonte(nivel.id)}
                    className={[
                      'h-9 rounded-[8px] border text-[12px] font-semibold transition-all',
                      nivelFonte === nivel.id
                        ? 'bg-[var(--acento-suave)] border-[var(--acento)] text-[var(--texto-0)]'
                        : 'border-[var(--linha-suave)] text-[var(--texto-2)] hover:text-[var(--texto-0)] hover:bg-[var(--fundo-2)]',
                    ].join(' ')}
                  >
                    {nivel.rotulo}
                  </button>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={alternarContraste}
                className={[
                  'min-h-[72px] rounded-[10px] border p-3 text-left transition-all',
                  altoContraste
                    ? 'bg-[var(--acento-suave)] border-[var(--acento)]'
                    : 'bg-[var(--fundo-2)] border-[var(--linha-suave)] hover:border-[var(--linha)]',
                ].join(' ')}
              >
                <Contrast size={15} className="text-[var(--acento)] mb-2" />
                <p className="text-[13px] font-semibold text-[var(--texto-0)]">Alto contraste</p>
                <p className="text-[11px] text-[var(--texto-3)]">{altoContraste ? 'Ativado' : 'Desativado'}</p>
              </button>

              <button
                onClick={lendo ? pararLeitura : lerTelaAtual}
                className="min-h-[72px] rounded-[10px] border p-3 text-left transition-all bg-[var(--fundo-2)] border-[var(--linha-suave)] hover:border-[var(--linha)]"
              >
                {lendo ? (
                  <VolumeX size={15} className="text-[var(--negativo)] mb-2" />
                ) : (
                  <Volume2 size={15} className="text-[var(--acento)] mb-2" />
                )}
                <p className="text-[13px] font-semibold text-[var(--texto-0)]">
                  {lendo ? 'Parar leitura' : 'Ler tela'}
                </p>
                <p className="text-[11px] text-[var(--texto-3)]">Voz do navegador</p>
              </button>
            </section>

            <section className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Keyboard size={14} className="text-[var(--acento)]" />
                <h3 className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--texto-3)]">
                  Atalhos de teclado
                </h3>
              </div>
              <p className="text-[12px] text-[var(--texto-3)] leading-relaxed">
                Aperte F9 para abrir este painel. Com ele aberto, use as teclas abaixo.
              </p>
              <div className="grid grid-cols-1 gap-1.5">
                {ATALHOS.map(([atalho, descricao]) => (
                  <div
                    key={atalho}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-[8px] bg-[var(--fundo-2)] border border-[var(--linha-suave)]"
                  >
                    <span className="text-[12px] text-[var(--texto-1)]">{descricao}</span>
                    <kbd className="font-mono text-[10px] text-[var(--texto-0)] bg-[var(--fundo-3)] border border-[var(--linha)] rounded px-1.5 py-0.5">
                      {atalho}
                    </kbd>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
