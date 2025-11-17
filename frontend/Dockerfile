FROM node:20-alpine

WORKDIR /app

# 依存関係をコピーしてインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

EXPOSE 5173

# Viteを起動
CMD ["npm", "run", "dev"]

