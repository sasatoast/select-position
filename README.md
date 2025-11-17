# 授業担当管理アプリ

友人たちと授業の時間帯を分担管理するための Web アプリケーションです。

## 機能

- 📝 授業の作成（授業名と時間帯を設定）
- 👥 タイムスロットへの担当者割り当て
- 🔄 リアルタイムでの共有
- 🗑️ 授業の削除

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **バックエンド**: Go + Gin Framework
- **データベース**: SQLite

## セットアップ

### 🐳 Docker を使う方法（推奨）

#### 簡単起動

```bash
./start.sh
```

または

```bash
docker-compose up --build -d
```

たったこれだけで、バックエンドとフロントエンドの両方が起動します！

- フロントエンド: `http://localhost:5173`
- バックエンド API: `http://localhost:8080`

#### ログを見る

```bash
docker-compose logs -f
```

#### 停止する

```bash
./stop.sh
```

または

```bash
docker-compose down
```

### 💻 ローカル環境で実行する方法

#### バックエンド（Go）

```bash
cd backend
go mod download
go run main.go
```

バックエンドサーバーが `http://localhost:8080` で起動します。

#### フロントエンド（React）

```bash
cd frontend
npm install
npm run dev
```

フロントエンドが `http://localhost:5173` で起動します。

## 使い方

1. ブラウザで `http://localhost:5173` にアクセス
2. 「新しい授業を作成」ボタンをクリック
3. 授業名と時間帯（最大 6 つ）を入力
4. 作成した授業のタイムスロットをクリックして担当者名を入力

## プロジェクト構造

```
SelectPosition/
├── docker-compose.yml # Docker Compose設定
├── start.sh          # 簡単起動スクリプト
├── stop.sh           # 停止スクリプト
├── backend/          # Goバックエンド
│   ├── Dockerfile    # バックエンド用Dockerfile
│   ├── main.go       # APIサーバー
│   ├── go.mod        # Go依存関係
│   └── classes.db    # SQLiteデータベース（自動生成）
└── frontend/         # Reactフロントエンド
    ├── Dockerfile    # フロントエンド用Dockerfile
    ├── src/
    │   ├── App.tsx   # メインコンポーネント
    │   ├── App.css   # スタイル
    │   ├── main.tsx  # エントリーポイント
    │   └── index.css # グローバルスタイル
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

## API エンドポイント

- `GET /api/classes` - 授業一覧取得
- `GET /api/classes/:id` - 授業詳細取得
- `POST /api/classes` - 授業作成
- `DELETE /api/classes/:id` - 授業削除
- `PUT /api/classes/:classId/slots/:slotId` - タイムスロットへの担当者割り当て

## 開発者向け

### 依存関係

**Go（backend/go.mod）:**

- github.com/gin-gonic/gin - Web フレームワーク Go（backend/go.mod）:
- github.com/gin-contrib/cors - CORS サポート
- github.com/mattn/go-sqlite3 - SQLite ドライバー

**Node.js（frontend/package.json）:**

- react, react-dom - UI ライブラリ
- typescript - 型安全性
- vite - 高速ビルドツール

### データベーススキーマ

**classes テーブル:**

- id (INTEGER PRIMARY KEY)
- name (TEXT)

**time_slots テーブル:**

- id (INTEGER PRIMARY KEY)
- class_id (INTEGER, FOREIGN KEY)
- label (TEXT)
- assigned_to (TEXT)
- position (INTEGER)
