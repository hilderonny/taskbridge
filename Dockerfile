FROM node:25.8.1-alpine3.23

WORKDIR /app

COPY ./api ./api/
COPY ./html ./html/
COPY ./package*.json ./
COPY ./Helper.mjs ./
COPY ./server.crt ./
COPY ./server.key ./
COPY ./server.mjs ./

RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm ci --no-audit --no-fund && \
    npm cache clean --force

ENV PORT=3000
ENV HTTPSPORT=3443
ENV PERSISTENCE=ONDISK

EXPOSE 3000
EXPOSE 3443

CMD ["node", "./server.mjs"]