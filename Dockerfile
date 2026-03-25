FROM node:20-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm db:generate

RUN pnpm run build


FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

COPY --from=build /app/dist ./dist
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install --prod

EXPOSE 3000

CMD ["node", "dist/src/main.js"]