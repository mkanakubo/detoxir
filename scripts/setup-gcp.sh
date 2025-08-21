#!/bin/bash

# Google Cloud Run Deployment Setup Script
# This script helps set up the initial deployment to Google Cloud Run

set -e

echo "🚀 Google Cloud Run Deployment Setup"
echo "====================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed. Please install it first."
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Get project information
get_project_info() {
    print_status "Getting project information..."
    
    # Get current project
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    
    if [ -z "$PROJECT_ID" ]; then
        print_error "No project is set. Please run: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
    
    print_success "Using project: $PROJECT_ID"
    
    # Get region
    REGION="asia-northeast1"
    print_success "Using region: $REGION"
}

# Enable required APIs
enable_apis() {
    print_status "Enabling required Google Cloud APIs..."
    
    gcloud services enable \
        run.googleapis.com \
        sql.googleapis.com \
        sqladmin.googleapis.com \
        artifactregistry.googleapis.com \
        secretmanager.googleapis.com \
        cloudbuild.googleapis.com \
        vpcaccess.googleapis.com
    
    print_success "APIs enabled"
}

# Create terraform.tfvars
create_tfvars() {
    print_status "Creating terraform.tfvars file..."
    
    if [ -f "terraform/terraform.tfvars" ]; then
        print_warning "terraform.tfvars already exists. Skipping..."
        return
    fi
    
    # Generate random password
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    
    cat > terraform/terraform.tfvars <<EOF
# Google Cloud Project Configuration
project_id = "$PROJECT_ID"
region     = "$REGION"

# Application Configuration
app_name    = "detoxir"
environment = "prod"

# Database Configuration
database_name     = "detoxir"
database_user     = "detoxir_user"
database_password = "$DB_PASSWORD"

# Cloud Run Configuration
min_scale    = 0
max_scale    = 10
cpu_limit    = "1000m"
memory_limit = "512Mi"

# Container Image (will be updated by CI/CD)
container_image = "$REGION-docker.pkg.dev/$PROJECT_ID/detoxir/detoxir-backend:latest"
EOF
    
    print_success "terraform.tfvars created"
    print_warning "Database password: $DB_PASSWORD"
    print_warning "Please save this password securely!"
}

# Initialize Terraform
init_terraform() {
    print_status "Initializing Terraform..."
    
    cd terraform
    terraform init
    cd ..
    
    print_success "Terraform initialized"
}

# Plan deployment
plan_deployment() {
    print_status "Planning Terraform deployment..."
    
    cd terraform
    terraform plan
    cd ..
    
    print_success "Terraform plan completed"
}

# Deploy infrastructure
deploy_infrastructure() {
    print_status "Deploying infrastructure..."
    
    read -p "Do you want to proceed with deployment? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deployment cancelled"
        exit 0
    fi
    
    cd terraform
    terraform apply -auto-approve
    cd ..
    
    print_success "Infrastructure deployed"
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

# Setup GitHub secrets
setup_github_secrets() {
    print_status "Setting up GitHub secrets..."
    
    print_warning "Please add the following secrets to your GitHub repository:"
    echo ""
    echo "GCP_PROJECT_ID: $PROJECT_ID"
    echo "GCP_SA_KEY: (Service account JSON key)"
    echo "DB_PASSWORD: (Database password from terraform.tfvars)"
    echo "DATABASE_URL: (Will be output by Terraform)"
    echo ""
    print_warning "You'll need to create a service account and download the JSON key"
}

# Get service URL
get_service_url() {
    print_status "Getting service URL..."
    
    cd terraform
    SERVICE_URL=$(terraform output -raw service_url)
    cd ..
    
    print_success "Service deployed at: $SERVICE_URL"
    print_success "Health check: $SERVICE_URL/health"
}

# Main execution
main() {
    check_requirements
    get_project_info
    enable_apis
    create_tfvars
    init_terraform
    plan_deployment
    deploy_infrastructure
    build_and_push
    get_service_url
    setup_github_secrets
    
    echo ""
    print_success "🎉 Setup completed successfully!"
    print_status "Next steps:"
    echo "  1. Set up GitHub secrets as shown above"
    echo "  2. Push your code to trigger the CI/CD pipeline"
    echo "  3. Check your service at: $SERVICE_URL"
}

# Run main function
main "$@"
