#!/bin/bash

JAVA_HOME="C:/Program Files/Eclipse Adoptium/jdk-21.0.7.6-hotspot"
PORT=8080

echo ""
echo "=================================="
echo "  Pao FresQUIM -- Backend"
echo "=================================="
echo ""

# -- Verifica se o Java 21 existe --
if [ ! -f "$JAVA_HOME/bin/java.exe" ]; then
  echo "[ERRO] Java 21 nao encontrado em: $JAVA_HOME"
  echo "       Ajuste a variavel JAVA_HOME no inicio deste script."
  exit 1
fi

echo "[1/3] Java: $($JAVA_HOME/bin/java -version 2>&1 | head -1)"

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
