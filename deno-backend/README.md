# Deno Backend

授業担当管理アプリのバックエンド（Deno Deploy版）

## ローカル開発

```bash
# Denoをインストール（Mac）
brew install deno

# サーバー起動
deno run --allow-net --allow-env --unstable main.ts

# または
deno task start
```

## Deno Deployへのデプロイ

### 1. Deno Deployアカウント作成

1. https://deno.com/deploy にアクセス
2. GitHubアカウントでサインアップ

### 2. プロジェクト作成

1. 「New Project」をクリック
2. GitHub連携
3. `sasatoast/select-position` リポジトリを選択
4. **Entry Point**: `deno-backend/main.ts`
5. デプロイ

### 3. 環境変数（不要）

Deno KVは自動的に利用可能です。

## API エンドポイント

- `GET /api/classes` - 授業一覧取得
- `GET /api/classes/:id` - 授業詳細取得
- `POST /api/classes` - 授業作成
- `POST /api/classes/:id/duplicate` - 授業複製
- `DELETE /api/classes/:id` - 授業削除
- `PUT /api/classes/:classId/slots/:slotId` - タイムスロット更新

## データベース

Deno KV（Key-Value Store）を使用

- キー: `["classes", classId]`
- 値: Class オブジェクト

