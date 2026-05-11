# Pão FresQUIM - Documentação da API

Backend Spring Boot 3.5, Java 21 e PostgreSQL/Supabase.  
Base URL local: `http://localhost:8080`  
Autenticação: JWT Bearer Token.  
Validado em: 2026-05-10. Foram testadas 69 chamadas HTTP autenticadas e públicas.

## Como rodar

No backend:

```bash
cd C:/Users/twitc/grimoire/backend
bash start.sh
```

No frontend:

```bash
cd C:/Users/twitc/grimoire/frontend
npm run dev
```

## Como usar no Postman

1. Importe o arquivo `Pao-FresQUIM.postman_collection.json`.
2. Rode `Auth / Login admin`.
3. A collection salva o JWT automaticamente na variável `token`.
4. As demais rotas usam `Authorization: Bearer {{token}}`.

Usuário admin padrão:

```json
{
  "login": "admin",
  "senha": "FresQUIM@2025!"
}
```

## Perfis de acesso

- ADMIN: acesso total. Não deve perder acesso nem ser removido.
- GERENTE: acesso operacional amplo, incluindo funcionários, caixa, estoque, cargos e configurações.
- ATENDENTE: clientes, vendas e produtos conforme telas liberadas.
- PADEIRO: leitura de produtos e telas liberadas.

## Padrao de erro

```json
{
  "timestamp": "2026-05-10T12:00:00",
  "status": 422,
  "mensagem": "Regra de negocio violada"
}
```

Status principais:

| Status | Uso |
|---|---|
| 200 | Operação concluída com retorno |
| 201 | Registro criado |
| 204 | Operação concluída sem corpo |
| 400 | JSON invalido ou validacao de campos |
| 404 | Recurso ou rota não encontrada |
| 405 | Método HTTP não permitido |
| 422 | Regra de negocio violada |
| 500 | Erro interno não esperado |

## Endpoints

### Health

| Método | Rota | Nome | Uso |
|---|---|---|---|
| GET | `/actuator/health` | Health | Verifica se o backend esta UP. |

### Auth

| Método | Rota | Nome | Uso |
|---|---|---|---|
| POST | `/api/auth/login` | Login admin | Autentica usuario e retorna token JWT. |

### Cargos

| Método | Rota | Nome | Uso |
|---|---|---|---|
| GET | `/api/cargos` | Listar cargos ativos | Lista cargos ativos. |
| GET | `/api/cargos/todos` | Listar todos os cargos | Lista cargos ativos e inativos. |
| POST | `/api/cargos` | Criar cargo | Cria cargo do sistema. |
| PUT | `/api/cargos/{{cargoId}}` | Atualizar cargo | Atualiza cargo. |
| DELETE | `/api/cargos/{{cargoId}}` | Inativar cargo | Inativa cargo. |
| PATCH | `/api/cargos/{{cargoId}}/reativar` | Reativar cargo | Reativa cargo. |

### Categorias

| Método | Rota | Nome | Uso |
|---|---|---|---|
| GET | `/api/categorias` | Listar categorias | Lista categorias de produto. |
| POST | `/api/categorias` | Criar categoria | Cria categoria. |
| PUT | `/api/categorias/{{categoriaId}}` | Atualizar categoria | Atualiza categoria. |
| DELETE | `/api/categorias/{{categoriaId}}` | Excluir categoria | Exclui categoria somente se não houver produto vinculado. |

### Produtos

| Método | Rota | Nome | Uso |
|---|---|---|---|
| POST | `/api/produtos` | Criar produto | Cria produto com estoque inicial, custo, venda e categoria. |
| GET | `/api/produtos` | Listar produtos ativos | Lista produtos ativos. |
| GET | `/api/produtos/todos` | Listar todos os produtos | Lista produtos ativos e inativos. |
| GET | `/api/produtos/{{produtoId}}` | Buscar produto por id | Busca produto por id. |
| GET | `/api/produtos/código/7890000000011` | Buscar produto por código | Busca produto por código de barras. |
| GET | `/api/produtos/busca?termo=Pao` | Buscar produtos por nome | Busca produtos ativos por trecho do nome. |
| GET | `/api/produtos/abaixo-mínimo` | Produtos abaixo do mínimo | Lista produtos abaixo do estoque mínimo. |
| GET | `/api/produtos/categoria/{{categoriaId}}` | Produtos por categoria | Lista produtos de uma categoria. |
| PUT | `/api/produtos/{{produtoId}}` | Atualizar produto | Atualiza dados do produto. |
| DELETE | `/api/produtos/{{produtoId}}` | Inativar produto | Inativa produto. |
| PATCH | `/api/produtos/{{produtoId}}/reativar` | Reativar produto | Reativa produto. |

