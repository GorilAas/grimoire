#!/bin/bash

# ──────────────────────────────────────────────────────────────
#  JAVA_HOME — deixe vazio para usar o Java do sistema,
#  ou defina o caminho completo da sua instalacao Java 17+
#
#  Exemplos:
#    JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-21.0.7.6-hotspot"
#    JAVA_HOME="C:/Program Files/Java/zulu17.50.19-ca-jdk17.0.11-win_x64"
#    JAVA_HOME="C:/Program Files/Java/jdk-24"
# ──────────────────────────────────────────────────────────────
JAVA_HOME_OVERRIDE="C:/Program Files/Eclipse Adoptium/jdk-21.0.7.6-hotspot"

PORT=8080

echo ""
echo "=================================="
echo "  Pao FresQUIM -- Backend"
echo "=================================="
echo ""

# -- Resolve JAVA_HOME --
if [ -n "$JAVA_HOME_OVERRIDE" ]; then
  JAVA_HOME="$JAVA_HOME_OVERRIDE"
fi

# Tenta encontrar o Java (override, variavel de ambiente, ou PATH)
if [ -n "$JAVA_HOME" ] && [ -f "$JAVA_HOME/bin/java.exe" ]; then
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
PID=$(netstat -ano 2>/dev/null | grep ":$PORT.*LISTENING" | awk '{print $5}' | head -1)

if [ -n "$PID" ]; then
  echo "[2/3] Porta $PORT ocupada pelo processo $PID -- encerrando..."
  taskkill //F //PID "$PID" > /dev/null 2>&1
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

export JAVA_HOME
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
