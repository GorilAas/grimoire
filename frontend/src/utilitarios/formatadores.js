export function formatarMoeda(valor) {
  return Number(valor ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function formatarData(data) {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR')
}

export function formatarDataHora(data) {
  if (!data) return '—'
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatarHora(data) {
  if (!data) return '—'
  return new Date(data).toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatarCpf(cpf) {
  if (!cpf) return '—'
  const s = cpf.replace(/\D/g, '')
  return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatarTelefone(tel) {
  if (!tel) return '—'
  const s = tel.replace(/\D/g, '')
  return s.length === 11
    ? s.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    : s.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

export function iniciais(nome) {
  if (!nome) return '?'
  return nome
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function hoje() {
  return new Date().toISOString().split('T')[0]
}

export function somarValorTotal(vendas = []) {
  return vendas.reduce((acc, v) => acc + Number(v.valorTotal ?? 0), 0)
}
export function mascaraInputCpf(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}
export function mascaraInputTelefone(valor) {
  const s = valor.replace(/\D/g, '').slice(0, 11)
  if (s.length <= 10)
    return s.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  return s.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
}
