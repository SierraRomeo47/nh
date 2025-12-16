# Multi-stage build for production
FROM node:20-alpine AS builder
RUN apk add --no-cache wget
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache wget
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3007
CMD ["npm", "start"]
