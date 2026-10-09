# Build from the repository root: docker build -f backend/Dockerfile .
FROM node:22-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
RUN pnpm install --frozen-lockfile --filter pukki-backend
COPY backend backend
RUN pnpm --filter pukki-backend build

FROM node:22-bookworm-slim
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
RUN pnpm install --frozen-lockfile --prod --filter pukki-backend
COPY --from=build /app/backend/dist backend/dist
COPY backend/certificates backend/certificates
COPY backend/db backend/db
ENV NODE_ENV=production
USER node
EXPOSE 4000
WORKDIR /app/backend
CMD ["node", "dist/index.js"]
