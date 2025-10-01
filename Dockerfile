FROM node:20.11-alpine AS builder

RUN npm i -g pnpm @nestjs/cli

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG INFISICAL_MACHINE_IDENTITY_CLIENT_ID
ARG INFISICAL_MACHINE_IDENTITY_CLIENT_SECRET
ARG INFISICAL_ENVIRONMENT
ARG INFISICAL_PROJECT_ID

RUN pnpm run prisma:generate

RUN pnpm build

RUN ls -la dist && ls -la dist/src && [ -f dist/src/main.js ]

FROM node:20.11-alpine AS production

RUN npm i -g pnpm

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/scripts ./scripts
COPY --from=builder /usr/src/app/start.sh ./start.sh

RUN chmod +x start.sh

RUN ls -la && ls -la dist && [ -f dist/src/main.js ]

EXPOSE 3060

CMD ["./start.sh"]