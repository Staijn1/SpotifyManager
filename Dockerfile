FROM node:lts-alpine as builder

WORKDIR /app
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

COPY . .

RUN npm i


# docker build . -t staijn/spotifymanager:nx-base
