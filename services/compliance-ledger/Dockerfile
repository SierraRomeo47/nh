# Simple Node.js service container for dev
FROM node:20-alpine
RUN apk add --no-cache wget openssl openssl-dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
ENV PORT=3006
EXPOSE 3006
CMD ["npm", "run", "dev"]
