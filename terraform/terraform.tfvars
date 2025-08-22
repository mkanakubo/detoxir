# Google Cloud Project Configuration
project_id = "gcp-dev-432007"
region     = "asia-northeast1"

# Application Configuration
app_name    = "detoxir"
environment = "prod"

# Cloud Run Configuration
min_scale    = 0
max_scale    = 10
cpu_limit    = "1000m"
memory_limit = "512Mi"

# Container Image (will be updated by CI/CD)
container_image = "asia-northeast1-docker.pkg.dev/gcp-dev-432007/detoxir/detoxir-backend:latest"
