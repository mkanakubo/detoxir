#!/bin/bash

# Google Cloud Run Deployment Setup Script (APIs restricted version)
# This script works with limited API permissions

set -e

echo "🚀 Google Cloud Run Deployment Setup (Limited APIs)"
echo "=================================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get project information
get_project_info() {
    print_status "Getting project information..."
    
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    
    if [ -z "$PROJECT_ID" ]; then
        print_error "No project is set. Please run: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
    
    print_success "Using project: $PROJECT_ID"
    REGION="asia-northeast1"
    print_success "Using region: $REGION"
}

# Check available APIs
check_apis() {
    print_status "Checking available APIs..."
    
    REQUIRED_APIS=("run.googleapis.com" "artifactregistry.googleapis.com" "cloudbuild.googleapis.com")
    MISSING_APIS=()
    
    for api in "${REQUIRED_APIS[@]}"; do
        if gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
            print_success "$api is enabled"
        else
            MISSING_APIS+=("$api")
            print_warning "$api is not enabled"
        fi
    done
    
    if [ ${#MISSING_APIS[@]} -ne 0 ]; then
        print_error "Missing required APIs. Please enable them manually in Cloud Console:"
        for api in "${MISSING_APIS[@]}"; do
            echo "  - $api"
        done
        exit 1
    fi
}

# Create simplified terraform.tfvars (without Cloud SQL)
create_tfvars_simple() {
    print_status "Creating simplified terraform.tfvars file..."
    
    if [ -f "terraform/terraform.tfvars" ]; then
        print_warning "terraform.tfvars already exists. Skipping..."
        return
    fi
    
    cat > terraform/terraform.tfvars <<EOF
# Google Cloud Project Configuration
project_id = "$PROJECT_ID"
region     = "$REGION"

# Application Configuration
app_name    = "detoxir"
environment = "prod"

# Cloud Run Configuration
min_scale    = 0
max_scale    = 10
cpu_limit    = "1000m"
memory_limit = "512Mi"

# Container Image (will be updated by CI/CD)
container_image = "$REGION-docker.pkg.dev/$PROJECT_ID/detoxir/detoxir-backend:latest"
EOF
    
    print_success "terraform.tfvars created"
}

# Create simplified main.tf for Cloud Run only
create_simplified_terraform() {
    print_status "Creating simplified Terraform configuration..."
    
    # Backup original files if they exist
    if [ -f "terraform/main.tf" ]; then
        mv terraform/main.tf terraform/main-full.tf
    fi
    if [ -f "terraform/outputs.tf" ]; then
        mv terraform/outputs.tf terraform/outputs-full.tf
    fi
    
    cat > terraform/main.tf <<EOF
# Simplified Terraform for Cloud Run only (no Cloud SQL)

# Artifact Registry repository
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = var.app_name
  description   = "Docker repository for \${var.app_name}"
  format        = "DOCKER"
  project       = var.project_id
}

# Service account for Cloud Run
resource "google_service_account" "cloud_run_sa" {
  account_id   = "\${var.app_name}-cloud-run"
  display_name = "Cloud Run Service Account for \${var.app_name}"
  project      = var.project_id
}

# Cloud Run service (without database)
resource "google_cloud_run_v2_service" "backend" {
  name     = "\${var.app_name}-backend"
  location = var.region
  project  = var.project_id

  template {
    service_account = google_service_account.cloud_run_sa.email

    scaling {
      min_instance_count = var.min_scale
      max_instance_count = var.max_scale
    }

    containers {
      image = replace(var.container_image, "PROJECT_ID", var.project_id)

      ports {
        container_port = 3001
      }

      resources {
        limits = {
          cpu    = var.cpu_limit
          memory = var.memory_limit
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "3001"
      }

      # Use local SQLite for now
      env {
        name  = "DATABASE_URL"
        value = "file:/app/data/dev.db"
      }

      startup_probe {
        http_get {
          path = "/health"
        }
        initial_delay_seconds = 30
        timeout_seconds       = 5
        period_seconds        = 10
        failure_threshold     = 3
      }

      liveness_probe {
        http_get {
          path = "/health"
        }
        initial_delay_seconds = 30
        timeout_seconds       = 5
        period_seconds        = 30
        failure_threshold     = 3
      }
    }
  }

  depends_on = [
    google_artifact_registry_repository.repo
  ]
}

# Allow unauthenticated invocations
resource "google_cloud_run_service_iam_member" "allow_unauthenticated" {
  service  = google_cloud_run_v2_service.backend.name
  location = google_cloud_run_v2_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
  project  = var.project_id
}
EOF

    # Create simplified outputs.tf
    cat > terraform/outputs.tf <<EOF
output "service_url" {
  description = "Cloud Run service URL"
  value       = google_cloud_run_v2_service.backend.uri
}

output "artifact_registry_url" {
  description = "Artifact Registry repository URL"
  value       = "\${var.region}-docker.pkg.dev/\${var.project_id}/\${google_artifact_registry_repository.repo.repository_id}"
}

output "project_id" {
  description = "Google Cloud Project ID"
  value       = var.project_id
}

output "region" {
  description = "Google Cloud region"
  value       = var.region
}
EOF

    print_success "Simplified Terraform created"
}

# Deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying infrastructure..."
    
    read -p "Deploy infrastructure (Artifact Registry + Cloud Run)? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    cd terraform
    
    terraform init
    terraform plan
    terraform apply -auto-approve
    
    print_success "Infrastructure deployed"
    cd ..
}

# Build and push initial image
build_and_push() {
    print_status "Building and pushing initial Docker image..."
    
    # Configure Docker for Artifact Registry
    gcloud auth configure-docker $REGION-docker.pkg.dev
    
    # Build image
    cd backend
    docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/detoxir/detoxir-backend:latest .
    cd ..
    
    # Push image
    docker push $REGION-docker.pkg.dev/$PROJECT_ID/detoxir/detoxir-backend:latest
    
    print_success "Image built and pushed"
}

# Get service URL
get_service_url() {
    print_status "Getting service URL..."
    
    cd terraform
    SERVICE_URL=$(terraform output -raw service_url)
    cd ..
    
    print_success "Service deployed at: $SERVICE_URL"
    print_success "Health check: $SERVICE_URL/health"
    
    # Test the health endpoint
    print_status "Testing health endpoint..."
    sleep 30
    if curl -f "$SERVICE_URL/health" >/dev/null 2>&1; then
        print_success "Health check passed!"
    else
        print_warning "Health check failed. Service may still be starting up."
    fi
}

# Setup instructions
show_instructions() {
    print_warning "Next steps to complete setup:"
    echo ""
    echo "1. Enable missing APIs in Cloud Console:"
    echo "   - Cloud SQL API"
    echo "   - Secret Manager API" 
    echo "   - VPC Access API"
    echo ""
    echo "2. Update Terraform to use full configuration:"
    echo "   cd terraform"
    echo "   mv main.tf main-simple.tf"
    echo "   mv main-full.tf main.tf"
    echo "   terraform apply"
    echo ""
    echo "3. Set up GitHub secrets for CI/CD"
    echo "4. Push code to trigger automated deployment"
}

# Main execution
main() {
    get_project_info
    check_apis
    create_tfvars_simple
    create_simplified_terraform
    deploy_infrastructure
    build_and_push
    get_service_url
    show_instructions
    
    echo ""
    print_success "🎉 Simplified setup completed!"
}

# Run main function
main "$@"
