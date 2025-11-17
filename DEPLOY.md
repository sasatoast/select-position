# 🚀 デプロイ手順

このアプリを **Render** にデプロイして、インターネット上で公開する手順です。

## 📋 必要なもの

- GitHubアカウント
- Renderアカウント（無料）https://render.com/

## 🔧 デプロイ手順

### 1. GitHubにプッシュ

すでにプッシュ済みであればスキップしてOKです。

```bash
git add .
git commit -m "Add deployment configuration"
git push
```

### 2. Renderアカウント作成

1. https://render.com/ にアクセス
2. 「Get Started」または「Sign Up」をクリック
3. GitHubアカウントで連携してサインアップ

### 3. バックエンドをデプロイ

#### 3-1. 新しいWebサービスを作成

1. Renderダッシュボードで「New +」→「Web Service」を選択
2. GitHubリポジトリを連携
3. `sasatoast/select-position` リポジトリを選択

#### 3-2. バックエンドの設定

- **Name**: `selectposition-backend`（任意の名前でOK）
- **Region**: `Singapore`（日本に近い）
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Docker`
- **Instance Type**: `Free`

#### 3-3. 環境変数を設定

「Advanced」→「Add Environment Variable」で以下を追加：

| Key | Value |
|-----|-------|
| GIN_MODE | release |
| PORT | 8080 |

#### 3-4. ディスクを追加（重要！）

データベースを永続化するため：

1. 「Add Disk」をクリック
2. **Name**: `selectposition-data`
3. **Mount Path**: `/root`
4. **Size**: `1 GB`

#### 3-5. デプロイ

「Create Web Service」をクリック

数分待つとバックエンドがデプロイされます。
デプロイ完了後、URLが表示されます（例: `https://selectposition-backend.onrender.com`）

### 4. フロントエンドをデプロイ

#### 4-1. 環境変数ファイルを更新

まず、バックエンドのURLを確認して、フロントエンドのコードを更新します。

`frontend/src/App.tsx` の API_URL を更新：

```typescript
// ローカル用
// const API_URL = 'http://localhost:8080/api'

// 本番用（あなたのバックエンドURLに置き換えてください）
const API_URL = 'https://あなたのバックエンドURL.onrender.com/api'
```

変更をコミット＆プッシュ：

```bash
git add .
git commit -m "Update API URL for production"
git push
```

#### 4-2. 新しいStaticサイトを作成

1. Renderダッシュボードで「New +」→「Static Site」を選択
2. 同じリポジトリを選択

#### 4-3. フロントエンドの設定

- **Name**: `selectposition-frontend`（任意の名前でOK）
- **Branch**: `main`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

#### 4-4. デプロイ

「Create Static Site」をクリック

数分待つとフロントエンドがデプロイされます。
デプロイ完了後、URLが表示されます（例: `https://selectposition-frontend.onrender.com`）

### 5. CORS設定を更新

バックエンドのCORS設定を更新して、フロントエンドのURLを許可します。

`backend/main.go` を編集：

```go
r.Use(cors.New(cors.Config{
    AllowOrigins: []string{
        "http://localhost:5173", 
        "http://localhost:5174",
        "https://あなたのフロントエンドURL.onrender.com", // ← 追加
    },
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
    AllowCredentials: true,
}))
```

変更をコミット＆プッシュ：

```bash
git add .
git commit -m "Update CORS for production"
git push
```

Renderが自動的に再デプロイします。

### 6. 完了！🎉

フロントエンドのURLにアクセスすると、アプリが動作します！

例: `https://selectposition-frontend.onrender.com`

## 💡 注意事項

### 無料プランの制限

- **バックエンド**: 15分間アクセスがないとスリープします（初回アクセス時は起動に30秒程度かかります）
- **データベース**: 1GBまで無料
- **帯域幅**: 月100GB無料

### トラブルシューティング

#### バックエンドに接続できない

1. バックエンドのログを確認（Renderダッシュボード → Logs）
2. CORS設定が正しいか確認
3. API URLが正しいか確認

#### データベースがリセットされる

- ディスク（Persistent Disk）を追加したか確認
- マウントパスが `/root` になっているか確認

## 🔄 更新方法

コードを更新したら：

```bash
git add .
git commit -m "Update features"
git push
```

Renderが自動的に検知して再デプロイします！

## 📊 モニタリング

Renderダッシュボードで以下を確認できます：

- デプロイ状況
- ログ
- CPU/メモリ使用量
- リクエスト数

## 💰 料金

- **無料プラン**: 個人利用には十分
- **有料プラン**: スリープなし、より高速（$7/月〜）

## 🆘 サポート

問題が発生した場合：

1. Renderのドキュメント: https://render.com/docs
2. Renderのコミュニティフォーラム
3. GitHubのIssue

