# DEV — Tarot Africain (Laragon, sans Docker)

Le front (Vite) tourne sur **:9999** et proxifie `/api`, `/sanctum`, `/broadcasting` vers
l'API Laravel sur **:8000**, et `/app` (WebSocket) vers Reverb sur **:8080**.
Aucun Redis/Docker requis : cache + queue sont en `database`.

## Prérequis (une fois)

Dans `TEMP_API_TAROT/tarot_api` :

```bash
composer install
php artisan migrate         # crée aussi les tables cache/jobs (database driver)
php artisan db:seed         # si des seeders de jeux/tags existent
```

Vérifier `.env` (déjà configuré) :
- `APP_URL=http://localhost:8000`
- `SANCTUM_STATEFUL_DOMAINS=localhost:9999,127.0.0.1:9999`
- `SESSION_DOMAIN=localhost`
- `BROADCAST_CONNECTION=reverb`, `QUEUE_CONNECTION=database`, `CACHE_STORE=database`

Dans `front-app` : `npm install`.

## Lancer (4 process en parallèle)

**API** (`TEMP_API_TAROT/tarot_api`) :

```bash
php artisan serve --port=8000        # API HTTP
php artisan reverb:start --debug     # WebSocket temps réel (:8080)
php artisan queue:work               # OBLIGATOIRE : job différé BroadcastNextDealer
                                     # (sans lui, les manches suivantes ne démarrent pas)
```

**Front** (`front-app`) :

```bash
npm run dev                          # http://localhost:9999
```

## Tester une partie

1. Ouvrir 3+ onglets/navigateurs, créer un compte différent dans chacun.
2. Un joueur crée un salon, les autres rejoignent via le code (ou salon public).
3. L'hôte clique « Lancer la partie » → tout le monde bascule sur le plateau.
4. Distribution → annonces → plis → score → manche suivante (~4 s) → fin de partie.
