# Pao FresQUIM

Sistema de gestao para padaria desenvolvido como projeto academico. O projeto possui backend em Spring Boot, frontend em React e banco PostgreSQL/Supabase.

## O que o sistema faz

- Controle de produtos, categorias e estoque.
- Cadastro e gestao de clientes.
- Registro de vendas com dinheiro, debito, credito, PIX e fiado.
- Controle de saldo devedor de clientes.
- Cancelamento de venda com estorno de estoque.
- Caixa do dia com abertura e fechamento.
- Cadastro de funcionarios, cargos e permissoes.
- Controle de ponto com entrada, saida e calculo de horas.
- Login com JWT.
- Notificacoes automaticas de fiado.
- Dashboard e graficos.
- Chatbot com respostas em texto, tabelas e graficos.
- Recursos de acessibilidade.

## Tecnologias

### Backend

- Java 17 ou superior.
- Spring Boot 3.5.
- Spring Web.
- Spring Data JPA.
- Spring Security.
- JWT.
- PostgreSQL/Supabase.
- Maven.
- Lombok.

### Frontend

- JavaScript.
- React.
- Vite.
- Axios.
- React Router.
- Lucide React.
- Recharts.
- CSS com variaveis de tema.

## Como rodar

### Backend

```bash
cd backend
bash start.sh
```

O script sobe a API em:

```text
http://localhost:8080
```

### Frontend

```bash
cd frontend
npm run dev
```

O frontend normalmente abre em:

```text
http://localhost:5173
```

## Login padrao

```json
{
  "login": "admin",
  "senha": "FresQUIM@2025!"
}
```

## Estrutura do projeto

```text
backend/
  src/main/java/com/grimoire/backend/
    auth, usuario, funcionario, cliente, produto, venda, estoque, caixa,
    ponto, cargos, categoria, notificacao, chat

frontend/
  src/
    componentes, paginas, servicos, contextos, hooks, utilitarios

scripts/
  demo-ngrok.sh
```

## Arquitetura do backend

Fluxo principal:

```text
Controller -> Service -> Repository -> Banco de dados
```

- Controller recebe requisicoes HTTP.
- Service aplica regras de negocio.
- Repository acessa o banco.
- Entity representa tabelas.
- DTO representa entrada e saida da API.

## Modulos principais

### Produtos e estoque

Produtos possuem preco de venda, preco de custo, categoria, estoque atual, estoque minimo e status ativo ou inativo. O estoque e movimentado por entradas e saidas, com historico por produto.

### Clientes e fiado

Clientes podem comprar fiado quando nao estao negativados. O sistema controla saldo devedor, historico de compras e status do cliente.

### Vendas

Vendas baixam estoque automaticamente. Vendas canceladas estornam estoque e ajustam fiado quando necessario.

### Caixa

Controla abertura e fechamento de caixa. Apenas um caixa pode ficar aberto ao mesmo tempo.

### Funcionarios e cargos

Funcionarios possuem cargo, carga horaria, acesso ao sistema e permissoes. Cargos podem ser cadastrados, editados, inativados e reativados.

### Ponto

Funcionarios registram entrada e saida. O sistema calcula horas trabalhadas, horas esperadas e saldo de horas.

### Notificacoes de fiado

O backend possui um agendador que busca vendas fiado pendentes, salva notificacoes na tabela `notificacoes` e marca a venda como `NOTIFICADO`.

No profile local, o agendador roda a cada 30 segundos para facilitar testes.

### Chatbot

O chatbot pode responder em texto ou em blocos estruturados para o frontend renderizar tabelas, graficos e indicadores.

## Documentacao e arquivos auxiliares

- `README.md`: explicacao principal do projeto.
- `Pao-FresQUIM.postman_collection.json`: collection para testar a API no Postman.

## Validacao

Backend:

```bash
cd backend
./mvnw -q -DskipTests compile
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```
