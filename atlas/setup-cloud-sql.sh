#!/bin/bash

# Cloud SQL インスタンス作成スクリプト
# 使用方法: ./setup-cloud-sql.sh PROJECT_ID REGION INSTANCE_NAME

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
ROOT_PASSWORD=$(openssl rand -base64 32)
USER_PASSWORD=$(openssl rand -base64 32)

echo "🗄️ Cloud SQLインスタンスを作成します..."
echo "プロジェクト: $PROJECT_ID"
echo "リージョン: $REGION"
echo "インスタンス名: $INSTANCE_NAME"

# Google Cloud CLIの設定
gcloud config set project $PROJECT_ID

# Cloud SQL APIを有効化
echo "📡 Cloud SQL APIを有効化中..."
gcloud services enable sqladmin.googleapis.com

# Cloud SQLインスタンスを作成
echo "🏗️ Cloud SQLインスタンスを作成中..."
gcloud sql instances create $INSTANCE_NAME \
    --database-version=MYSQL_8_0 \
    --tier=db-f1-micro \
    --region=$REGION \
    --root-password=$ROOT_PASSWORD \
    --storage-type=SSD \
    --storage-size=10GB \
    --storage-auto-increase

# データベースを作成
echo "📚 データベースを作成中..."
gcloud sql databases create atlas_production --instance=$INSTANCE_NAME
gcloud sql databases create atlas_production_cache --instance=$INSTANCE_NAME
gcloud sql databases create atlas_production_queue --instance=$INSTANCE_NAME
gcloud sql databases create atlas_production_cable --instance=$INSTANCE_NAME

# アプリケーション用ユーザーを作成
echo "👤 データベースユーザーを作成中..."
gcloud sql users create atlas_user \
    --instance=$INSTANCE_NAME \
    --password=$USER_PASSWORD

echo "✅ Cloud SQLセットアップが完了しました！"
echo ""
echo "🔐 認証情報:"
echo "Root Password: $ROOT_PASSWORD"
echo "User Password: $USER_PASSWORD"
echo ""
echo "🔗 接続情報:"
echo "Instance Connection Name: $PROJECT_ID:$REGION:$INSTANCE_NAME"
echo "Socket Path: /cloudsql/$PROJECT_ID:$REGION:$INSTANCE_NAME"
echo ""
echo "⚠️  重要: パスワードを安全な場所に保存してください！"
echo ""
echo "📝 次のステップ:"
echo "1. .env.exampleファイルを参考に環境変数を設定"
echo "2. ./deploy-cloud-run.sh $PROJECT_ID $REGION $INSTANCE_NAME を実行"
