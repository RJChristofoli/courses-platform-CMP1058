FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run db:generate && npm run build
EXPOSE 3001
CMD ["sh", "-c", "npm run db:migrate:deploy && npm run start"]
