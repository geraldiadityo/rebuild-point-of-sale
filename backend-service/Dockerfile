FROM node:20-alpine AS Builder

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build
RUN npm prune --production

# production mode

FROM node:20-alpine
WORKDIR /usr/src/app

COPY --from=Builder /usr/src/app/package*.json ./
COPY --from=Builder /usr/src/app/node_modules ./node_modules
COPY --from=Builder /usr/src/app/prisma ./prisma

COPY --from=Builder /usr/src/app/dist ./dist
COPY --from=Builder /usr/src/app/entrypoint.sh .

RUN chmod +x ./entrypoint.sh

EXPOSE 8000

CMD ["./entrypoint.sh"]