# Cloud Run デプロイメントガイド

このガイドでは、Atlas APIをGoogle Cloud RunとCloud SQLにデプロイする手順を説明します。

## 前提条件

- Google Cloud CLIがインストールされている
- Dockerがインストールされている
- Google Cloudプロジェクトが作成されている
- 必要なAPIが有効化されている

## デプロイ手順

### 1. Google Cloud CLIの設定

```bash
# Google Cloudにログイン
gcloud auth login

# プロジェクトを設定
gcloud config set project YOUR_PROJECT_ID

# 必要なAPIを有効化
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

### 2. Cloud SQLインスタンスの作成

```bash
# Cloud SQLセットアップスクリプトを実行
./setup-cloud-sql.sh YOUR_PROJECT_ID asia-northeast1 atlas-db
```

このスクリプトは以下を実行します：
- Cloud SQLインスタンスの作成
- 必要なデータベースの作成
- アプリケーション用ユーザーの作成
- 認証情報の生成

### 3. 環境変数の設定

`.env.example`ファイルを参考に、以下の環境変数を準備：

```bash
# 必須環境変数
DATABASE_SOCKET=/cloudsql/YOUR_PROJECT_ID:asia-northeast1:atlas-db
DATABASE_NAME=atlas_production
DATABASE_USERNAME=atlas_user
DATABASE_PASSWORD=generated_password_from_step2
SECRET_KEY_BASE=generate_with_rails_secret

# Rails設定
RAILS_ENV=production
RAILS_SERVE_STATIC_FILES=true
RAILS_LOG_TO_STDOUT=true
```

### 4. Cloud Runへのデプロイ

```bash
# デプロイスクリプトを実行
./deploy-cloud-run.sh YOUR_PROJECT_ID asia-northeast1 atlas-db
```

### 5. データベースマイグレーション

デプロイ後、マイグレーションを実行：

```bash
# 一時的なマイグレーション用Cloud Run Jobを作成
gcloud run jobs create atlas-migrate \
    --image gcr.io/YOUR_PROJECT_ID/atlas-api \
    --region asia-northeast1 \
    --add-cloudsql-instances YOUR_PROJECT_ID:asia-northeast1:atlas-db \
    --set-env-vars RAILS_ENV=production \
    --set-env-vars DATABASE_SOCKET=/cloudsql/YOUR_PROJECT_ID:asia-northeast1:atlas-db \
    --set-env-vars DATABASE_NAME=atlas_production \
    --set-env-vars DATABASE_USERNAME=atlas_user \
    --set-env-vars DATABASE_PASSWORD=your_password

# マイグレーションを実行
gcloud run jobs execute atlas-migrate \
    --region asia-northeast1 \
    --overrides='
    {
      "spec": {
        "template": {
          "spec": {
            "template": {
              "spec": {
                "containers": [
                  {
                    "name": "atlas-migrate",
                    "args": ["bundle", "exec", "rails", "db:migrate"]
                  }
                ]
              }
            }
          }
        }
      }
    }'
```

## トラブルシューティング

### よくある問題と解決方法

1. **Cloud SQL接続エラー**
   - Cloud SQL Proxyが正しく設定されているか確認
   - インスタンス接続名が正しいか確認

2. **権限エラー**
   - Cloud Run ServiceアカウントにCloud SQL Client権限があるか確認
   - プロジェクトで必要なAPIが有効化されているか確認

3. **メモリ不足エラー**
   - Cloud Runのメモリ設定を増やす（最大4Gi）

### ログの確認

```bash
# Cloud Runのログを確認
gcloud run services logs read atlas-api --region asia-northeast1

# リアルタイムログの監視
gcloud run services logs tail atlas-api --region asia-northeast1
```

## 設定の更新

環境変数を更新する場合：

```bash
gcloud run services update atlas-api \
    --region asia-northeast1 \
    --set-env-vars NEW_VAR=value
```

## スケーリング設定

```bash
# 最大インスタンス数を設定
gcloud run services update atlas-api \
    --region asia-northeast1 \
    --max-instances 20

# 最小インスタンス数を設定（コールドスタート回避）
gcloud run services update atlas-api \
    --region asia-northeast1 \
    --min-instances 1
```

## セキュリティ

- Cloud Runサービスは認証なしでアクセス可能に設定されています
- 本番環境では適切な認証・認可の実装を検討してください
- データベースパスワードは必ず安全に管理してください
