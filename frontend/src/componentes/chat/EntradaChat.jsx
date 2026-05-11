import { useRef } from 'react'
import { Mic, Send } from 'lucide-react'
import Botao from '@/componentes/ui/Botao'

const sugestoes = [
  'Quanto vendi hoje?',
  'Compare margem por produto',
  'Funcionários ativos',
  'Clientes com fiado em aberto',
]

export default function EntradaChat({ valor, onChange, onEnviar, desabilitado }) {
  const refTextarea = useRef(null)

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onEnviar()
    }
  }

  function handleSugestao(texto) {
    onChange(texto)
    onEnviar(texto)
  }

  return (
    <div
      className="border-t border-[var(--linha-suave)] px-7 pb-6 pt-[18px]"
      style={{ background: 'oklch(0.18 0.012 90 / 0.6)', backdropFilter: 'blur(20px)' }}
    >
      {/* Sugestões */}
      <div className="max-w-[880px] mx-auto flex gap-2 flex-wrap mb-2.5">
        {sugestoes.map(s => (
          <button
            key={s}
            onClick={() => handleSugestao(s)}
            className="text-[12px] px-[11px] py-1.5 rounded-full border border-[var(--linha-suave)] bg-[var(--fundo-2)] text-[var(--texto-1)] transition-all duration-180 hover:border-musgo-400 hover:text-[var(--texto-0)] hover:bg-[var(--acento-suave)]"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Campo de entrada */}
      <div
        className="max-w-[880px] mx-auto flex items-end gap-2.5 px-3 py-2.5 rounded-[14px] border border-[var(--linha)] transition-all duration-200 focus-within:border-musgo-400 focus-within:shadow-[0_0_0_4px_oklch(0.48_0.07_145/0.15),0_8px_24px_oklch(0_0_0/0.25)]"
        style={{ background: 'var(--fundo-1)' }}
      >
        <textarea
          ref={refTextarea}
          rows={1}
          value={valor}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte sobre vendas, clientes, estoque..."
          disabled={desabilitado}
          className="flex-1 bg-transparent border-0 outline-none resize-none min-h-[22px] max-h-[140px] text-[14px] text-[var(--texto-0)] placeholder:text-[var(--texto-3)] py-1 leading-[1.5]"
        />
        <Botao variante="fantasma" icone>
          <Mic size={14} />
        </Botao>
        <Botao
          variante="primario"
          onClick={() => onEnviar()}
          disabled={!valor.trim() || desabilitado}
        >
          <Send size={13} />
          Enviar
        </Botao>
      </div>
    </div>
  )
}
