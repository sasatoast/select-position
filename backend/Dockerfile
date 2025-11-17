FROM golang:1.21 AS builder

WORKDIR /app

# 依存関係をコピー
COPY go.mod ./

# ソースコードをコピー
COPY main.go ./

# 依存関係をダウンロードしてビルド
RUN go mod download && go mod tidy
RUN CGO_ENABLED=1 go build -o main .

# 実行用の軽量イメージ
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /root/

# ビルドしたバイナリをコピー
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
