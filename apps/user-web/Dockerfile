FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npx nx build user-web


FROM node:18-slim AS runner
WORKDIR /app
COPY --from=builder /app/dist/apps/user-web ./
ENV PORT=3000
EXPOSE 3000
CMD ["node", "main.js"]