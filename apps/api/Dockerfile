FROM staijn/spotifymanager:nx-base AS builder

RUN npx nx build api

CMD ["node", "./dist/apps/api/main.js"]
