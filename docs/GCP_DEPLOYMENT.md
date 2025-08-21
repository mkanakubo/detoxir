# Google Cloud Run Deployment Guide

このガイドでは、DetoxirバックエンドをGoogle Cloud Runにデプロイする方法について説明します。

## 🚀 クイックスタート

### 前提条件

- Google Cloud Project（作成済み）
- gcloud CLI（インストール・認証済み）
- Terraform >= 1.0
- Docker
- GitHub Repository

### 1. 自動セットアップ

```bash
# セットアップスクリプトを実行
./scripts/setup-gcp.sh
```

このスクリプトが以下を自動実行します：
- 必要なAPIの有効化
- Terraformの初期化
- インフラストラクチャのデプロイ
- 初期Dockerイメージのビルド・プッシュ

### 2. GitHub Secrets設定

リポジトリの Settings > Secrets and variables > Actions で以下のSecretを追加：

```
GCP_PROJECT_ID: your-project-id
GCP_SA_KEY: {"type": "service_account", ...}  # JSON形式
DB_PASSWORD: your-database-password
DATABASE_URL: postgresql://user:pass@connection/db?host=/cloudsql/...
```

### 3. デプロイ

```bash
# メインブランチにプッシュしてCI/CDを開始
git add .
git commit -m "Add Google Cloud Run deployment"
git push origin main
```

## 📁 ファイル構成

```
detoxir/
├── terraform/
│   ├── main.tf              # メインリソース定義
│   ├── variables.tf         # 変数定義
│   ├── outputs.tf           # 出力値
│   ├── versions.tf          # プロバイダー設定
│   └── terraform.tfvars     # 実際の値（自動生成）
├── .github/workflows/
│   └── deploy.yml           # CI/CDパイプライン
├── scripts/
│   └── setup-gcp.sh         # セットアップスクリプト
├── cloudbuild.yaml          # Cloud Build設定
└── backend/Dockerfile       # 最適化済みDockerfile
```

## 🏗️ インフラストラクチャ

### デプロイされるリソース

- **Cloud Run Service**: NestJSアプリケーション
- **Cloud SQL (PostgreSQL)**: データベース
- **Artifact Registry**: Dockerイメージレポジトリ
- **Secret Manager**: 機密情報管理
- **IAM Service Account**: セキュリティ管理

### 設定値

- **リージョン**: asia-northeast1
- **Cloud Run**: 512Mi メモリ、1 CPU
- **データベース**: PostgreSQL 15、db-f1-micro
- **スケーリング**: 0-10インスタンス

## 🔧 手動セットアップ（詳細）

### 1. Google Cloud設定

```bash
# プロジェクト設定
gcloud config set project YOUR_PROJECT_ID

# 必要なAPIを有効化
gcloud services enable run.googleapis.com sql.googleapis.com artifactregistry.googleapis.com
```

### 2. Terraformセットアップ

```bash
cd terraform

# terraform.tfvarsを作成（terraform.tfvars.exampleを参考に）
cp terraform.tfvars.example terraform.tfvars
# YOUR_PROJECT_ID_HERE と YOUR_SECURE_PASSWORD_HERE を実際の値に変更

# Terraform初期化・デプロイ
terraform init
terraform plan
terraform apply
```

### 3. Dockerイメージビルド・プッシュ

```bash
# Artifact Registryに認証
gcloud auth configure-docker asia-northeast1-docker.pkg.dev

# イメージビルド・プッシュ
cd backend
docker build -t asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/detoxir/detoxir-backend:latest .
docker push asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/detoxir/detoxir-backend:latest
```

### 4. データベースマイグレーション

```bash
# Cloud Runサービスのコンテナ内でマイグレーション実行
gcloud run jobs create migration-job \
  --image=asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/detoxir/detoxir-backend:latest \
  --region=asia-northeast1 \
  --set-env-vars="DATABASE_URL=postgresql://..." \
  --command="pnpm,prisma,migrate,deploy"

gcloud run jobs execute migration-job --region=asia-northeast1 --wait
```

## 🔍 運用・メンテナンス

### ログ確認

```bash
# Cloud Runログ
gcloud logs read "resource.type=cloud_run_revision" --limit=50

# データベースログ
gcloud logs read "resource.type=gce_instance" --filter="labels.database_id=YOUR_INSTANCE_ID"
```

### モニタリング

- Cloud Run metrics: CPU、メモリ、レスポンス時間
- Cloud SQL metrics: 接続数、クエリパフォーマンス
- Health check: `/health` エンドポイント

### スケーリング調整

```bash
# terraform/terraform.tfvarsで調整
min_scale = 1        # 最小インスタンス数
max_scale = 20       # 最大インスタンス数
cpu_limit = "2000m"  # CPU制限
memory_limit = "1Gi" # メモリ制限

# 適用
terraform apply
```

## 🚨 トラブルシューティング

### よくある問題

1. **Database connection failed**
   - Cloud SQL proxy設定確認
   - IAM権限確認
   - ファイアウォール設定確認

2. **Image pull failed**
   - Artifact Registry権限確認
   - イメージタグ確認

3. **Deployment timeout**
   - ヘルスチェック設定確認
   - 起動時間調整

### 有用なコマンド

```bash
# サービス状態確認
gcloud run services describe detoxir-backend --region=asia-northeast1

# リビジョン確認
gcloud run revisions list --service=detoxir-backend --region=asia-northeast1

# ログ確認
gcloud run services logs read detoxir-backend --region=asia-northeast1

# データベース接続テスト
gcloud sql connect detoxir-postgres-prod --user=detoxir_user
```

## 💰 コスト最適化

- **Cloud Run**: リクエストベース課金、最小0インスタンス
- **Cloud SQL**: 使用量ベース、自動バックアップ有効
- **Artifact Registry**: ストレージ使用量ベース

推定月額費用（軽度使用）: $10-20

## 🔐 セキュリティ

- TLS/HTTPS自動設定
- IAMによる最小権限
- Secret Managerで機密情報管理
- VPCファイアウォール設定
