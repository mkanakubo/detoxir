#!/bin/bash

# Cloud Run デプロイメントスクリプト
# 使用方法: ./deploy-cloud-run.sh PROJECT_ID REGION INSTANCE_NAME

set -e

# 引数チェック
if [ $# -ne 3 ]; then
    echo "使用方法: $0 PROJECT_ID REGION INSTANCE_NAME"
    echo "例: $0 my-project asia-northeast1 atlas-db"
    exit 1
fi

PROJECT_ID=$1
REGION=$2
INSTANCE_NAME=$3
SERVICE_NAME="atlas-api"

echo "🚀 Cloud Runへのデプロイを開始します..."
echo "プロジェクト: $PROJECT_ID"
echo "リージョン: $REGION"
echo "Cloud SQLインスタンス: $INSTANCE_NAME"

# Google Cloud CLIの設定確認
echo "📋 Google Cloud CLI設定を確認中..."
gcloud config set project $PROJECT_ID

# Dockerイメージをビルド（Cloud Run用にx86_64プラットフォーム指定）
echo "🐳 Dockerイメージをビルド中..."
docker build --platform linux/amd64 -t asia-northeast1-docker.pkg.dev/$PROJECT_ID/atlas-repo/$SERVICE_NAME .

# Artifact Registryにプッシュ
echo "📤 Artifact Registryにプッシュ中..."
docker push asia-northeast1-docker.pkg.dev/$PROJECT_ID/atlas-repo/$SERVICE_NAME

# Cloud Runにデプロイ
echo "☁️ Cloud Runにデプロイ中..."
gcloud run deploy $SERVICE_NAME \
    --image asia-northeast1-docker.pkg.dev/$PROJECT_ID/atlas-repo/$SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 10 \
    --timeout 300 \
    --cpu-throttling \
    --add-cloudsql-instances $PROJECT_ID:$REGION:$INSTANCE_NAME \
    --set-env-vars RAILS_ENV=production \
    --set-env-vars RAILS_SERVE_STATIC_FILES=true \
    --set-env-vars RAILS_LOG_TO_STDOUT=true \
    --set-env-vars DATABASE_SOCKET=/cloudsql/$PROJECT_ID:$REGION:$INSTANCE_NAME \
    --set-env-vars DATABASE_NAME=atlas_production \
    --set-env-vars DATABASE_NAME_CACHE=atlas_production_cache \
    --set-env-vars DATABASE_NAME_QUEUE=atlas_production_queue \
    --set-env-vars DATABASE_NAME_CABLE=atlas_production_cable

echo "✅ デプロイが完了しました！"
echo "サービスURL: https://$SERVICE_NAME-$(gcloud run services describe $SERVICE_NAME --region=$REGION --format='value(status.url)' | cut -d'/' -f3)"

# データベース初期化の案内
echo ""
echo "📝 次のステップ:"
echo "1. Cloud SQLでデータベースとユーザーを作成:"
echo "   gcloud sql databases create atlas_production --instance=$INSTANCE_NAME"
echo "   gcloud sql databases create atlas_production_cache --instance=$INSTANCE_NAME"
echo "   gcloud sql databases create atlas_production_queue --instance=$INSTANCE_NAME"
echo "   gcloud sql databases create atlas_production_cable --instance=$INSTANCE_NAME"
echo ""
echo "2. データベースユーザーを作成:"
echo "   gcloud sql users create atlas_user --instance=$INSTANCE_NAME --password=SECURE_PASSWORD"
echo ""
echo "3. マイグレーションを実行:"
echo "   gcloud run jobs create migrate-job --image asia-northeast1-docker.pkg.dev/$PROJECT_ID/atlas-repo/$SERVICE_NAME --region $REGION"
echo "   gcloud run jobs execute migrate-job --region $REGION --task-overrides='--command=bundle,--args=exec rails db:migrate'"
