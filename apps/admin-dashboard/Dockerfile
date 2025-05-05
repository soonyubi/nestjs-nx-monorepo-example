FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npx nx build admin-dashboard


FROM node:18-slim AS runner
WORKDIR /app
COPY --from=builder /app/dist/apps/admin-dashboard ./
ENV PORT=3000
EXPOSE 3000
CMD ["node", "main.js"]