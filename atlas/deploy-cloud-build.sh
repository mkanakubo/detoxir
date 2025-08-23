#!/bin/bash

# Cloud Build を使用したデプロイスクリプト
# 使用方法: ./deploy-cloud-build.sh PROJECT_ID

set -e

# 引数チェック
if [ $# -ne 1 ]; then
    echo "使用方法: $0 PROJECT_ID"
    echo "例: $0 gcp-dev-432007"
    exit 1
fi

PROJECT_ID=$1

echo "🚀 Cloud Buildを使用してデプロイを開始します..."
echo "プロジェクト: $PROJECT_ID"

# Google Cloud CLIの設定確認
echo "📋 Google Cloud CLI設定を確認中..."
gcloud config set project $PROJECT_ID

# Cloud Buildを使用してビルド・デプロイ
echo "☁️ Cloud Buildでビルド・デプロイ中..."
gcloud builds submit --config cloudbuild.yaml

echo "✅ Cloud Buildデプロイが完了しました！"

# サービスURLを取得
SERVICE_URL=$(gcloud run services describe atlas-api --region=asia-northeast1 --format='value(status.url)')
echo "🌐 サービスURL: $SERVICE_URL"

echo ""
echo "📝 次のステップ:"
echo "1. アプリケーションのテスト:"
echo "   curl $SERVICE_URL/up"
echo ""
echo "2. JANCodeサービスのテスト:"
echo "   curl '$SERVICE_URL/api/v1/caffeinated_products/find_by_jan_code/4897036692233'"
