import { BookOpen, Image, Video, CheckCircle2 } from 'lucide-react'
import CabecalhoPagina from '@/componentes/ui/CabecalhoPagina'
import Cartao from '@/componentes/ui/Cartao'

const TOPICOS = [
  {
    titulo: 'Dashboard',
    objetivo: 'Acompanhar vendas do dia, caixa aberto e alertas de estoque.',
    passos: [
      'Use Atualizar para buscar os dados mais recentes.',
      'Confira o card de estoque abaixo do mínimo antes de iniciar novas vendas.',
      'Clique na logo PãoFresQUIM para voltar ao Dashboard de qualquer tela.',
    ],
    imagem: 'Print do Dashboard mostrando cards de receita, estoque abaixo do mínimo e status do caixa.',
  },
  {
    titulo: 'Vendas',
    objetivo: 'Registrar vendas, consultar fiado e cancelar vendas quando houver erro.',
    passos: [
      'Clique em Nova venda.',
      'Selecione funcionário, forma de pagamento, cliente quando necessário e produtos.',
      'Para venda fiado, sempre vincule um cliente.',
      'Abra uma venda na lista para consultar detalhes, itens e cancelar se for necessário.',
    ],
    imagem: 'Print do modal de venda aberto com funcionário, forma de pagamento, cliente e itens preenchidos.',
  },
  {
    titulo: 'Produtos e estoque',
    objetivo: 'Cadastrar produtos, organizar por categoria e controlar movimentações.',
    passos: [
      'Informe preço de venda, preço de custo, estoque inicial e estoque mínimo.',
      'Depois do cadastro, ajuste estoque apenas pelo fluxo de ajuste para manter histórico.',
      'Use categorias para facilitar busca e filtro.',
    ],
    imagem: 'Print da tela de produtos destacando filtro por categoria, estoque e botão de ajuste.',
  },
  {
    titulo: 'Clientes e fiado',
    objetivo: 'Cadastrar clientes, consultar saldo devedor e histórico de compras.',
    passos: [
      'Abra o cadastro do cliente para editar dados básicos.',
      'Clique no histórico para ver compras anteriores.',
      'Evite venda fiado para cliente com pendência alta sem autorização do gerente.',
    ],
    imagem: 'Print do modal de histórico do cliente com compras e total em fiado.',
  },
  {
    titulo: 'Funcionários, cargos e acessos',
    objetivo: 'Controlar cadastro, login e telas disponíveis para cada funcionário.',
    passos: [
      'Cadastre o funcionário com cargo e carga horária diária.',
      'Crie acesso apenas para quem precisa entrar no sistema.',
      'Selecione as telas permitidas no modal de acesso.',
      'O administrador principal não deve ter acesso revogado.',
    ],
    imagem: 'Print do modal de acesso do funcionário com checkboxes de telas permitidas.',
  },
  {
    titulo: 'Ponto',
    objetivo: 'Registrar entrada e saída, calcular horas trabalhadas e saldo.',
    passos: [
      'Funcionário comum bate o próprio ponto.',
      'Gerente e administrador podem consultar outros funcionários.',
      'Ajuste manual deve ser usado apenas quando houver erro justificado.',
    ],
    imagem: 'Print da tela de ponto mostrando botão bater ponto e resumo semanal.',
  },
  {
    titulo: 'Caixa',
    objetivo: 'Abrir e fechar o caixa do dia.',
    passos: [
      'Abra o caixa com valor inicial antes de iniciar vendas.',
      'Feche o caixa ao fim do expediente com valor contado.',
      'Registre observações quando houver divergência.',
    ],
    imagem: 'Print da tela de caixa com caixa aberto e histórico de fechamentos.',
  },
]

export default function Ajuda() {
  return (
    <div className="pagina-entrada p-7 flex flex-col gap-5 max-w-[1200px] mx-auto">
      <CabecalhoPagina
        titulo="Ajuda"
        subtitulo="Wiki interna de uso do Pão FresQUIM"
      />

      <Cartao className="p-5">
        <div className="flex items-start gap-3">
          <BookOpen size={18} className="text-[var(--acento)] mt-0.5" />
          <div>
            <h3 className="text-[15px] font-semibold text-[var(--texto-0)]">Como usar esta wiki</h3>
            <p className="text-[13px] text-[var(--texto-2)] mt-1">
              Os blocos abaixo explicam o fluxo ideal de cada página. Onde houver área de imagem ou vídeo,
              coloque os arquivos em <code className="font-mono text-[12px]">public/imagens/ajuda</code> ou
              <code className="font-mono text-[12px] ml-1">public/videos/ajuda</code>.
            </p>
          </div>
        </div>
      </Cartao>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {TOPICOS.map(topico => (
          <Cartao key={topico.titulo} className="p-5 flex flex-col gap-4">
            <div>
              <h3 className="text-[16px] font-semibold text-[var(--texto-0)]">{topico.titulo}</h3>
              <p className="text-[13px] text-[var(--texto-2)] mt-1">{topico.objetivo}</p>
            </div>

            <div className="flex flex-col gap-2">
              {topico.passos.map(passo => (
                <div key={passo} className="flex gap-2 text-[12.5px] text-[var(--texto-1)]">
                  <CheckCircle2 size={13} className="text-[var(--positivo)] shrink-0 mt-0.5" />
                  <span>{passo}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <div className="rounded-[10px] border border-dashed border-[var(--linha)] p-3 bg-[var(--fundo-2)]">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--texto-0)]">
                  <Image size={13} />
                  Imagem
                </div>
                <p className="text-[11px] text-[var(--texto-3)] mt-1">{topico.imagem}</p>
              </div>
              <div className="rounded-[10px] border border-dashed border-[var(--linha)] p-3 bg-[var(--fundo-2)]">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[var(--texto-0)]">
                  <Video size={13} />
                  Vídeo
                </div>
                <p className="text-[11px] text-[var(--texto-3)] mt-1">
                  Opcional: gravação curta mostrando o fluxo desta página.
                </p>
              </div>
            </div>
          </Cartao>
        ))}
      </div>
    </div>
  )
}
