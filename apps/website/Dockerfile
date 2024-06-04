FROM staijn/spotifymanager:nx-base AS builder

ARG NODE_ENV
ARG BUILD_FLAG

RUN npx nx build website ${BUILD_FLAG}

FROM nginx:1.19.2

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist/apps/website/browser ./
COPY --from=builder /app/apps/website/nginx.conf /etc/nginx/nginx.conf
