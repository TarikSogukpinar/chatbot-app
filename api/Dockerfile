
FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm \
    && pnpm config set store-dir /usr/src/app/.pnpm-store

COPY package*.json ./

RUN pnpm install

COPY . .


RUN pnpm add @nestjs/cli

RUN pnpm run build

RUN ls -la dist

ENV NODE_ENV=development

EXPOSE 7071

CMD ["node", "dist/main.js"]