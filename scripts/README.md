# Scripts do projeto

Esta pasta guarda scripts auxiliares para nao misturar configuracoes de demo com o backend ou frontend.

## Demo com ngrok

Use quando quiser mostrar o sistema para outra pessoa pela internet usando apenas um tunel do ngrok.

Antes, suba o backend:

```bash
cd backend
bash start.sh
```

Depois, suba o frontend:

```bash
cd frontend
npm run dev
```

Por fim, na raiz do projeto:

```bash
bash scripts/demo-ngrok.sh
```

O script valida se backend e frontend estao rodando e abre:

```bash
ngrok http 5173
```

O frontend deve chamar o backend usando `/api`, porque o `vite.config.js` encaminha essas chamadas para `http://localhost:8080`.

Se existir `frontend/.env.local` com `VITE_API_URL` preenchido, deixe vazio durante a demo:

```env
VITE_API_URL=
```
