import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contextos/AuthContexto'
import { AcessibilidadeProvider } from '@/contextos/AcessibilidadeContexto'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AcessibilidadeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AcessibilidadeProvider>
    </BrowserRouter>
  </StrictMode>,
)
