FROM spotifymanager:nx-base AS builder

ARG NODE_ENV
ARG BUILD_FLAG

WORKDIR /app
RUN npx nx build api ${BUILD_FLAG}


FROM spotifymanager:nx-base

WORKDIR /app
COPY --from=builder /app ./

ENV NODE_ENV=$NODE_ENV

CMD ["node", "./dist/apps/api/main.js"]
