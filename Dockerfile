FROM node:lts-alpine3.10 as builder

ARG NODE_ENV
ARG BUILD_FLAGWORKDIR /app/builder

COPY . .

RUN npm i
