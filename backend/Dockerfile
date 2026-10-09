FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm@11.19.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY prisma ./prisma
RUN DATABASE_URL="postgresql://postgres:postgres@postgres:5432/yustextile?schema=public" pnpm db:generate

COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN pnpm build

EXPOSE 4000
CMD ["sh", "-c", "pnpm db:deploy && node dist/main.js"]
