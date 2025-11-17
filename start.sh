#!/bin/bash

echo "🚀 授業担当管理アプリを起動しています..."
echo ""

docker-compose up --build -d

echo ""
echo "✅ 起動完了！"
echo ""
echo "📱 アプリにアクセス:"
echo "   フロントエンド: http://localhost:5173"
echo "   バックエンドAPI: http://localhost:8080"
echo ""
echo "📋 コマンド:"
echo "   ログを見る: docker-compose logs -f"
echo "   停止する:   docker-compose down"
echo ""