### Estoque

| Método | Rota | Nome | Uso |
|---|---|---|---|
| GET | `/api/estoque/produto/{{produtoId}}` | Historico de estoque por produto | Lista movimentacoes de estoque do produto. |
| POST | `/api/estoque/ajuste` | Ajuste manual de estoque | Registra entrada ou saida manual. |

### Funcionários

| Método | Rota | Nome | Uso |
|---|---|---|---|
| POST | `/api/funcionarios` | Criar funcionário | Cria funcionário. |
| GET | `/api/funcionarios` | Listar funcionários ativos | Lista funcionários ativos. |
| GET | `/api/funcionarios/todos` | Listar todos os funcionários | Lista funcionários ativos e inativos. |
| GET | `/api/funcionarios/cargo/ATENDENTE` | Buscar funcionário por cargo | Lista funcionários por cargo. |
| GET | `/api/funcionarios/me` | Meu funcionário | Retorna funcionário vinculado ao usuario logado, quando existir. |
| GET | `/api/funcionarios/{{funcionarioId}}` | Buscar funcionário por id | Busca funcionário por id. |
| PUT | `/api/funcionarios/{{funcionarioId}}` | Atualizar funcionário | Atualiza funcionário. |
| POST | `/api/funcionarios/{{funcionarioId}}/acesso` | Criar acesso funcionário | Cria usuario de acesso para funcionário. |
| PATCH | `/api/funcionarios/{{funcionarioId}}/acesso` | Atualizar acesso funcionário | Atualiza perfil e telas permitidas. |
| DELETE | `/api/funcionarios/{{funcionarioId}}/acesso` | Revogar acesso funcionário | Revoga acesso do funcionário. |
| DELETE | `/api/funcionarios/{{funcionarioId}}` | Inativar funcionário | Inativa funcionário. |

### Clientes

| Método | Rota | Nome | Uso |
|---|---|---|---|
| POST | `/api/clientes` | Criar cliente | Cria cliente e consulta mock do Serasa. |
| GET | `/api/clientes` | Listar clientes ativos | Lista clientes ativos. |
| GET | `/api/clientes/todos` | Listar todos os clientes | Lista clientes ativos e inativos. |
| GET | `/api/clientes/fiado` | Clientes com fiado | Lista clientes com saldo devedor. |
| GET | `/api/clientes/{{clienteId}}` | Buscar cliente por id | Busca cliente por id. |
| GET | `/api/clientes/cpf/123.456.789-10` | Buscar cliente por CPF | Busca cliente por CPF. |
| PUT | `/api/clientes/{{clienteId}}` | Atualizar cliente | Atualiza cliente. |
| PATCH | `/api/clientes/{{clienteId}}/cpf` | Corrigir CPF | Corrige CPF e refaz validacao de negocio. |
| DELETE | `/api/clientes/{{clienteId}}` | Inativar cliente | Inativa cliente se não houver saldo devedor. |
| PATCH | `/api/clientes/{{clienteId}}/reativar` | Reativar cliente | Reativa cliente. |

### Vendas

