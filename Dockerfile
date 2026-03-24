FROM node:20-alpine AS build

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --include=dev 


COPY . .

RUN pnpm db:generate 

RUN pnpm run build 


FROM node:20-alpine AS production


WORKDIR /app

COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 3000


CMD ["node", "dist/src/main.js"]