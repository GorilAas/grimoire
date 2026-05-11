import {
  BadgeCheck,
  Camera,
  Clock,
  DollarSign,
  HelpCircle,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'

export const TELAS_SISTEMA = [
  {
    id: 'dashboard',
    rota: '/',
    rotulo: 'Dashboard',
    secao: 'Painel',
    Icone: LayoutDashboard,
    exato: true,
    perfis: ['ADMIN', 'GERENTE', 'ATENDENTE', 'PADEIRO'],
    termos: ['painel', 'inicio', 'resumo'],
  },
  {
    id: 'chat',
    rota: '/chat',
    rotulo: 'Assistente',
    secao: 'Operação',
    Icone: Sparkles,
    badge: 'IA',
    perfis: ['ADMIN', 'GERENTE', 'ATENDENTE'],
    termos: ['ia', 'chat', 'bot'],
  },
  {
    id: 'cameras',
    rota: '/cameras',
    rotulo: 'Câmeras',
    secao: 'Operação',
    Icone: Camera,
    badge: '4',
    perfis: ['ADMIN', 'GERENTE', 'ATENDENTE', 'PADEIRO'],
    termos: ['camera', 'monitoramento'],
  },
  {
    id: 'ponto',
    rota: '/ponto',
    rotulo: 'Ponto',
    secao: 'Operação',
    Icone: Clock,
    perfis: ['ADMIN', 'GERENTE', 'ATENDENTE', 'PADEIRO'],
    termos: ['entrada', 'saida', 'horas'],
  },
  {
    id: 'clientes',
    rota: '/clientes',
    rotulo: 'Clientes',
    secao: 'Cadastros',
    Icone: Users,
    perfis: ['ADMIN', 'GERENTE', 'ATENDENTE'],
    termos: ['cliente', 'cpf', 'fiado'],
  },
  {
    id: 'produtos',
    rota: '/produtos',
    rotulo: 'Produtos',
    secao: 'Cadastros',
    Icone: Package,
    perfis: ['ADMIN', 'GERENTE', 'ATENDENTE', 'PADEIRO'],
    termos: ['produto', 'estoque', 'categoria'],
  },
  {
    id: 'funcionarios',
    rota: '/funcionarios',
    rotulo: 'Funcionários',
    secao: 'Cadastros',
    Icone: BadgeCheck,
    perfis: ['ADMIN', 'GERENTE'],
    termos: ['funcionario', 'cargo', 'acesso'],
  },
  {
    id: 'vendas',
    rota: '/vendas',
    rotulo: 'Vendas',
    secao: 'Financeiro',
    Icone: Receipt,
    perfis: ['ADMIN', 'GERENTE', 'ATENDENTE'],
    termos: ['venda', 'fiado', 'pagamento'],
  },
  {
    id: 'caixa',
    rota: '/caixa',
    rotulo: 'Caixa',
    secao: 'Financeiro',
    Icone: DollarSign,
    perfis: ['ADMIN', 'GERENTE'],
    termos: ['financeiro', 'fechamento', 'abertura'],
  },
  {
    id: 'ajuda',
    rota: '/ajuda',
    rotulo: 'Ajuda',
    secao: 'Suporte',
    Icone: HelpCircle,
    perfis: ['ADMIN', 'GERENTE', 'ATENDENTE', 'PADEIRO'],
    termos: ['wiki', 'manual', 'como usar'],
  },
  {
    id: 'configuracoes',
    rota: '/configuracoes',
    rotulo: 'Configurações',
    secao: 'Sistema',
    Icone: Settings,
    perfis: ['ADMIN', 'GERENTE'],
    termos: ['config', 'cargo', 'sistema'],
  },
]

export function usuarioPodeAcessarTela(usuario, tela) {
  if (!usuario || !tela) return false
  if (usuario.perfil === 'ADMIN') return true
  if (!tela.perfis?.includes(usuario.perfil)) return false

  const telasPermitidas = usuario.telasPermitidas ?? []
  if (!Array.isArray(telasPermitidas) || telasPermitidas.length === 0) return true
  return telasPermitidas.includes(tela.id)
}

export function telasPermitidasParaUsuario(usuario) {
  return TELAS_SISTEMA.filter(tela => usuarioPodeAcessarTela(usuario, tela))
}

export function buscarTelaPorRota(rota) {
  return TELAS_SISTEMA.find(tela => tela.rota === rota)
}
