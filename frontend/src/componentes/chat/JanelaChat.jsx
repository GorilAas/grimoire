import { useState, useRef, useEffect } from 'react'
import ListaMensagens from './ListaMensagens'
import EntradaChat from './EntradaChat'

const sementeConversa = [
  {
    papel: 'usuario',
    conteudo: 'Bom dia. Como foi a semana em vendas?',
    hora: '08:42',
  },
  {
    papel: 'assistente',
    hora: '08:42',
    blocos: [
      {
        tipo: 'texto',
        conteudo: 'Bom dia! Ainda estou conectando aos dados reais do backend. Assim que o sistema estiver integrado, vou responder com **gráficos e métricas ao vivo**. Por enquanto, use os módulos de Vendas e Clientes para consultas.',
      },
    ],
  },
]

function gerarResposta(pergunta) {
  const p = pergunta.toLowerCase()

  if (p.includes('hoje') || p.includes('vendi')) {
    return {
      blocos: [
        { tipo: 'texto', conteudo: 'Aqui está um resumo do dia (dados de exemplo — integração em andamento):' },
        {
          tipo: 'kpis',
          itens: [
            { rotulo: 'Receita do dia',  valor: 'R$ 1.840,00', delta: 6.4,  rotuloReferencia: 'vs. ontem', sparkline: [180, 220, 280, 320, 360, 400, 420] },
            { rotulo: 'Tickets',         valor: '34',           delta: 3.1,  rotuloReferencia: 'vs. ontem', sparkline: [20, 24, 28, 30, 32, 33, 34] },
            { rotulo: 'Ticket médio',    valor: 'R$ 54,12',     delta: 2.4,  rotuloReferencia: 'vs. ontem', sparkline: [48, 50, 52, 53, 53, 54, 54] },
            { rotulo: 'Fiado em aberto', valor: '3',            delta: -1.0, rotuloReferencia: 'vs. ontem', sparkline: [2, 3, 4, 3, 4, 3, 3] },
          ],
        },
      ],
    }
  }

  if (p.includes('margem') || p.includes('produto')) {
    return {
      blocos: [
        { tipo: 'texto', conteudo: 'Margem aproximada por produto (dados de exemplo):' },
        {
          tipo: 'grafico_barras',
          titulo: 'Margem bruta estimada por produto',
          dados: [
            { rotulo: 'Café Espresso', valor: 80 },
            { rotulo: 'Pão Francês',   valor: 68 },
            { rotulo: 'Brigadeiro',    valor: 70 },
            { rotulo: 'Croissant',     valor: 62 },
            { rotulo: 'Coxinha',       valor: 65 },
          ],
        },
      ],
    }
  }

  if (p.includes('funcionario') || p.includes('funcionários')) {
    return {
      blocos: [
        { tipo: 'texto', conteudo: 'Para ver os **funcionários ativos** e seus dados, acesse a página de Funcionários no menu lateral.' },
      ],
    }
  }

  if (p.includes('fiado') || p.includes('cliente')) {
    return {
      blocos: [
        { tipo: 'texto', conteudo: 'Clientes com **fiado em aberto** podem ser consultados diretamente na página de Clientes, onde você vê o saldo devedor de cada um.' },
      ],
    }
  }

  return {
    blocos: [
      {
        tipo: 'texto',
        conteudo: 'Posso ajudar com **vendas, clientes, produtos e funcionários**. Tente perguntar sobre *"quanto vendi hoje"*, *"margem por produto"* ou use os módulos no menu lateral.',
      },
    ],
  }
}

export default function JanelaChat() {
  const [mensagens, setMensagens] = useState(sementeConversa)
  const [entrada, setEntrada] = useState('')
  const [digitando, setDigitando] = useState(false)
  const refScroll = useRef(null)

  useEffect(() => {
    if (refScroll.current) {
      refScroll.current.scrollTop = refScroll.current.scrollHeight
    }
  }, [mensagens, digitando])

  function enviar(textoDirecto) {
    const texto = (textoDirecto ?? entrada).trim()
    if (!texto) return

    const agora = new Date()
    const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`

    setMensagens(prev => [...prev, { papel: 'usuario', conteudo: texto, hora }])
    setEntrada('')
    setDigitando(true)

    setTimeout(() => {
      const resposta = gerarResposta(texto)
      setMensagens(prev => [...prev, { papel: 'assistente', hora, ...resposta }])
      setDigitando(false)
    }, 1100)
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <div ref={refScroll} className="flex-1 overflow-y-auto py-7">
        <div className="max-w-[880px] mx-auto px-7">
          <ListaMensagens mensagens={mensagens} digitando={digitando} />
        </div>
      </div>
      <EntradaChat
        valor={entrada}
        onChange={setEntrada}
        onEnviar={enviar}
        desabilitado={digitando}
      />
    </div>
  )
}
