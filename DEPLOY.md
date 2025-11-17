# 🚀 デプロイ手順（Railway）

このアプリを **Railway** にデプロイして、インターネット上で公開する手順です。

## 📋 必要なもの

- GitHubアカウント
- Railwayアカウント（無料）https://railway.app/

## ✨ Railwayの利点

✅ **$5の無料クレジット/月**（使い切るまで課金なし）
✅ **永続ボリューム対応**（SQLiteが使える）
✅ **Docker対応**（そのまま使える）
✅ **GitHubと連携**（自動デプロイ）
✅ **UIが超簡単**

## 🔧 デプロイ手順

### 1. GitHubにプッシュ

すでにプッシュ済みであればスキップしてOKです。

```bash
git add .
git commit -m "Add deployment configuration"
git push
```

### 2. Railwayアカウント作成

1. https://railway.app/ にアクセス
2. 「Login」をクリック
3. 「Login with GitHub」でGitHubアカウントと連携
4. 初回は$5の無料クレジットが付与されます

### 3. 新しいプロジェクトを作成

1. Railwayダッシュボードで「New Project」をクリック
2. 「Deploy from GitHub repo」を選択
3. リポジトリを連携（初回のみ）
4. `sasatoast/select-position` リポジトリを選択

### 4. バックエンドをデプロイ

#### 4-1. サービスの設定

Railwayが自動的に検出したら：

1. `backend` サービスを選択
2. 「Settings」タブを開く

#### 4-2. 環境変数を設定

「Variables」タブで以下を追加：

| Variable | Value |
|----------|-------|
| `GIN_MODE` | `release` |
| `PORT` | `8080` |

#### 4-3. ボリュームを追加（重要！）

データベースを永続化するため：

1. 「Settings」タブ
2. 「Volumes」セクションで「+ New Volume」をクリック
3. **Mount Path**: `/root`

保存すると自動的にデプロイが始まります。

#### 4-4. 公開URLを取得

1. 「Settings」タブ
2. 「Networking」セクション
3. 「Generate Domain」をクリック

URLが生成されます（例: `selectposition-backend-production.up.railway.app`）

### 5. フロントエンドをデプロイ

#### 5-1. フロントエンドサービスを追加

1. プロジェクトのルートに戻る
2. 「+ New」をクリック
3. 「GitHub Repo」→ 同じリポジトリを選択

#### 5-2. フロントエンドの設定

1. `frontend` サービスを選択
2. 「Settings」タブ
3. **Root Directory**: `frontend` に設定
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npx serve -s dist -l $PORT`

#### 5-3. 環境変数を設定

「Variables」タブで以下を追加：

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://あなたのバックエンドURL.railway.app/api` |

バックエンドのURLは前の手順で取得したものを使用してください。

#### 5-4. 公開URLを取得

1. 「Settings」タブ
2. 「Networking」セクション
3. 「Generate Domain」をクリック

### 6. バックエンドのCORS設定を更新

バックエンドの環境変数に追加：

1. `backend` サービスを選択
2. 「Variables」タブ
3. 以下を追加：

| Variable | Value |
|----------|-------|
| `FRONTEND_URL` | `https://あなたのフロントエンドURL.railway.app` |

保存すると自動的に再デプロイされます。

### 7. 完了！🎉

フロントエンドのURLにアクセスすると、アプリが動作します！

例: `https://selectposition-frontend-production.up.railway.app`

## 💡 Railway の使い方

### 自動デプロイ

GitHubにプッシュすると自動的に再デプロイされます：

```bash
git add .
git commit -m "新機能追加"
git push
```

### ログの確認

1. サービスを選択
2. 「Deployments」タブ
3. 最新のデプロイをクリック
4. 「View Logs」でログを確認

### 使用量の確認

1. プロジェクト画面右上の「Usage」をクリック
2. 月の使用量と残りクレジットを確認

## ⚠️ 料金について

### 無料枠

- **$5/月の無料クレジット**
- 使い切るまで課金なし
- 小規模なアプリなら十分

### 使用量の目安

- バックエンド（常時起動）: 約$3-4/月
- フロントエンド（静的サイト）: 約$0.5-1/月
- **合計**: 約$4-5/月 → **無料枠内で収まる！**

### 無料クレジットを使い切ったら

1. クレジットカードを登録（従量課金）
2. サービスを停止
3. 他のサービスに移行（Fly.io など）

## 🔧 トラブルシューティング

### バックエンドに接続できない

1. バックエンドのログを確認
2. `PORT` 環境変数が設定されているか確認
3. ボリュームがマウントされているか確認（`/root`）

### データが保存されない

1. 「Settings」→「Volumes」でボリュームが追加されているか確認
2. Mount Path が `/root` になっているか確認

### フロントエンドがビルドエラー

1. `VITE_API_URL` が正しく設定されているか確認
2. ログを確認して、ビルドコマンドが正しいか確認

### 無料クレジットをすぐ使い切ってしまう

1. 使っていないサービスを停止
2. 開発時はローカルで動作確認
3. 本番デプロイは必要なときだけ

## 📊 Railwayの管理画面

### Metrics（メトリクス）

- CPU使用率
- メモリ使用率
- ネットワーク使用量

### Variables（環境変数）

- 環境変数の追加・編集・削除
- 変更すると自動的に再デプロイ

### Settings（設定）

- Root Directory: サブディレクトリの指定
- Build Command: ビルドコマンド
- Start Command: 起動コマンド
- Volumes: 永続ボリューム

## 🔄 更新の流れ

```bash
# 1. コードを修正
vim frontend/src/App.tsx

# 2. ローカルで確認
docker-compose up

# 3. コミット & プッシュ
git add .
git commit -m "機能改善"
git push

# 4. Railwayが自動的に再デプロイ（数分待つ）
```

## 🆘 サポート

問題が発生した場合：

1. Railwayのドキュメント: https://docs.railway.app/
2. Railwayのコミュニティ: https://discord.gg/railway
3. GitHubのIssue

---

## 📝 設定まとめ

### バックエンド設定

```
Root Directory: backend
Environment Variables:
  - GIN_MODE=release
  - PORT=8080
  - FRONTEND_URL=https://your-frontend.railway.app
Volume:
  - Mount Path: /root
```

### フロントエンド設定

```
Root Directory: frontend
Build Command: npm install && npm run build
Start Command: npx serve -s dist -l $PORT
Environment Variables:
  - VITE_API_URL=https://your-backend.railway.app/api
```

---

これでRailwayへのデプロイは完璧です！🚂✨