| Método | Rota | Nome | Uso |
|---|---|---|---|
| POST | `/api/vendas` | Registrar venda | Registra venda e baixa estoque. |
| GET | `/api/vendas` | Listar vendas | Lista vendas. |
| GET | `/api/vendas/{{vendaId}}` | Buscar venda por id | Busca venda por id. |
| PUT | `/api/vendas/{{vendaId}}` | Atualizar venda PUT | Atualiza venda por PUT. |
| PATCH | `/api/vendas/{{vendaId}}` | Atualizar venda PATCH | Atualiza venda por PATCH, usado pelo frontend. |
| GET | `/api/vendas/cliente/{{clienteId}}` | Vendas por cliente | Historico de compras do cliente. |
| GET | `/api/vendas/funcionario/{{funcionarioId}}` | Vendas por funcionário | Lista vendas de um funcionário. |
| GET | `/api/vendas/forma/DINHEIRO` | Vendas por forma | Lista vendas por forma de pagamento. |
| GET | `/api/vendas/período?dataInicio=2026-01-01&dataFim=2026-12-31` | Vendas por período | Lista vendas por período. |
| GET | `/api/vendas/fiado/aberto` | Fiados em aberto | Lista vendas fiado pendentes. |
| PATCH | `/api/vendas/{{vendaId}}/pagar` | Pagar fiado | Marca venda fiado como paga e abate saldo. |
| PATCH | `/api/vendas/{{vendaId}}/cancelar` | Cancelar venda | Cancela venda, estorna estoque e ajusta fiado quando existir. |

### Caixa

| Método | Rota | Nome | Uso |
|---|---|---|---|
| GET | `/api/caixa` | Listar caixas | Lista caixas. |
| GET | `/api/caixa/aberto` | Caixa aberto | Retorna caixa aberto ou 204. |
| POST | `/api/caixa/abrir` | Abrir caixa | Abre caixa do dia. |
| GET | `/api/caixa/{{caixaId}}` | Buscar caixa por id | Busca caixa por id. |
| PATCH | `/api/caixa/fechar` | Fechar caixa | Fecha caixa aberto. |

### Ponto

| Método | Rota | Nome | Uso |
|---|---|---|---|
| POST | `/api/ponto/bater` | Bater ponto | Funcionário logado bate o próprio ponto. Admin/Gerente pode passar funcionarioId. |
| GET | `/api/ponto/hoje/{{funcionarioId}}` | Ponto hoje | Resumo do ponto de hoje. |
| GET | `/api/ponto/resumo/{{funcionarioId}}?inicio=2026-05-01&fim=2026-05-10` | Resumo de ponto | Resumo diário no período. |
| GET | `/api/ponto/período?inicio=2026-05-01&fim=2026-05-10` | Ponto por período | Resumo geral para Admin/Gerente. |
| POST | `/api/ponto/ajuste` | Ajuste manual de ponto | Admin/Gerente registra ajuste manual. |

## Corpos principais

### Login

```json
{
  "login": "admin",
  "senha": "FresQUIM@2025!"
}
```

### Produto

```json
{
  "nome": "Pao Frances",
  "descricao": "Unidade tradicional",
  "precoUnitario": 1.25,
  "precoCusto": 0.55,
  "codigoBarras": "7890000000011",
  "categoriaId": "{{categoriaId}}",
  "quantidadeEstoque": 120,
  "estoqueMinimo": 20
}
```

### Venda

```json
{
  "funcionarioId": "{{funcionarioId}}",
  "clienteId": "{{clienteId}}",
  "formaPagamento": "DINHEIRO",
  "itens": [
    {
      "produtoId": "{{produtoId}}",
      "quantidade": 2
    }
  ]
}
```

### Ajuste manual de estoque

```json
{
  "produtoId": "{{produtoId}}",
  "tipo": "ENTRADA",
  "quantidade": 10,
  "motivo": "AJUSTE_MANUAL",
  "observacao": "Ajuste manual de conferencia"
}
```

### Ajuste manual de ponto

```json
{
  "funcionarioId": "{{funcionarioId}}",
  "momento": "2026-05-09T08:00:00",
  "tipo": "ENTRADA",
  "observacao": "Ajuste autorizado pelo gerente"
}
```

## Regras importantes

- Venda FIADO exige cliente.
- Venda cancelada estorna estoque e ajusta saldo do fiado quando existir.
- Produto inativo não deve ser vendido.
- Categoria com produto vinculado não pode ser excluida.
- Somente um caixa pode ficar ABERTO ao mesmo tempo.
- Ponto não permite duas ENTRADAS seguidas nem duas SAIDAS seguidas para o mesmo funcionário no dia.
- ADMIN e GERENTE podem ver/ajustar ponto de todos. Funcionários batem o próprio ponto.
- Estoque nunca deve ficar negativo.
- Cargo pode ser inativado e reativado.


