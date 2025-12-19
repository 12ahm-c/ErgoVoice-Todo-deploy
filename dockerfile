FROM node:20 AS build

WORKDIR /app

# 🔧 تحسين الشبكة ومنع timeout
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set registry https://registry.npmjs.org/

COPY package*.json ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build