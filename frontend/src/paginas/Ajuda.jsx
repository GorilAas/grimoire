import CabecalhoPagina from '@/componentes/ui/CabecalhoPagina'
import Cartao from '@/componentes/ui/Cartao'

const TOPICOS = [
  {
    titulo: 'Dashboard',
    objetivo: 'Acompanhe as vendas do dia, o status do caixa e os alertas de estoque em tempo real.',
    passos: [
      'Os 4 cards no topo mostram receita do dia, total de tickets, ticket médio e fiado em aberto.',
      'O painel de estoque abaixo do mínimo lista os produtos que precisam de reposição urgente.',
      'Os gráficos mostram receita por hora e distribuição por forma de pagamento.',
      'Use o botão Atualizar para buscar os dados mais recentes sem recarregar a página.',
    ],
    imagens: ['/imagens/ajuda/dashboard.png'],
  },
  {
    titulo: 'Vendas',
    objetivo: 'Registre vendas, consulte o histórico, gerencie fiado em aberto e cancele quando necessário.',
    passos: [
      'Clique em Nova venda e preencha: funcionário responsável, forma de pagamento, cliente (se houver) e produtos.',
      'Para venda fiado, selecione a aba Fiado em aberto — ela mostra o total de vendas pendentes.',
      'Na lista de vendas, cada linha mostra data, cliente, forma de pagamento, total e status (Paga, Fiado, Cancelada).',
      'Para cancelar uma venda, clique no ícone X da linha — o estoque é estornado automaticamente.',
    ],
    imagens: ['/imagens/ajuda/venda1.png', '/imagens/ajuda/venda2.png'],
  },
  {
    titulo: 'Produtos',
    objetivo: 'Cadastre produtos, organize por categoria, controle estoque e ajuste movimentações.',
    passos: [
      'Use os filtros de categoria no topo da página para navegar entre os grupos de produtos.',
      'Produtos com estoque abaixo do mínimo aparecem com ícone de alerta na coluna Estoque.',
      'No cadastro, informe preço de venda, preço de custo, estoque inicial e estoque mínimo.',
      'Use o botão de ajuste de estoque para registrar entradas e saídas com histórico.',
    ],
    imagens: ['/imagens/ajuda/produto1.png', '/imagens/ajuda/produto2.png'],
  },
  {
    titulo: 'Clientes e fiado',
    objetivo: 'Cadastre clientes, consulte saldo devedor, histórico de compras e gerencie fiado.',
    passos: [
      'Clique em Novo cliente e preencha nome, CPF, telefone, e-mail e endereço.',
      'A coluna Saldo devedor mostra o total em aberto de compras no fiado.',
      'Clique em qualquer linha da tabela para ver o histórico completo de compras do cliente.',
      'Clientes negativados aparecem com o chip em vermelho na coluna Negativado.',
    ],
    imagens: ['/imagens/ajuda/cliente1.png', '/imagens/ajuda/clientes2.png'],
  },
  {
    titulo: 'Funcionários e acessos',
    objetivo: 'Cadastre funcionários, defina cargos, crie logins e controle quais telas cada um pode acessar.',
    passos: [
      'Cadastre o funcionário com nome, cargo, telefone, data de nascimento e carga horária diária.',
      'Após o cadastro, clique na chave para criar o acesso ao sistema com e-mail e senha.',
      'No modal de acesso, defina o perfil (Gerente, Atendente, Padeiro) e marque as telas permitidas.',
      'Use Revogar acesso para bloquear o login de um funcionário sem excluir o cadastro.',
    ],
    imagens: ['/imagens/ajuda/funcionario3.png', '/imagens/ajuda/funcionario2.png'],
  },
  {
    titulo: 'Ponto eletrônico',
    objetivo: 'Registre entradas e saídas, acompanhe horas trabalhadas e o saldo da semana.',
    passos: [
      'Selecione o funcionário (admins e gerentes podem consultar qualquer um).',
      'Clique em Registrar Entrada ao começar o expediente e Registrar Saída ao terminar.',
      'O painel da direita mostra o saldo acumulado da semana em horas extras ou horas a compensar.',
      'Cada dia da semana aparece com uma barra proporcional às horas trabalhadas.',
    ],
    imagens: ['/imagens/ajuda/ponto.png'],
  },
  {
    titulo: 'Caixa',
    objetivo: 'Abra e feche o caixa do dia, informe o fundo de troco e acompanhe o histórico.',
    passos: [
      'Antes de iniciar as vendas, abra o caixa com o valor do fundo de troco disponível.',
      'Ao fechar o expediente, informe o valor contado em caixa e confirme o fechamento.',
      'O histórico na lateral mostra todos os caixas abertos e fechados com data e operador.',
      'Registre observações no fechamento quando houver divergência entre o esperado e o contado.',
    ],
    imagens: ['/imagens/ajuda/caixa.png'],
  },
]

export default function Ajuda() {
  return (
    <div className="pagina-entrada p-7 flex flex-col gap-6 max-w-[1200px] mx-auto">
      <CabecalhoPagina
        titulo="Ajuda"
        subtitulo="Wiki interna de uso do Pão FresQUIM"
      />

      <div className="flex flex-col gap-6">
        {TOPICOS.map(topico => (
          <Cartao key={topico.titulo} className="overflow-hidden">

            <div className={[
              'grid gap-0',
              topico.imagens.length === 2 ? 'grid-cols-2' : 'grid-cols-1',
            ].join(' ')}>
              {topico.imagens.map((src, i) => (
                <div
                  key={src}
                  className={[
                    'overflow-hidden',
                    topico.imagens.length === 2 && i === 0 ? 'border-r border-[var(--linha-suave)]' : '',
                  ].join(' ')}
                  style={{ background: 'oklch(0.1 0.01 90)' }}
                >
                  <img
                    src={src}
                    alt={`${topico.titulo} — tela ${i + 1}`}
                    className="w-full h-auto block"
                    style={{ maxHeight: '340px', objectFit: 'cover', objectPosition: 'top' }}
                  />
                </div>
              ))}
            </div>


            <div className="p-5 border-t border-[var(--linha-suave)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:gap-8">
                <div className="lg:w-[260px] shrink-0">
                  <h3 className="text-[15px] font-semibold text-[var(--texto-0)]">{topico.titulo}</h3>
                  <p className="text-[13px] text-[var(--texto-2)] mt-1 leading-relaxed">{topico.objetivo}</p>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {topico.passos.map((passo, i) => (
                    <div key={i} className="flex gap-2.5 text-[12.5px] text-[var(--texto-1)] leading-relaxed">
                      <span className="font-mono text-[10px] text-[var(--acento)] font-bold mt-0.5 shrink-0 w-4">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{passo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Cartao>
        ))}
      </div>
    </div>
  )
}
