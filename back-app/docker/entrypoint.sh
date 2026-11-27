#!/bin/sh
set -e

cd /var/www/html

role="${1:-app}"

install_deps() {
  if [ ! -f vendor/autoload.php ]; then
    echo "==> [backend] Installation des dépendances Composer..."
    composer install --no-interaction --prefer-dist
  fi
}

prepare_env() {
  if [ ! -f .env ]; then
    echo "==> [backend] Création du .env depuis .env.docker"
    cp .env.docker .env
  fi
  # Génère une APP_KEY uniquement si elle est vide (sinon on garde la même)
  if ! grep -qE '^APP_KEY=.+' .env; then
    echo "==> [backend] Génération de la clé d'application"
    php artisan key:generate --force
  fi
}

wait_for_vendor() {
  until [ -f vendor/autoload.php ]; do
    echo "==> [$role] En attente de l'installation des dépendances par le service backend..."
    sleep 2
  done
  until [ -f .env ]; do sleep 1; done
}

case "$role" in
  app)
    install_deps
    prepare_env
    echo "==> [backend] Migrations..."
    php artisan migrate --force || true
    echo "==> [backend] Lancement du serveur sur :8000"
    exec php artisan serve --host=0.0.0.0 --port=8000
    ;;
  reverb)
    wait_for_vendor
    echo "==> [reverb] Lancement du websocket sur :8080"
    exec php artisan reverb:start --host=0.0.0.0 --port=8080
    ;;
  queue)
    wait_for_vendor
    echo "==> [queue] Lancement du worker"
    exec php artisan queue:work --tries=1
    ;;
  *)
    # Permet d'exécuter n'importe quelle commande (ex: docker compose run backend php artisan tinker)
    exec "$@"
    ;;
esac
