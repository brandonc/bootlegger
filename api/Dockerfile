FROM node:12 as builder
WORKDIR /app
ENV NODE_ENV=development

ADD . .

RUN npm install
RUN npm run build

FROM node:12
EXPOSE 3000
ENV LOG_LEVEL=info
ENV NODE_ENV=production

WORKDIR /app

ADD package.json .
ADD package-lock.json .

COPY --from=builder /app/dist .

RUN npm ci --only=production

CMD ["node", "./index.js"]