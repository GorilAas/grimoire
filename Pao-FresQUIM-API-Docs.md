# Pão FresQUIM — Documentação da API

**Backend:** Spring Boot 3.5 · Java 21 · PostgreSQL (Supabase)  
**Base URL:** `http://localhost:8080`  
**Autenticação:** JWT Bearer Token (obtido via `/api/auth/login`)  
**Versão:** 2.0 — Mai/2026

---

## Índice

1. [Autenticação](#1-autenticação)
2. [Categorias](#2-categorias)
3. [Produtos](#3-produtos)
4. [Estoque](#4-estoque)
5. [Funcionários](#5-funcionários)
6. [Clientes](#6-clientes)
7. [Vendas](#7-vendas)
8. [Caixa](#8-caixa)
9. [Ponto Eletrônico](#9-ponto-eletrônico)
10. [Perfis e Permissões](#10-perfis-e-permissões)
11. [Padrão de Erros](#11-padrão-de-erros)

---

## 1. Autenticação

Rota pública — não exige Bearer token.

### POST `/api/auth/login`

**Body:**
```json
{
  "login": "admin@paofresquim.com",
  "senha": "Padaria@123"
}
```

**Resposta 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id": 1,
  "nome": "Administrador",
  "login": "admin@paofresquim.com",
  "perfil": "ADMIN"
}
```

> O token JWT expira em **24 horas** e deve ser enviado no header:  
> `Authorization: Bearer <token>`

---

## 2. Categorias

Permissão de leitura: todos os perfis.  
Mutações (criar/editar/excluir): **ADMIN, GERENTE**.

| Método   | Rota                   | Descrição          |
|----------|------------------------|--------------------|
| GET      | `/api/categorias`      | Listar todas       |
| POST     | `/api/categorias`      | Criar categoria    |
| PUT      | `/api/categorias/{id}` | Atualizar          |
| DELETE   | `/api/categorias/{id}` | Excluir            |

### Body (POST / PUT)
```json
{ "nome": "Pães Doces" }
```

### Resposta
```json
{ "id": 1, "nome": "Pães Doces" }
```

---

## 3. Produtos

Permissão: todos os perfis (leitura); **ADMIN / GERENTE** para mutações.

| Método   | Rota                               | Descrição                          |
|----------|------------------------------------|------------------------------------|
| GET      | `/api/produtos`                    | Listar ativos                      |
| GET      | `/api/produtos/todos`              | Listar todos (incl. inativos)      |
| GET      | `/api/produtos/{id}`               | Buscar por ID                      |
| GET      | `/api/produtos/codigo/{codigo}`    | Buscar por código de barras        |
| GET      | `/api/produtos/busca?termo=`       | Buscar por nome (contém)           |
| GET      | `/api/produtos/abaixo-minimo`      | Listar com estoque abaixo do mínimo|
| GET      | `/api/produtos/categoria/{catId}`  | Listar por categoria               |
| POST     | `/api/produtos`                    | Criar produto                      |
| PUT      | `/api/produtos/{id}`               | Atualizar produto                  |
| DELETE   | `/api/produtos/{id}`               | Inativar (soft delete)             |
| PATCH    | `/api/produtos/{id}/reativar`      | Reativar produto inativo           |

### Body (POST / PUT)
```json
{
  "nome": "Pao Frances",
  "descricao": "Pao crocante tradicional",
  "precoUnitario": 0.75,
  "precoCusto": 0.30,
  "codigoBarras": "7891234560001",
  "categoriaId": 1,
  "quantidadeEstoque": 100,
  "estoqueMinimo": 20
}
```

### Resposta
```json
{
  "id": 1,
  "nome": "Pao Frances",
  "descricao": "Pao crocante tradicional",
  "precoUnitario": 0.75,
  "precoCusto": 0.30,
  "codigoBarras": "7891234560001",
  "categoriaId": 1,
  "categoriaNome": "Pães Salgados",
  "quantidadeEstoque": 100,
  "estoqueMinimo": 20,
  "abaixoDoMinimo": false,
  "ativo": true
}
```

**Validações:**
- `nome` obrigatório
- `precoUnitario` obrigatório, positivo
- `codigoBarras` único (se informado) → 422

---

## 4. Estoque

Permissão: **ADMIN, GERENTE**.

| Método | Rota                          | Descrição                         |
|--------|-------------------------------|-----------------------------------|
| GET    | `/api/estoque/produto/{id}`   | Histórico de movimentações        |

### Resposta (lista)
```json
[
  {
    "id": 1,
    "produtoId": 1,
    "produtoNome": "Pao Frances",
    "tipo": "ENTRADA",
    "quantidade": 50,
    "motivo": "COMPRA",
    "observacao": "Reposição",
    "criadoEm": "2026-05-01T08:00:00"
  }
]
```

**Motivos disponíveis:** `COMPRA`, `VENDA`, `AJUSTE_MANUAL`, `PERDA`, `DEVOLUCAO`, `INVENTARIO`

---

## 5. Funcionários

Permissão: **ADMIN, GERENTE**.  
Criar/revogar acesso (login): apenas **ADMIN**.

| Método   | Rota                           | Descrição                        |
|----------|--------------------------------|----------------------------------|
| GET      | `/api/funcionarios`            | Listar ativos                    |
| GET      | `/api/funcionarios/todos`      | Listar todos (incl. inativos)    |
| GET      | `/api/funcionarios/{id}`       | Buscar por ID                    |
| GET      | `/api/funcionarios/cargo/{c}`  | Filtrar por cargo                |
| POST     | `/api/funcionarios`            | Criar funcionário                |
| PUT      | `/api/funcionarios/{id}`       | Atualizar funcionário            |
| DELETE   | `/api/funcionarios/{id}`       | Inativar (soft delete)           |
| POST     | `/api/funcionarios/{id}/acesso`| Criar login de acesso — ADMIN    |
| DELETE   | `/api/funcionarios/{id}/acesso`| Revogar login — ADMIN            |

**Cargos disponíveis:** `GERENTE`, `ATENDENTE`, `PADEIRO`

### Body — Criar / Atualizar
```json
{
  "nome": "Carlos Silva",
  "cargo": "GERENTE",
  "telefone": "(11) 99999-0001",
  "endereco": "Rua das Flores, 100",
  "telefoneEmergencia": "(11) 98888-0001",
  "dataAdmissao": "2023-01-15",
  "dataNascimento": "1990-05-20",
  "cargaHorariaDiaria": 8
}
```

### Body — Criar acesso (`POST /{id}/acesso`)
```json
{
  "email": "carlos@paofresquim.com",
  "senha": "Padaria@123",
  "perfil": "GERENTE"
}
```

**Perfis disponíveis:** `ADMIN`, `GERENTE`, `ATENDENTE`, `PADEIRO`

### Resposta
```json
{
  "id": 1,
  "nome": "Carlos Silva",
  "cargo": "GERENTE",
  "telefone": "(11) 99999-0001",
  "dataAdmissao": "2023-01-15",
  "dataNascimento": "1990-05-20",
  "idadeAnos": 35,
  "cargaHorariaDiaria": 8.0,
  "ativo": true,
  "usuarioEmail": "carlos@paofresquim.com",
  "usuarioPerfil": "GERENTE"
}
```

---

## 6. Clientes

Permissão: **ADMIN, GERENTE, ATENDENTE**.

| Método   | Rota                      | Descrição                         |
|----------|---------------------------|-----------------------------------|
| GET      | `/api/clientes`           | Listar ativos                     |
| GET      | `/api/clientes/todos`     | Listar todos (incl. inativos)     |
| GET      | `/api/clientes/{id}`      | Buscar por ID                     |
| GET      | `/api/clientes/cpf/{cpf}` | Buscar por CPF                    |
| GET      | `/api/clientes/fiado`     | Clientes com fiado em aberto      |
| POST     | `/api/clientes`           | Criar cliente                     |
| PUT      | `/api/clientes/{id}`      | Atualizar cliente                 |
| PATCH    | `/api/clientes/{id}/cpf`  | Corrigir CPF                      |
| DELETE   | `/api/clientes/{id}`      | Inativar (bloqueia se há fiado)   |
| PATCH    | `/api/clientes/{id}/reativar` | Reativar cliente              |

### Body — Criar / Atualizar
```json
{
  "nome": "Maria Oliveira",
  "cpf": "123.456.789-01",
  "telefone": "(11) 99999-0010",
  "email": "maria@email.com",
  "endereco": "Rua das Rosas, 50"
}
```

### Body — Corrigir CPF
```json
{ "cpf": "111.222.333-44" }
```

**Validações:**
- CPF formato `000.000.000-00`
- CPF único → 422
- Inativar com fiado pendente → 422

---

## 7. Vendas

| Permissão         | Ação                                      |
|-------------------|-------------------------------------------|
| ADMIN, GERENTE, ATENDENTE | Registrar, consultar, pagar fiado |
| ADMIN, GERENTE    | Cancelar venda                            |

| Método   | Rota                            | Descrição                            |
|----------|---------------------------------|--------------------------------------|
| GET      | `/api/vendas`                   | Listar todas                         |
| GET      | `/api/vendas/{id}`              | Buscar por ID                        |
| GET      | `/api/vendas/cliente/{id}`      | Vendas de um cliente                 |
| GET      | `/api/vendas/funcionario/{id}`  | Vendas de um funcionário             |
| GET      | `/api/vendas/forma/{forma}`     | Por forma de pagamento               |
| GET      | `/api/vendas/periodo`           | Por período (`?dataInicio=&dataFim=`)|
| GET      | `/api/vendas/fiado/aberto`      | Fiados não quitados                  |
| POST     | `/api/vendas`                   | Registrar venda                      |
| PATCH    | `/api/vendas/{id}/pagar`        | Quitar fiado                         |
| PATCH    | `/api/vendas/{id}/cancelar`     | Cancelar venda — ADMIN/GERENTE       |

**Formas de pagamento:** `DINHEIRO`, `PIX`, `DEBITO`, `CREDITO`, `FIADO`

### Body — Registrar venda
```json
{
  "funcionarioId": 2,
  "clienteId": 1,
  "formaPagamento": "FIADO",
  "itens": [
    { "produtoId": 1, "quantidade": 10 },
    { "produtoId": 2, "quantidade": 2.5 }
  ]
}
```

> `clienteId` obrigatório quando `formaPagamento = FIADO`

### Body — Cancelar venda
```json
{ "motivo": "Produto devolvido pelo cliente" }
```

> O corpo é opcional. O funcionário responsável pelo cancelamento é resolvido automaticamente via JWT — não é necessário enviar `funcionarioId`.

### Resposta
```json
{
  "id": 1,
  "clienteId": 1,
  "clienteNome": "Maria Oliveira",
  "funcionarioId": 2,
  "funcionarioNome": "Carlos Silva",
  "valorTotal": 8.25,
  "formaPagamento": "FIADO",
  "statusFiado": "PENDENTE",
  "status": "ATIVA",
  "motivoCancelamento": null,
  "canceladoEm": null,
  "dataVenda": "2026-05-03T10:30:00",
  "notaFiscalEmitida": false,
  "itens": [
    {
      "id": 1,
      "produtoId": 1,
      "produtoNome": "Pao Frances",
      "quantidade": 10,
      "precoUnitario": 0.75,
      "subtotal": 7.50
    }
  ]
}
```

**Regras de negócio:**
- RN01: FIADO exige `clienteId`
- RN02: cliente negativado (fiado anterior em aberto) não pode fazer novo fiado
- Cancelamento: o backend registra automaticamente o funcionário via token JWT
- Estoque é decrementado ao registrar e restaurado ao cancelar

---

## 8. Caixa

Permissão: **ADMIN, GERENTE**.  
Apenas um caixa pode estar `ABERTO` por vez.

| Método   | Rota                | Descrição                                    |
|----------|---------------------|----------------------------------------------|
| GET      | `/api/caixa`        | Listar todos os caixas (histórico)            |
| GET      | `/api/caixa/aberto` | Caixa aberto no momento (204 se não há nenhum)|
| GET      | `/api/caixa/{id}`   | Buscar por ID                                |
| POST     | `/api/caixa/abrir`  | Abrir caixa                                  |
| PATCH    | `/api/caixa/fechar` | Fechar caixa aberto                          |

### Body — Abrir caixa
```json
{
  "funcionarioId": 1,
  "valorAbertura": 150.00,
  "observacoes": "Troco inicial do dia"
}
```

### Body — Fechar caixa
```json
{
  "valorFechamento": 2345.50,
  "observacoes": "Fechamento normal"
}
```

### Resposta
```json
{
  "id": 1,
  "funcionarioId": 1,
  "funcionarioNome": "Carlos Silva",
  "abertoEm": "2026-05-03T08:00:00",
  "fechadoEm": null,
  "valorAbertura": 150.00,
  "valorFechamento": null,
  "observacoes": "Troco inicial do dia",
  "status": "ABERTO"
}
```

**Status:** `ABERTO`, `FECHADO`

> `GET /api/caixa/aberto` retorna **204 No Content** se nenhum caixa estiver aberto.

---

## 9. Ponto Eletrônico

| Permissão            | Ação                                      |
|----------------------|-------------------------------------------|
| Todos autenticados   | Bater ponto, consultar próprios registros |
| ADMIN, GERENTE       | Ver todos, ajuste manual, relatório       |

| Método   | Rota                            | Descrição                                   |
|----------|---------------------------------|---------------------------------------------|
| POST     | `/api/ponto/bater`              | Registrar entrada/saída                     |
| GET      | `/api/ponto/hoje/{funcId}`      | Registros de hoje de um funcionário         |
| GET      | `/api/ponto/resumo/{funcId}`    | Resumo por período (`?inicio=&fim=`)        |
| GET      | `/api/ponto/periodo`            | Todos os registros por período — ADMIN/GERENTE |
| POST     | `/api/ponto/ajuste`             | Ajuste manual — ADMIN/GERENTE               |

### Body — Bater ponto
```json
{ "funcionarioId": null }
```

> `funcionarioId` pode ser `null` — nesse caso o backend resolve pelo JWT (o próprio funcionário). ADMIN/GERENTE podem passar o ID de outro funcionário para bater o ponto dele.

### Body — Ajuste manual
```json
{
  "funcionarioId": 2,
  "momento": "2026-05-01T08:00:00",
  "tipo": "ENTRADA",
  "observacao": "Esqueceu de bater na entrada"
}
```

**Tipos:** `ENTRADA`, `SAIDA`

### Resposta — Registro
```json
{
  "id": 42,
  "funcionarioId": 2,
  "funcionarioNome": "Carlos Silva",
  "tipo": "ENTRADA",
  "momento": "2026-05-03T08:05:00",
  "ajusteManual": false
}
```

### Resposta — Resumo por dia
```json
[
  {
    "data": "2026-05-03",
    "horasTrabalhadas": "08:05",
    "horasTrabalhadasDecimal": 8.08,
    "horasEsperadasDecimal": 8.0,
    "saldoDecimal": 0.08
  }
]
```

---

## 10. Perfis e Permissões

| Recurso                        | PADEIRO | ATENDENTE | GERENTE | ADMIN |
|--------------------------------|:-------:|:---------:|:-------:|:-----:|
| Auth (login)                   | ✔       | ✔         | ✔       | ✔     |
| Produtos (leitura)             | ✔       | ✔         | ✔       | ✔     |
| Produtos (mutações)            |         |           | ✔       | ✔     |
| Categorias (leitura)           | ✔       | ✔         | ✔       | ✔     |
| Categorias (mutações)          |         |           | ✔       | ✔     |
| Estoque                        |         |           | ✔       | ✔     |
| Clientes                       |         | ✔         | ✔       | ✔     |
| Vendas (registrar, consultar)  |         | ✔         | ✔       | ✔     |
| Vendas (cancelar)              |         |           | ✔       | ✔     |
| Caixa                          |         |           | ✔       | ✔     |
| Funcionários                   |         |           | ✔       | ✔     |
| Funcionários (acesso)          |         |           |         | ✔     |
| Ponto (bater / ver próprio)    | ✔       | ✔         | ✔       | ✔     |
| Ponto (todos / ajuste)         |         |           | ✔       | ✔     |

---

## 11. Padrão de Erros

Todas as respostas de erro seguem o formato:

```json
{
  "status": 422,
  "erro": "Regra de negócio violada",
  "mensagem": "FIADO exige que um cliente seja informado.",
  "timestamp": "2026-05-03T10:30:00"
}
```

| Código | Situação                                              |
|--------|-------------------------------------------------------|
| 400    | Validação de campos (campo obrigatório, formato, etc) |
| 401    | Token ausente ou inválido                             |
| 403    | Perfil sem permissão para a ação                      |
| 404    | Recurso não encontrado                                |
| 422    | Regra de negócio violada                              |
| 500    | Erro interno inesperado                               |

---

*Documentação gerada em 03/05/2026 · Pão FresQUIM v1.0*
