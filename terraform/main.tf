# Simplified Terraform for Cloud Run only (no Cloud SQL)

# Artifact Registry repository
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = var.app_name
  description   = "Docker repository for ${var.app_name}"
  format        = "DOCKER"
  project       = var.project_id
}

# Service account for Cloud Run
resource "google_service_account" "cloud_run_sa" {
  account_id   = "${var.app_name}-cloud-run"
  display_name = "Cloud Run Service Account for ${var.app_name}"
  project      = var.project_id
}

# Cloud Run service (without database)
resource "google_cloud_run_v2_service" "backend" {
  name     = "${var.app_name}-backend"
  location = var.region
  project  = var.project_id
  
  deletion_protection = false

  template {
    service_account = google_service_account.cloud_run_sa.email

    scaling {
      min_instance_count = var.min_scale
      max_instance_count = var.max_scale
    }

    containers {
      image = replace(var.container_image, "PROJECT_ID", var.project_id)

      ports {
        container_port = 8080
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

      # Use local SQLite for now
      env {
        name  = "DATABASE_URL"
        value = "file:/app/data/dev.db"
      }

      startup_probe {
        http_get {
          path = "/health"
          port = 8080
        }
        initial_delay_seconds = 60
        timeout_seconds       = 10
        period_seconds        = 30
        failure_threshold     = 5
      }

      liveness_probe {
        http_get {
          path = "/health"
          port = 8080
        }
        initial_delay_seconds = 60
        timeout_seconds       = 10
        period_seconds        = 30
        failure_threshold     = 5
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
