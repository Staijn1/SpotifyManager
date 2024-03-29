FROM node:lts-alpine as builder

WORKDIR /app
RUN apk add --update python3 make g++ && rm -rf /var/cache/apk/*

ARG NODE_ENV
ARG BUILD_FLAGWORKDIR /app/builder

COPY . .

RUN npm i
