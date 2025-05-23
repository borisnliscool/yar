FROM node:21-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS installer
RUN apk add --no-cache libc6-compat

WORKDIR /app
RUN pnpm add -g turbo

COPY . .
RUN turbo prune backend --docker


FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

COPY .gitignore .gitignore
COPY --from=installer /app/out/json/ .
COPY --from=installer /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=installer /app/turbo.json ./turbo.json
COPY --from=installer /app/apps/backend/prisma ./prisma

RUN pnpm install --frozen-lockfile
RUN pnpm add -g turbo prisma
RUN prisma generate

COPY --from=installer /app/out/full/ .
COPY turbo.json turbo.json

RUN turbo run build --filter=backend...


FROM base AS runner
WORKDIR /app

RUN apk add python3
RUN pnpm add -g prisma

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

COPY --from=builder /app .


CMD pnpm exec prisma migrate deploy && node apps/backend/dist/index.js