import { useState, useMemo } from 'react'
import { KeyRound, Pencil, Plus, Phone, Cake } from 'lucide-react'
import CabecalhoPagina from '@/componentes/ui/CabecalhoPagina'
import Chip from '@/componentes/ui/Chip'
import Botao from '@/componentes/ui/Botao'
import Cartao from '@/componentes/ui/Cartao'
import EstadoCarregando from '@/componentes/ui/EstadoCarregando'
import EstadoVazio from '@/componentes/ui/EstadoVazio'
import Avatar from '@/componentes/ui/Avatar'
import ModalAcesso from '@/componentes/modais/ModalAcesso'
import ModalFuncionario from '@/componentes/modais/ModalFuncionario'
import { useDadosApi } from '@/hooks/useDadosApi'
import { useAuth } from '@/contextos/AuthContexto'
import funcionariosServico from '@/servicos/funcionariosServico'
import cargosServico from '@/servicos/cargosServico'
import { formatarTelefone } from '@/utilitarios/formatadores'

const VARIANTE_CARGO = {
  GERENTE:   'dourado',
  ATENDENTE: 'info',
  PADEIRO:   'ok',
}

const AVATAR_CARGO = {
  GERENTE:   'dourado',
  ATENDENTE: 'musgo',
  PADEIRO:   'musgo',
}

export default function Funcionarios() {
  const [cargo,    setCargo]    = useState(null)
  const [modalAcesso, setModalAcesso] = useState(null)
  const [modalFunc,   setModalFunc]   = useState({ aberto: false, funcionario: null })
  const { temPermissao } = useAuth()
  const ehAdmin    = temPermissao(['ADMIN'])
  const podeEditar = temPermissao(['ADMIN', 'GERENTE'])

  const { dados, carregando, erro, recarregar } = useDadosApi(
    () => funcionariosServico.listarTodos()
  )
  const { dados: cargos } = useDadosApi(() => cargosServico.listarAtivos())

  const lista = useMemo(() => dados ?? [], [dados])

  const filtrados = useMemo(
    () => (cargo ? lista.filter(f => f.cargo === cargo) : lista),
    [lista, cargo],
  )

  function abrirNovo() {
    setModalFunc({ aberto: true, funcionario: null })
  }

  function abrirEdicao(f) {
    setModalFunc({ aberto: true, funcionario: f })
  }

  function handleSalvarFunc() {
    setModalFunc({ aberto: false, funcionario: null })
    recarregar()
  }

  function handleSalvarAcesso() {
    setModalAcesso(null)
    recarregar()
  }

  return (
    <div className="pagina-entrada p-7 flex flex-col gap-5">
      <CabecalhoPagina
        titulo="Funcionários"
        subtitulo={`${filtrados.length} ${filtrados.length === 1 ? 'funcionário' : 'funcionários'}`}
        acoes={
          podeEditar && (
            <Botao variante="primario" onClick={abrirNovo}>
              <Plus size={13} />
              Novo funcionário
            </Botao>
          )
        }
      />


      <div className="flex gap-2 flex-wrap">
        {[{ rotulo: 'Todos', valor: null }, ...((cargos ?? []).map(item => ({ rotulo: item.nome, valor: item.nome })))].map(f => (
          <button
            key={f.rotulo}
            onClick={() => setCargo(f.valor)}
            className={[
              'text-[12.5px] px-4 py-1.5 rounded-full border font-medium transition-all duration-160',
              cargo === f.valor
                ? 'bg-[var(--acento-suave)] border-musgo-400 text-[var(--texto-0)] shadow-[0_0_0_1px_oklch(0.48_0.07_145/0.3)]'
                : 'border-[var(--linha-suave)] text-[var(--texto-1)] hover:border-musgo-400 hover:text-[var(--texto-0)]',
            ].join(' ')}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      {carregando && <EstadoCarregando linhas={6} />}

      {!carregando && !erro && filtrados.length === 0 && (
        <EstadoVazio mensagem="Nenhum funcionário encontrado." />
      )}

      {!carregando && filtrados.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 escalonado">
          {filtrados.map(f => (
            <Cartao key={f.id} className="p-4 flex items-start gap-3.5">
              <Avatar nome={f.nome} variante={AVATAR_CARGO[f.cargo] ?? 'musgo'} tamanho="md" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[var(--texto-0)] truncate">
                  {f.nome}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <Chip variante={VARIANTE_CARGO[f.cargo] ?? 'mudo'}>
                    {f.cargo}
                  </Chip>
                  {f.possuiAcesso ? (
                    <Chip variante="ok">Acesso ativo</Chip>
                  ) : (
                    <Chip variante="mudo">Sem acesso</Chip>
                  )}
                  {f.ativo === false && <Chip variante="mudo">Inativo</Chip>}
                </div>


                <div className="mt-2 flex flex-col gap-0.5">
                  {f.telefone && (
                    <p className="text-[11.5px] text-[var(--texto-3)] flex items-center gap-1">
                      <Phone size={10} />
                      {formatarTelefone(f.telefone)}
                    </p>
                  )}
                  {f.idadeAnos != null && (
                    <p className="text-[11.5px] text-[var(--texto-3)] flex items-center gap-1">
                      <Cake size={10} />
                      {f.idadeAnos} anos
                    </p>
                  )}
                </div>
              </div>


              <div className="flex flex-col gap-1 shrink-0">
                {podeEditar && (
                  <button
                    onClick={() => abrirEdicao(f)}
                    title="Editar funcionário"
                    className="w-8 h-8 rounded-[8px] grid place-items-center text-[var(--texto-3)] hover:text-[var(--acento)] hover:bg-[var(--acento-suave)] transition-all duration-160"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {ehAdmin && (
                  <button
                    onClick={() => setModalAcesso(f)}
                    title={f.possuiAcesso ? 'Gerenciar acesso' : 'Criar acesso'}
                    className={[
                      'w-8 h-8 rounded-[8px] grid place-items-center transition-all duration-160',
                      f.possuiAcesso
                        ? 'text-[var(--acento)] hover:bg-[var(--acento-suave)]'
                        : 'text-[var(--texto-3)] hover:text-[var(--acento)] hover:bg-[var(--acento-suave)]',
                    ].join(' ')}
                  >
                    <KeyRound size={14} strokeWidth={f.possuiAcesso ? 2 : 1.4} />
                  </button>
                )}
              </div>
            </Cartao>
          ))}
        </div>
      )}

      {erro && (
        <Cartao className="p-5">
          <p className="text-[13px] text-[var(--negativo)]">
            Erro ao carregar funcionários. Verifique a conexão com o backend.
          </p>
        </Cartao>
      )}

      <ModalFuncionario
        aberto={modalFunc.aberto}
        funcionario={modalFunc.funcionario}
        onFechar={() => setModalFunc({ aberto: false, funcionario: null })}
        onSalvo={handleSalvarFunc}
      />

      {modalAcesso && (
        <ModalAcesso
          funcionario={modalAcesso}
          aoFechar={() => setModalAcesso(null)}
          aoSalvar={handleSalvarAcesso}
        />
      )}
    </div>
  )
}
