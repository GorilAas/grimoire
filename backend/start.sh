#!/bin/bash

# ──────────────────────────────────────────────────────────────
#  JAVA_HOME — deixe vazio para usar o Java do sistema,
#  ou defina o caminho completo da sua instalacao Java 17+
#
#  Exemplos:
#    JAVA_HOME="/mnt/c/Program Files/Eclipse Adoptium/jdk-21.0.7.6-hotspot"  # WSL
#    JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.7.6-hotspot"      # Git Bash
#    JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-21.0.7.6-hotspot"       # Git Bash
# ──────────────────────────────────────────────────────────────
JAVA_HOME_OVERRIDE=""

PORT=8080
IS_WSL=false
if uname -r 2>/dev/null | grep -qi "microsoft"; then
  IS_WSL=true
fi

echo ""
echo "=================================="
echo "  Pao FresQUIM -- Backend"
echo "=================================="
echo ""

# -- Resolve JAVA_HOME --
if [ -n "$JAVA_HOME_OVERRIDE" ]; then
  JAVA_HOME="$JAVA_HOME_OVERRIDE"
fi

if [ -z "$JAVA_HOME" ]; then
  for CANDIDATO in \
    "/mnt/c/Program Files/Eclipse Adoptium/jdk-21.0.7.6-hotspot" \
    "/c/Program Files/Eclipse Adoptium/jdk-21.0.7.6-hotspot" \
    "C:/Program Files/Eclipse Adoptium/jdk-21.0.7.6-hotspot" \
    "/mnt/c/Program Files/Java/jdk-24" \
    "/c/Program Files/Java/jdk-24" \
    "C:/Program Files/Java/jdk-24"; do
    if [ -f "$CANDIDATO/bin/java.exe" ] || [ -f "$CANDIDATO/bin/java" ]; then
      JAVA_HOME="$CANDIDATO"
      break
    fi
  done
fi

# Tenta encontrar o Java (override, variavel de ambiente, ou PATH)
if [ -n "$JAVA_HOME" ] && [ -f "$JAVA_HOME/bin/java.exe" ]; then
  JAVA_BIN="$JAVA_HOME/bin/java.exe"
elif [ -n "$JAVA_HOME" ] && [ -f "$JAVA_HOME/bin/java" ]; then
  JAVA_BIN="$JAVA_HOME/bin/java"
elif command -v java &>/dev/null; then
  JAVA_BIN="java"
  JAVA_HOME=""
else
  echo "[ERRO] Java nao encontrado."
  echo ""
  echo "       Opcoes:"
  echo "       1. Instale o Java 17+ e adicione ao PATH"
  echo "       2. Defina JAVA_HOME_OVERRIDE no inicio deste script"
  echo ""
  exit 1
fi

# -- Verifica versao minima (Java 17) --
JAVA_VERSION=$("$JAVA_BIN" -version 2>&1 | head -1)
# Suporta formato antigo (1.8.x) e novo (17.x, 21.x)
_RAW=$(echo "$JAVA_VERSION" | grep -o '"[^"]*"' | tr -d '"')
_FIRST=$(echo "$_RAW" | cut -d'.' -f1)
_SECOND=$(echo "$_RAW" | cut -d'.' -f2)
if [ "$_FIRST" = "1" ]; then JAVA_MAJOR="$_SECOND"; else JAVA_MAJOR="$_FIRST"; fi

echo "[1/3] Java: $JAVA_VERSION"

if [ -n "$JAVA_MAJOR" ] && [ "$JAVA_MAJOR" -lt 17 ] 2>/dev/null; then
  echo ""
  echo "[ERRO] Java $JAVA_MAJOR detectado. Este projeto requer Java 17 ou superior."
  echo "       Defina JAVA_HOME_OVERRIDE no inicio deste script."
  echo ""
  exit 1
fi

# -- Libera a porta se estiver ocupada --
if [ "$IS_WSL" = true ]; then
  PID=$(powershell.exe -NoProfile -Command "(Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess)" 2>/dev/null | tr -d '\r' | head -1)
else
  PID=$(netstat -ano 2>/dev/null | grep ":$PORT.*LISTENING" | awk '{print $5}' | head -1)
fi

if [ -n "$PID" ]; then
  echo "[2/3] Porta $PORT ocupada pelo processo $PID -- encerrando..."
  if [ "$IS_WSL" = true ]; then
    powershell.exe -NoProfile -Command "Stop-Process -Id $PID -Force" > /dev/null 2>&1
  else
    taskkill //F //PID "$PID" > /dev/null 2>&1
  fi
  sleep 2
  echo "      Processo encerrado."
else
  echo "[2/3] Porta $PORT livre."
fi

# -- Sobe o backend --
echo "[3/3] Subindo o backend com profile 'local'..."
echo ""
echo "      Aguarde: 'Started BackendApplication'"
echo "      Para parar: Ctrl + C"
echo ""
echo "----------------------------------"

if [ "$IS_WSL" = true ]; then
  JAVA_HOME_MAVEN=$(wslpath -w "$JAVA_HOME" 2>/dev/null)
  PWD_MAVEN=$(wslpath -w "$PWD" 2>/dev/null)
  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "\$env:JAVA_HOME='$JAVA_HOME_MAVEN'; \$env:Path=\"\$env:JAVA_HOME\bin;\$env:Path\"; Set-Location '$PWD_MAVEN'; .\mvnw.cmd spring-boot:run '-Dspring-boot.run.profiles=local'"
else
  export JAVA_HOME
  ./mvnw spring-boot:run -Dspring-boot.run.profiles=local
fi
