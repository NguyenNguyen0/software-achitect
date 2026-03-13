# Stage 1: Build ứng dụng
FROM golang:1.20-alpine AS builder

WORKDIR /app

COPY . .

RUN go build -o app

# Stage 2: Chạy ứng dụng
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/app .

EXPOSE 8080

CMD ["./app"]