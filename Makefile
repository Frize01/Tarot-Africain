# Raccourcis Docker (OrbStack) pour le projet Tarot Africain

.PHONY: up down build logs restart ps migrate fresh tinker sh-back sh-front db-cli

up:            ## Démarre toute la stack (front, back, reverb, queue, db)
	docker compose up -d --build

down:          ## Arrête et supprime les conteneurs
	docker compose down

build:         ## Reconstruit les images
	docker compose build

logs:          ## Suit les logs de tous les services
	docker compose logs -f

restart:       ## Redémarre tous les services
	docker compose restart

ps:            ## Liste les services et leur état
	docker compose ps

migrate:       ## Lance les migrations
	docker compose exec backend php artisan migrate

fresh:         ## Reset complet de la base + migrations + seed
	docker compose exec backend php artisan migrate:fresh --seed

tinker:        ## Ouvre un tinker Laravel
	docker compose exec backend php artisan tinker

sh-back:       ## Shell dans le conteneur backend
	docker compose exec backend sh

sh-front:      ## Shell dans le conteneur frontend
	docker compose exec frontend sh

db-cli:        ## Ouvre le client MySQL sur la base
	docker compose exec db mysql -u tarot -psecret tarot
