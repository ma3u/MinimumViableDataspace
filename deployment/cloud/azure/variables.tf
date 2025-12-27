variable "resource_group_name" {
  description = "Name of the Azure resource group"
  type        = string
  default     = "mvd-rg"
}

variable "location" {
  description = "Azure region for resources. Recommended: westeurope (Amsterdam) or germanywestcentral (Frankfurt)"
  type        = string
  default     = "germanywestcentral"
}

variable "cluster_name" {
  description = "Name of the AKS cluster"
  type        = string
  default     = "mvd-cluster"
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "node_count" {
  description = "Number of nodes in the default node pool"
  type        = number
  default     = 3
}

variable "node_vm_size" {
  description = "VM size for cluster nodes. Staging: Standard_D2s_v3, Production: Standard_D4s_v3"
  type        = string
  default     = "Standard_D2s_v3"
}

variable "enable_auto_scaling" {
  description = "Enable auto-scaling for the node pool"
  type        = bool
  default     = false
}

variable "min_node_count" {
  description = "Minimum number of nodes when auto-scaling is enabled"
  type        = number
  default     = 3
}

variable "max_node_count" {
  description = "Maximum number of nodes when auto-scaling is enabled"
  type        = number
  default     = 10
}

variable "acr_name" {
  description = "Name of Azure Container Registry (must be globally unique, alphanumeric only)"
  type        = string
  default     = "mvdregistry"
}

variable "acr_sku" {
  description = "SKU for Azure Container Registry. Options: Basic, Standard, Premium"
  type        = string
  default     = "Basic"
}

variable "key_vault_name" {
  description = "Name of Azure Key Vault (must be globally unique, 3-24 characters)"
  type        = string
  default     = "mvd-keyvault"
}

variable "key_vault_sku" {
  description = "SKU for Azure Key Vault. Options: standard, premium"
  type        = string
  default     = "standard"
}

variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "15"
}

variable "postgres_admin_username" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "mvdadmin"
  sensitive   = true
}

variable "postgres_admin_password" {
  description = "PostgreSQL administrator password (min 8 characters)"
  type        = string
  sensitive   = true
}

variable "postgres_sku" {
  description = "PostgreSQL SKU. Staging: B_Standard_B1ms, Production: GP_Standard_D4s_v3"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage in MB"
  type        = number
  default     = 32768
}

variable "postgres_backup_retention_days" {
  description = "Number of days to retain PostgreSQL backups"
  type        = number
  default     = 7
}

variable "log_retention_days" {
  description = "Number of days to retain logs in Log Analytics"
  type        = number
  default     = 30
}

variable "environment" {
  description = "Environment name. Options: staging, production"
  type        = string
  default     = "staging"

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "Minimum Viable Dataspace"
    ManagedBy   = "Terraform"
    Environment = "staging"
  }
}
