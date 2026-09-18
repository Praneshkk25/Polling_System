# Multi-stage Dockerfile for PulsePoll Go Backend
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install git and build essentials
RUN apk add --no-cache git

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/server

# Final lightweight production image
FROM alpine:3.20

WORKDIR /app

# Install ca-certificates for external SSL/TLS (MongoDB Atlas, etc.)
RUN apk --no-cache add ca-certificates tzdata

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]
