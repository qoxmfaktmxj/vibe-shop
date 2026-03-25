FROM node:22-alpine AS deps
WORKDIR /workspace/apps/storefront

COPY apps/storefront/package.json apps/storefront/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /workspace/apps/storefront

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

COPY --from=deps /workspace/apps/storefront/node_modules ./node_modules
COPY apps/storefront ./
COPY packages /workspace/packages
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY apps/storefront/package.json apps/storefront/package-lock.json ./
COPY --from=deps /workspace/apps/storefront/node_modules ./node_modules

COPY --from=builder /workspace/apps/storefront/.next ./.next
COPY --from=builder /workspace/apps/storefront/public ./public
COPY --from=builder /workspace/apps/storefront/next.config.ts ./next.config.ts
COPY --from=builder /workspace/apps/storefront/tsconfig.json ./tsconfig.json

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
