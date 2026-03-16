import { useEffect, useState } from 'react'
import api from '../services/api'

function StatusCard({ name, status, latency, detail }) {
  const isOnline = status === 'online'
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 1.5rem',
      background: '#0f0f1a',
      border: `1px solid ${isOnline ? '#1a3a2a' : '#3a1a1a'}`,
      borderRadius: '8px',
      marginBottom: '0.75rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{
          width: 10, height: 10, borderRadius: '50%',
          background: isOnline ? '#00ff88' : '#ff4444',
          boxShadow: isOnline ? '0 0 8px #00ff88' : '0 0 8px #ff4444',
          display: 'inline-block'
        }}/>
        <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{name}</span>
        {detail && <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{detail}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {latency && (
          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{latency}ms</span>
        )}
        <span style={{
          fontSize: '0.8rem',
          padding: '2px 10px',
          borderRadius: '999px',
          background: isOnline ? '#0a2a1a' : '#2a0a0a',
          color: isOnline ? '#00ff88' : '#ff4444',
          fontWeight: 600,
          letterSpacing: '0.05em'
        }}>
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>
    </div>
  )
}

export default function Status() {
  const [apiStatus, setApiStatus] = useState('checking')
  const [dbStatus, setDbStatus] = useState('checking')
  const [latency, setLatency] = useState(null)
  const [version, setVersion] = useState(null)
  const [lastDeploy, setLastDeploy] = useState(null)
  const [checkedAt, setCheckedAt] = useState(null)

  const checkStatus = async () => {
    setApiStatus('checking')
    setDbStatus('checking')
    try {
      const start = Date.now()
      const res = await api.get('/actuator/health')
      const ms = Date.now() - start
      setLatency(ms)
      setApiStatus('online')

      const components = res.data?.components
      if (components?.db?.status === 'UP') setDbStatus('online')
      else setDbStatus('offline')

    } catch {
      setApiStatus('offline')
      setDbStatus('offline')
      setLatency(null)
    }

    try {
      const info = await api.get('/actuator/info')
      setVersion(info.data?.build?.version || '1.0.0')
      setLastDeploy(info.data?.build?.time || null)
    } catch {
      setVersion('1.0.0')
    }

    setCheckedAt(new Date().toLocaleString('pt-BR'))
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const allOnline = apiStatus === 'online' && dbStatus === 'online'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080812',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '4rem 1rem',
      fontFamily: 'monospace'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#e2e8f0',
          letterSpacing: '0.1em',
          marginBottom: '0.5rem'
        }}>
          ⚙ GRIMOIRE — STATUS
        </h1>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1.2rem',
          borderRadius: '999px',
          background: allOnline ? '#0a2a1a' : '#2a0a0a',
          border: `1px solid ${allOnline ? '#00ff88' : '#ff4444'}`,
          color: allOnline ? '#00ff88' : '#ff4444',
          fontSize: '0.85rem',
          fontWeight: 600,
          letterSpacing: '0.08em'
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'currentColor',
            display: 'inline-block'
          }}/>
          {allOnline ? 'TODOS OS SISTEMAS OPERACIONAIS' : 'DEGRADAÇÃO DETECTADA'}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '640px' }}>
        <p style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
          SERVIÇOS
        </p>
        <StatusCard
          name="API Backend"
          status={apiStatus === 'checking' ? 'offline' : apiStatus}
          latency={latency}
          detail="Spring Boot 3"
        />
        <StatusCard
          name="Banco de Dados"
          status={dbStatus === 'checking' ? 'offline' : dbStatus}
          detail="PostgreSQL · Supabase"
        />
        <StatusCard
          name="Frontend"
          status="online"
          detail="React · Vercel"
        />
      </div>

      <div style={{
        width: '100%', maxWidth: '640px',
        marginTop: '2rem',
        padding: '1rem 1.5rem',
        background: '#0f0f1a',
        border: '1px solid #1e1e2e',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <p style={{ color: '#475569', fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>VERSÃO</p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{version || '—'}</p>
        </div>
        <div>
          <p style={{ color: '#475569', fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>ÚLTIMO DEPLOY</p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{lastDeploy ? new Date(lastDeploy).toLocaleString('pt-BR') : '—'}</p>
        </div>
        <div>
          <p style={{ color: '#475569', fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>VERIFICADO EM</p>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{checkedAt || '—'}</p>
        </div>
      </div>

      <button
        onClick={checkStatus}
        style={{
          marginTop: '2rem',
          padding: '0.6rem 1.5rem',
          background: 'transparent',
          border: '1px solid #1e293b',
          borderRadius: '6px',
          color: '#64748b',
          cursor: 'pointer',
          fontSize: '0.85rem',
          letterSpacing: '0.05em'
        }}
      >
        ↻ Verificar agora
      </button>

      <p style={{ color: '#1e293b', fontSize: '0.75rem', marginTop: '3rem' }}>
        Atualiza automaticamente a cada 30 segundos
      </p>
    </div>
  )
}