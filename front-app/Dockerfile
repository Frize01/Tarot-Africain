# Image Node pour le dev Vite (hot reload)
FROM node:22-alpine

WORKDIR /app

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9999

ENTRYPOINT ["entrypoint.sh"]
