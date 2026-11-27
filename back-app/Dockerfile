# Image PHP pour Laravel (API + Reverb + queue)
# PHP 8.4 requis : le composer.lock fige Symfony 8.x qui exige php >= 8.4.1
FROM php:8.4-cli

# Dépendances système + extensions PHP nécessaires à Laravel / Reverb / Postgres
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libicu-dev \
    && docker-php-ext-install \
        pdo_mysql \
        bcmath \
        pcntl \
        sockets \
        zip \
        intl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Entrypoint qui gère l'install des deps, la clé d'app, les migrations
# puis lance le bon process selon le rôle (app / reverb / queue)
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]
CMD ["app"]
