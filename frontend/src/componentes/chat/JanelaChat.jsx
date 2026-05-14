import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contextos/AuthContexto'
import ListaMensagens from './ListaMensagens'
import EntradaChat from './EntradaChat'
import chatServico from '@/servicos/chatServico'

function horaAtual() {
  const agora = new Date()
  return `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
}

function extrairTextoParaHistorico(blocos) {
  if (!blocos) return ''
  const textos = blocos.filter(b => b.tipo === 'texto').map(b => b.conteudo)
  if (textos.length) return textos.join(' ')
  const tipos = blocos.map(b => b.tipo).join(', ')
  return `[resposta com ${tipos}]`
}

export default function JanelaChat() {
  const { usuario } = useAuth()
  const [mensagens,    setMensagens]    = useState([])
  const [entrada,      setEntrada]      = useState('')
  const [carregando,   setCarregando]   = useState(false)
  const [historicoApi, setHistoricoApi] = useState([])
  const refScroll = useRef(null)

  useEffect(() => {
    if (refScroll.current) {
      refScroll.current.scrollTop = refScroll.current.scrollHeight
    }
  }, [mensagens, carregando])

  async function enviar(textoDireto) {
    const texto = (textoDireto ?? entrada).trim()
    if (!texto || carregando) return

    const hora = horaAtual()
    const msgUsuario = { papel: 'usuario', conteudo: texto, hora }

    setMensagens(prev => [...prev, msgUsuario])
    setEntrada('')
    setCarregando(true)

    try {
      const resposta = await chatServico.enviar(texto, historicoApi)
      const blocos = resposta.data?.blocos ?? [{ tipo: 'texto', conteudo: 'Resposta vazia.' }]

      const msgAssistente = { papel: 'assistente', hora: horaAtual(), blocos }
      setMensagens(prev => [...prev, msgAssistente])

      setHistoricoApi(prev => [
        ...prev,
        { papel: 'usuario',    conteudo: texto },
        { papel: 'assistente', conteudo: extrairTextoParaHistorico(blocos) },
      ])
    } catch {
      const msgErro = {
        papel: 'assistente',
        hora: horaAtual(),
        blocos: [{ tipo: 'texto', conteudo: 'Erro ao conectar com o assistente. Verifique a conexão com o backend.' }],
      }
      setMensagens(prev => [...prev, msgErro])
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-116px)] sm:h-[calc(100vh-64px)]">
      <div ref={refScroll} className="flex-1 overflow-y-auto py-4 sm:py-7">
        <div className="max-w-[880px] mx-auto px-3 sm:px-7">
          {mensagens.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <p className="text-[15px] font-semibold text-[var(--texto-0)]">
                Olá{usuario?.nome ? `, ${usuario.nome.split(' ')[0]}` : ''}!
              </p>
              <p className="text-[13px] text-[var(--texto-3)] max-w-[420px] leading-relaxed">
                Pergunte sobre vendas, estoque, clientes ou qualquer dado do sistema. O assistente consulta o banco em tempo real.
              </p>
            </div>
          )}
          <ListaMensagens mensagens={mensagens} digitando={carregando} />
        </div>
      </div>
      <EntradaChat
        valor={entrada}
        onChange={setEntrada}
        onEnviar={enviar}
        desabilitado={carregando}
      />
    </div>
  )
}
