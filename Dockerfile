# Anwendung in normaler Distro kompilieren
FROM golang:tip-alpine3.23 AS build
WORKDIR /src
COPY ./go.mod .
RUN go mod download
COPY ./main.go .
RUN go build -trimpath -ldflags="-s -w" -o /out/server .

# Minimalistische Runtime erstellen
# Default-Port ist 3000
FROM scratch
WORKDIR /app
COPY --from=build /out/server /app/server
COPY ./html /app/html
ENV GIN_MODE=release
ENV PORT=3000
ENV PERSISTENCE=ONDISK
EXPOSE 3000
ENTRYPOINT ["/app/server"]