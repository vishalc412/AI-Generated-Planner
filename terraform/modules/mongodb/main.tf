variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "mongodb_atlas_org_id" {
  type = string
}

variable "vpc_cidr_blocks" {
  type = list(string)
}

# MongoDB Atlas Project
resource "mongodbatlas_project" "main" {
  name   = "${var.project_name}-${var.environment}"
  org_id = var.mongodb_atlas_org_id
}

# MongoDB Atlas Cluster
resource "mongodbatlas_cluster" "main" {
  project_id = mongodbatlas_project.main.id
  name       = "${var.project_name}-${var.environment}-cluster"

  # Provider Settings
  provider_name               = "AWS"
  provider_region_name        = "US_EAST_1"
  provider_instance_size_name = "M10"

  # Cluster Configuration
  cluster_type = "REPLICASET"
  replication_specs {
    num_shards = 1
    regions_config {
      region_name     = "US_EAST_1"
      electable_nodes = 3
      priority        = 7
      read_only_nodes = 0
    }
  }

  # Backup Configuration
  backup_enabled               = true
  pit_enabled                  = true
  auto_scaling_disk_gb_enabled = true

  # Advanced Configuration
  advanced_configuration {
    javascript_enabled           = true
    minimum_enabled_tls_protocol = "TLS1_2"
  }
}

# Database User
resource "mongodbatlas_database_user" "main" {
  username           = "${var.project_name}_${var.environment}_user"
  password           = random_password.mongodb_password.result
  project_id         = mongodbatlas_project.main.id
  auth_database_name = "admin"

  roles {
    role_name     = "readWrite"
    database_name = "task_planner"
  }

  scopes {
    name = mongodbatlas_cluster.main.name
    type = "CLUSTER"
  }
}

# Random Password for MongoDB User
resource "random_password" "mongodb_password" {
  length  = 32
  special = true
}

# IP Access List
resource "mongodbatlas_project_ip_access_list" "main" {
  for_each = toset(var.vpc_cidr_blocks)

  project_id = mongodbatlas_project.main.id
  cidr_block = each.value
  comment    = "VPC CIDR block access"
}

# Allow access from anywhere (for development)
resource "mongodbatlas_project_ip_access_list" "anywhere" {
  count = var.environment == "dev" ? 1 : 0

  project_id = mongodbatlas_project.main.id
  cidr_block = "0.0.0.0/0"
  comment    = "Allow access from anywhere (dev only)"
}

# Outputs
output "connection_string" {
  value = replace(
    mongodbatlas_cluster.main.connection_strings[0].standard_srv,
    "mongodb+srv://",
    "mongodb+srv://${mongodbatlas_database_user.main.username}:${mongodbatlas_database_user.main.password}@"
  )
  sensitive = true
}

output "cluster_name" {
  value = mongodbatlas_cluster.main.name
}
