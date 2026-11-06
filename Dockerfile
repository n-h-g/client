# The NHG client served by nginx, with the websocket of the game and the assets (mounted volumes).
# Built by the docker-compose of the server repository (context: this repository).

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
# --ignore-scripts: the "prepare" script is for Windows (yarn.cmd)
RUN npm ci --ignore-scripts

COPY . .
# general.json is local (gitignored): a clean clone builds with the example; the production overrides are
# in general.production.json
RUN test -f src/game/configuration/general.json \
    || cp src/game/configuration/general.json.example src/game/configuration/general.json
RUN npx vite build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
