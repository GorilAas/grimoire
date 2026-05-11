import { Camera, WifiOff } from 'lucide-react'
import CabecalhoPagina from '@/componentes/ui/CabecalhoPagina'
import Chip from '@/componentes/ui/Chip'

const CAMERAS = [
  { rotulo: 'Caixa Principal', demo: true  },
  { rotulo: 'Entrada',         demo: false },
  { rotulo: 'Estoque',         demo: false },
  { rotulo: 'Cozinha',         demo: false },
]

function FeedCamera({ rotulo, demo }) {
  return (
    <div className="relative rounded-[14px] overflow-hidden border border-[var(--linha-suave)] aspect-video group"
      style={{ background: 'oklch(0.12 0.01 90)' }}
    >
      {demo ? (
        <video
          className="w-full h-full object-cover"
          src="/cameras/demo.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        /* Simulação de câmera offline */
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, oklch(1 0 0), oklch(1 0 0) 1px, transparent 1px, transparent 4px)',
            }}
          />
          <WifiOff size={22} className="text-[var(--texto-3)]" />
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--texto-3)]">
            Sem sinal
          </span>
        </div>
      )}

      {/* HUD superior */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-3.5 py-2.5 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, oklch(0 0 0 / 0.65), transparent)' }}
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/90">
          {rotulo}
        </span>
        <div className="flex items-center gap-1.5">
          {demo && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
          <span className="font-mono text-[9.5px] tracking-[0.08em] text-white/60">
            {demo ? 'AO VIVO' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* HUD inferior */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3.5 py-2.5 pointer-events-none"
        style={{ background: 'linear-gradient(to top, oklch(0 0 0 / 0.65), transparent)' }}
      >
        <span className="font-mono text-[9.5px] text-white/40">
          {new Date().toLocaleDateString('pt-BR')}
        </span>
        <Camera size={11} className="text-white/30" />
      </div>
    </div>
  )
}

export default function Cameras() {
  const aoVivo = CAMERAS.filter(c => c.demo).length
  const offline = CAMERAS.length - aoVivo

  return (
    <div className="pagina-entrada p-7 flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <CabecalhoPagina
          titulo="Câmeras"
          subtitulo="Monitoramento em tempo real das dependências"
        />
        <div className="flex items-center gap-2">
          <Chip variante="ok">
            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block mr-1.5" />
            {aoVivo} ao vivo
          </Chip>
          <Chip variante="mudo">{offline} offline</Chip>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {CAMERAS.map(cam => (
          <FeedCamera key={cam.rotulo} {...cam} />
        ))}
      </div>
    </div>
  )
}
