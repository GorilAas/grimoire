import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contextos/AuthContexto'
import LayoutApp from '@/componentes/layout/LayoutApp'
import Login from '@/paginas/Login'
import Dashboard from '@/paginas/Dashboard'
import Chat from '@/paginas/Chat'
import Cameras from '@/paginas/Cameras'
import Clientes from '@/paginas/Clientes'
import Produtos from '@/paginas/Produtos'
import Funcionarios from '@/paginas/Funcionarios'
import Vendas from '@/paginas/Vendas'
import Ponto from '@/paginas/Ponto'
import Caixa from '@/paginas/Caixa'
import Ajuda from '@/paginas/Ajuda'
import Configuracoes from '@/paginas/Configuracoes'
import { buscarTelaPorRota, usuarioPodeAcessarTela } from '@/configuracao/telasSistema'

function Protegida({ children }) {
  const { autenticado } = useAuth()
  if (!autenticado) return <Navigate to="/login" replace />
  return children
}

function RotaPorTela({ rota, children }) {
  const { usuario } = useAuth()
  const tela = buscarTelaPorRota(rota)
  if (!usuarioPodeAcessarTela(usuario, tela)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <Protegida>
            <LayoutApp />
          </Protegida>
        }
      >
        <Route index element={<RotaPorTela rota="/"><Dashboard /></RotaPorTela>} />
        <Route path="/chat" element={<RotaPorTela rota="/chat"><Chat /></RotaPorTela>} />
        <Route path="/cameras" element={<RotaPorTela rota="/cameras"><Cameras /></RotaPorTela>} />
        <Route path="/clientes" element={<RotaPorTela rota="/clientes"><Clientes /></RotaPorTela>} />
        <Route path="/produtos" element={<RotaPorTela rota="/produtos"><Produtos /></RotaPorTela>} />
        <Route path="/funcionarios" element={<RotaPorTela rota="/funcionarios"><Funcionarios /></RotaPorTela>} />
        <Route path="/vendas" element={<RotaPorTela rota="/vendas"><Vendas /></RotaPorTela>} />
        <Route path="/ponto" element={<RotaPorTela rota="/ponto"><Ponto /></RotaPorTela>} />
        <Route path="/caixa" element={<RotaPorTela rota="/caixa"><Caixa /></RotaPorTela>} />
        <Route path="/ajuda" element={<RotaPorTela rota="/ajuda"><Ajuda /></RotaPorTela>} />
        <Route path="/configuracoes" element={<RotaPorTela rota="/configuracoes"><Configuracoes /></RotaPorTela>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
