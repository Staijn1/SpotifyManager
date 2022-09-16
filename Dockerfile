FROM node:alpine3.15 as builderARG

ARG NODE_ENV
ARG BUILD_FLAGWORKDIR  /app

RUN apk add --no-cache python2 g++ make

COPY . .

RUN npm i
