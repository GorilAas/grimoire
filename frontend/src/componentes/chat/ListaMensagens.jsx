import { Sparkles } from 'lucide-react'
import BolhaMensagem from './BolhaMensagem'

function DigitandoIndicador() {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: '32px 1fr' }}>
      <div
        className="w-8 h-8 rounded-[9px] grid place-items-center"
        style={{ background: 'linear-gradient(135deg, var(--acento-forte), oklch(0.32 0.05 145))', color: 'var(--fundo-0)' }}
      >
        <Sparkles size={14} />
      </div>
      <div>
        <div className="text-[13px] font-semibold text-[var(--texto-0)] mb-1.5">
          Assistente FresQUIM
        </div>
        <div className="flex gap-1 items-center py-2">
          <span className="ponto-digitando" />
          <span className="ponto-digitando" />
          <span className="ponto-digitando" />
        </div>
      </div>
    </div>
  )
}

export default function ListaMensagens({ mensagens, digitando }) {
  return (
    <div className="flex flex-col gap-6">
      {mensagens.map((msg, i) => (
        <BolhaMensagem key={i} mensagem={msg} />
      ))}
      {digitando && <DigitandoIndicador />}
    </div>
  )
}
