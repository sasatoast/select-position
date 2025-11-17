# 🚀 デプロイ手順（ngrok）

このアプリを **ngrok** でインターネットに公開する手順です。

## 📋 必要なもの

- ngrok アカウント（無料）https://ngrok.com/
- ローカルで Docker が動いていること

## ✨ ngrok の利点

✅ **完全無料**（無料プランで十分）
✅ **コード変更不要**（SQLite そのまま使える）
✅ **今すぐ使える**（5 分で公開）
✅ **セットアップ超簡単**

## ⚠️ 注意点

- **PC を起動し続ける必要がある**
- **URL が毎回変わる**（無料プランの場合）
  - 有料プラン（$8/月）で URL を固定できる
- 友人と「今から使うよ！」という感じで共有する形

---

## 🔧 セットアップ手順

### 1. ngrok をインストール

```bash
# Homebrewでインストール（Mac）
brew install ngrok/ngrok/ngrok
```

### 2. ngrok アカウント作成

1. https://ngrok.com/ にアクセス
2. 「Sign up」をクリック（GitHub アカウントで連携可能）
3. ダッシュボードに移動

### 3. 認証トークンを設定

1. ngrok ダッシュボードで「Your Authtoken」を確認
2. トークンをコピー
3. ターミナルで実行：

```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### 4. ローカルでアプリを起動

```bash
cd /Users/ryo/SelectPosition

# Docker Composeで起動
docker-compose up -d

# 起動確認
docker-compose ps
```

両方のコンテナが `Up` になっていれば OK です。

### 5. バックエンドを公開

```bash
# バックエンド（ポート8080）を公開
ngrok http 8080
```

以下のような画面が表示されます：

```
ngrok

Session Status                online
Account                       your-account (Plan: Free)
Version                       3.x.x
Region                        Japan (jp)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xxx-xxx.ngrok-free.app -> http://localhost:8080

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**重要:** `Forwarding` の `https://xxxx-xxx-xxx.ngrok-free.app` が公開 URL です！

### 6. フロントエンドの設定を更新

別のターミナルを開いて：

```bash
cd /Users/ryo/SelectPosition/frontend

# .envファイルを作成/更新
echo "VITE_API_URL=https://あなたのngrok URL.ngrok-free.app/api" > .env

# 例:
# echo "VITE_API_URL=https://1234-567-890.ngrok-free.app/api" > .env

# フロントエンドを再起動
docker-compose restart frontend
```

### 7. フロントエンドも公開（オプション）

別のターミナルで：

```bash
# フロントエンド（ポート5173）を公開
ngrok http 5173
```

または、フロントエンドは `http://localhost:5173` でローカルアクセスでも OK。

---

## 🎉 完了！

### バックエンド

`https://xxxx.ngrok-free.app` でアクセス可能

### フロントエンド

- ngrok で公開した場合: `https://yyyy.ngrok-free.app`
- ローカルのみ: `http://localhost:5173`

### 友人と共有する方法

1. ngrok の URL（バックエンド）を確認
2. フロントエンドの ngrok URL を友人に教える
3. みんなでアクセス！

---

## 💡 使い方

### 起動するとき

```bash
# 1. Dockerを起動
cd /Users/ryo/SelectPosition
docker-compose up -d

# 2. バックエンドを公開
ngrok http 8080

# 3. （別ターミナル）フロントエンドを公開
ngrok http 5173
```

### 停止するとき

```bash
# ngrokを停止（Ctrl+C）

# Dockerを停止
docker-compose down
```

### 次回起動時

ngrok の URL が変わるので、フロントエンドの `.env` を更新：

```bash
cd frontend
echo "VITE_API_URL=https://新しいngrok URL.ngrok-free.app/api" > .env
docker-compose restart frontend
```

---

## 🚀 便利な使い方

### ngrok の管理画面

ngrok 起動中に http://localhost:4040 にアクセスすると：

- リクエストの履歴
- リクエスト/レスポンスの詳細
- デバッグ情報

が見られます！

### スクリプトで簡単起動

`start-ngrok.sh` を作成：

```bash
#!/bin/bash

# Dockerを起動
docker-compose up -d

# 3秒待つ
sleep 3

# ngrokでバックエンドを公開
echo "バックエンドを公開中..."
ngrok http 8080
```

実行：

```bash
chmod +x start-ngrok.sh
./start-ngrok.sh
```

---

## 💰 料金

### 無料プラン

- ✅ 制限なしの HTTP/HTTPS トンネル
- ✅ 十分な帯域幅
- ⚠️ URL が毎回変わる
- ⚠️ ngrok のバナーが表示される

### 有料プラン（$8/月〜）

- ✅ カスタム/固定ドメイン
- ✅ バナーなし
- ✅ 複数トンネル同時使用
- ✅ より高速

このアプリなら無料プランで十分です！

---

## 🔧 トラブルシューティング

### ngrok に接続できない

**確認:**

1. Docker が起動しているか: `docker-compose ps`
2. ローカルで動作しているか: `curl http://localhost:8080/api/classes`
3. ngrok が正しく起動しているか

### 友人が「403 Forbidden」と表示される

**原因:** ngrok の無料プランでは初回アクセス時に警告ページが表示される

**解決:** 警告ページで「Visit Site」をクリックしてもらう

### フロントエンドがバックエンドに接続できない

**確認:**

1. `.env` の `VITE_API_URL` が正しい ngrok URL になっているか
2. フロントエンドを再起動したか: `docker-compose restart frontend`

### CORS エラーが出る

バックエンドの環境変数を設定：

```bash
# docker-compose.ymlに追加
services:
  backend:
    environment:
      - FRONTEND_URL=https://あなたのフロントエンドのngrok URL.ngrok-free.app
```

再起動：

```bash
docker-compose restart backend
```

---

## 📝 ワークフロー例

### 友人と授業の分担を決めるとき

```bash
# 1. あなた: アプリを起動
cd /Users/ryo/SelectPosition
docker-compose up -d
ngrok http 8080  # バックエンド
ngrok http 5173  # フロントエンド（別ターミナル）

# 2. あなた: URLをLINEなどで共有
「今から使えるよ！
 https://xxxx.ngrok-free.app
 で開いてね」

# 3. 友人: URLにアクセス
ブラウザで開く → 警告ページで「Visit Site」をクリック

# 4. みんな: 授業を作成して分担を決める
「数学IA - 11/18」を作成
→ 各自が担当する時間帯をクリックして名前を入力

# 5. 完了: データは自動保存
次回起動時も同じデータが残っている
```

---

## 🆘 サポート

問題が発生した場合：

1. ngrok のドキュメント: https://ngrok.com/docs
2. ngrok のコミュニティ: https://ngrok.com/slack
3. GitHub の Issue

---

これで ngrok を使ったデプロイは完璧です！🎉
PC を起動している間だけ、友人とアプリを共有できます。
