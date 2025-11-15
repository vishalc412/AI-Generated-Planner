terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "~> 1.12"
    }
  }

  backend "s3" {
    bucket         = "taskplanner-terraform-state"
    key            = "terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "taskplanner-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
}

provider "mongodbatlas" {
  public_key  = var.mongodb_atlas_public_key
  private_key = var.mongodb_atlas_private_key
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "taskplanner"
}

variable "mongodb_atlas_public_key" {
  description = "MongoDB Atlas public key"
  type        = string
  sensitive   = true
}

variable "mongodb_atlas_private_key" {
  description = "MongoDB Atlas private key"
  type        = string
  sensitive   = true
}

variable "mongodb_atlas_org_id" {
  description = "MongoDB Atlas organization ID"
  type        = string
}

# Modules
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
}

module "ecs" {
  source = "./modules/ecs"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  public_subnets  = module.vpc.public_subnets
  mongodb_url     = module.mongodb.connection_string
  s3_bucket_name  = module.s3.bucket_name
}

module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
}

module "mongodb" {
  source = "./modules/mongodb"

  project_name        = var.project_name
  environment         = var.environment
  mongodb_atlas_org_id = var.mongodb_atlas_org_id
  vpc_cidr_blocks     = [module.vpc.vpc_cidr_block]
}

module "cloudfront" {
  source = "./modules/cloudfront"

  project_name   = var.project_name
  environment    = var.environment
  s3_bucket_name = module.s3.frontend_bucket_name
  alb_dns_name   = module.ecs.alb_dns_name
}

# Outputs
output "alb_dns_name" {
  description = "ALB DNS name"
  value       = module.ecs.alb_dns_name
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cloudfront.cloudfront_domain_name
}

output "mongodb_connection_string" {
  description = "MongoDB connection string"
  value       = module.mongodb.connection_string
  sensitive   = true
}

output "s3_bucket_name" {
  description = "S3 bucket name for images"
  value       = module.s3.bucket_name
}
