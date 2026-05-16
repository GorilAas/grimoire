#!/usr/bin/env bash

set -e

FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:8080"
FRONTEND_ENV_FILE="frontend/.env.local"
IS_WSL=false

if uname -r 2>/dev/null | grep -qi "microsoft"; then
  IS_WSL=true
fi

echo ""
echo "=================================="
echo "  Pao FresQUIM -- Demo ngrok"
echo "=================================="
echo ""

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

resolver_ngrok() {
  if command_exists ngrok; then
    echo "ngrok"
    return 0
  fi

  if command_exists powershell.exe; then
    local caminho
    caminho=$(powershell.exe -NoProfile -Command "(Get-Command ngrok.exe -ErrorAction SilentlyContinue).Source" 2>/dev/null | tr -d '\r' | head -1)
    if [ -n "$caminho" ]; then
      echo "$caminho"
      return 0
    fi
  fi

  return 1
}

check_url() {
  local url="$1"
  if [ "$IS_WSL" = true ] && command_exists powershell.exe; then
    powershell.exe -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing '$url' -TimeoutSec 5 | Out-Null; exit 0 } catch { exit 1 }" >/dev/null 2>&1
    return $?
  fi

  if command_exists curl; then
    curl -fsS "$url" >/dev/null 2>&1
  else
    return 1
  fi
}

NGROK_BIN=$(resolver_ngrok || true)

if [ -z "$NGROK_BIN" ]; then
  echo "[ERRO] ngrok nao encontrado."
  echo ""
  echo "Instale o ngrok e rode novamente:"
  echo "https://ngrok.com/download"
  echo ""
  exit 1
fi

echo "[1/4] Verificando backend..."
if check_url "$BACKEND_URL/actuator/health"; then
  echo "      Backend OK: $BACKEND_URL"
else
  echo "[ERRO] Backend nao esta respondendo."
  echo ""
  echo "Abra outro terminal e rode:"
  echo "cd backend"
  echo "bash start.sh"
  echo ""
  exit 1
fi

echo "[2/4] Verificando frontend..."
if check_url "$FRONTEND_URL"; then
  echo "      Frontend OK: $FRONTEND_URL"
else
  echo "[ERRO] Frontend nao esta respondendo."
  echo ""
  echo "Abra outro terminal e rode:"
  echo "cd frontend"
  echo "npm run dev"
  echo ""
  exit 1
fi

echo "[3/4] Verificando configuracao do frontend..."
if [ -f "$FRONTEND_ENV_FILE" ] && grep -Eq "^VITE_API_URL=.+" "$FRONTEND_ENV_FILE"; then
  echo "[AVISO] Existe VITE_API_URL definido em $FRONTEND_ENV_FILE."
  echo "        Para a demo via ngrok funcionar melhor, deixe VITE_API_URL vazio"
  echo "        ou remova essa linha, porque o Vite deve usar o proxy /api."
  echo ""
fi

echo "[4/4] Abrindo ngrok para o frontend..."
echo ""
echo "Use a URL HTTPS exibida pelo ngrok."
echo "O frontend chamara o backend por /api usando o proxy do Vite."
echo ""
echo "Para parar: Ctrl + C"
echo "----------------------------------"
echo ""

if [ "$IS_WSL" = true ]; then
  powershell.exe -NoProfile -Command "& '$NGROK_BIN' http 5173"
else
  "$NGROK_BIN" http 5173
fi
