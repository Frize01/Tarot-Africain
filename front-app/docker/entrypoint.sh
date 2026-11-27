#!/bin/sh
set -e

cd /app

# node_modules est un volume anonyme (isolé du host macOS) : on installe dedans
if [ ! -f node_modules/.install-done ]; then
  echo "==> [frontend] Installation des dépendances npm..."
  npm install
  touch node_modules/.install-done
fi

echo "==> [frontend] Lancement de Vite sur :9999"
exec npm run dev -- --host 0.0.0.0 --port 9999
