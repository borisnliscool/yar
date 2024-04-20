FROM node:21-alpine AS base

ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN pnpm add -g turbo

COPY . .
RUN turbo prune web --docker


FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app

COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
RUN pnpm add -g turbo

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN turbo run build --filter=web...


FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

COPY --from=installer /app .

CMD node apps/web/build/index.js