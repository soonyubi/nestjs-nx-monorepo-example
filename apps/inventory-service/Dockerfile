FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npx nx build inventory-service


FROM node:18-slim AS runner
WORKDIR /app
COPY --from=builder /app/dist/apps/inventory-service ./
ENV PORT=3000
EXPOSE 3000
CMD ["node", "main.js"]