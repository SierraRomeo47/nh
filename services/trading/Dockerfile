# Simple Node.js service container for dev
FROM node:20-alpine
RUN apk add --no-cache wget
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "dev"]

