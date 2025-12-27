terraform {
  required_version = ">= 1.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = true
    }
  }
}

# Data sources
data "azurerm_client_config" "current" {}

# Resource Group
resource "azurerm_resource_group" "mvd" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

# Azure Container Registry
resource "azurerm_container_registry" "mvd" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.mvd.name
  location            = azurerm_resource_group.mvd.location
  sku                 = var.acr_sku
  admin_enabled       = false

  tags = var.tags
}

# Virtual Network
resource "azurerm_virtual_network" "mvd" {
  name                = "${var.cluster_name}-vnet"
  location            = azurerm_resource_group.mvd.location
  resource_group_name = azurerm_resource_group.mvd.name
  address_space       = ["10.0.0.0/16"]
  tags                = var.tags
}

resource "azurerm_subnet" "aks" {
  name                 = "aks-subnet"
  resource_group_name  = azurerm_resource_group.mvd.name
  virtual_network_name = azurerm_virtual_network.mvd.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "postgres" {
  name                 = "postgres-subnet"
  resource_group_name  = azurerm_resource_group.mvd.name
  virtual_network_name = azurerm_virtual_network.mvd.name
  address_prefixes     = ["10.0.2.0/24"]

  delegation {
    name = "postgres-delegation"
    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = [
        "Microsoft.Network/virtualNetworks/subnets/join/action",
      ]
    }
  }
}

# Azure Kubernetes Service
resource "azurerm_kubernetes_cluster" "mvd" {
  name                = var.cluster_name
  location            = azurerm_resource_group.mvd.location
  resource_group_name = azurerm_resource_group.mvd.name
  dns_prefix          = var.cluster_name
  kubernetes_version  = var.kubernetes_version

  default_node_pool {
    name                = "default"
    node_count          = var.node_count
    vm_size             = var.node_vm_size
    vnet_subnet_id      = azurerm_subnet.aks.id
    enable_auto_scaling = var.enable_auto_scaling
    min_count           = var.enable_auto_scaling ? var.min_node_count : null
    max_count           = var.enable_auto_scaling ? var.max_node_count : null
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"
    network_policy = "calico"
    dns_service_ip = "10.1.0.10"
    service_cidr   = "10.1.0.0/16"
  }

  azure_active_directory_role_based_access_control {
    managed            = true
    azure_rbac_enabled = true
  }

  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.mvd.id
  }

  tags = var.tags
}

# Role assignment for ACR access
resource "azurerm_role_assignment" "aks_acr_pull" {
  principal_id                     = azurerm_kubernetes_cluster.mvd.kubelet_identity[0].object_id
  role_definition_name             = "AcrPull"
  scope                            = azurerm_container_registry.mvd.id
  skip_service_principal_aad_check = true
}

# Log Analytics Workspace for monitoring
resource "azurerm_log_analytics_workspace" "mvd" {
  name                = "${var.cluster_name}-logs"
  location            = azurerm_resource_group.mvd.location
  resource_group_name = azurerm_resource_group.mvd.name
  sku                 = "PerGB2018"
  retention_in_days   = var.log_retention_days
  tags                = var.tags
}

# Azure Key Vault for secrets
resource "azurerm_key_vault" "mvd" {
  name                       = var.key_vault_name
  location                   = azurerm_resource_group.mvd.location
  resource_group_name        = azurerm_resource_group.mvd.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = var.key_vault_sku
  soft_delete_retention_days = 7
  purge_protection_enabled   = var.environment == "production" ? true : false

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Purge"
    ]
  }

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = azurerm_kubernetes_cluster.mvd.kubelet_identity[0].object_id

    secret_permissions = [
      "Get", "List"
    ]
  }

  tags = var.tags
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "mvd" {
  name                   = "${var.cluster_name}-postgres"
  resource_group_name    = azurerm_resource_group.mvd.name
  location               = azurerm_resource_group.mvd.location
  version                = var.postgres_version
  administrator_login    = var.postgres_admin_username
  administrator_password = var.postgres_admin_password
  storage_mb             = var.postgres_storage_mb
  sku_name               = var.postgres_sku

  backup_retention_days        = var.postgres_backup_retention_days
  geo_redundant_backup_enabled = var.environment == "production" ? true : false

  delegated_subnet_id = azurerm_subnet.postgres.id
  private_dns_zone_id = azurerm_private_dns_zone.postgres.id

  high_availability {
    mode = var.environment == "production" ? "ZoneRedundant" : "Disabled"
  }

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres]

  tags = var.tags
}

# Private DNS Zone for PostgreSQL
resource "azurerm_private_dns_zone" "postgres" {
  name                = "${var.cluster_name}-postgres.private.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.mvd.name
  tags                = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "${var.cluster_name}-postgres-vnet-link"
  resource_group_name   = azurerm_resource_group.mvd.name
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  virtual_network_id    = azurerm_virtual_network.mvd.id
  tags                  = var.tags
}

# PostgreSQL Databases for MVD components
resource "azurerm_postgresql_flexible_server_database" "consumer" {
  name      = "consumer"
  server_id = azurerm_postgresql_flexible_server.mvd.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_database" "provider_qna" {
  name      = "provider_qna"
  server_id = azurerm_postgresql_flexible_server.mvd.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_database" "provider_manufacturing" {
  name      = "provider_manufacturing"
  server_id = azurerm_postgresql_flexible_server.mvd.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_database" "consumer_identityhub" {
  name      = "consumer_identityhub"
  server_id = azurerm_postgresql_flexible_server.mvd.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_database" "provider_identityhub" {
  name      = "provider_identityhub"
  server_id = azurerm_postgresql_flexible_server.mvd.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_database" "issuer" {
  name      = "issuer"
  server_id = azurerm_postgresql_flexible_server.mvd.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Configure kubectl access
provider "kubernetes" {
  host                   = azurerm_kubernetes_cluster.mvd.kube_config[0].host
  client_certificate     = base64decode(azurerm_kubernetes_cluster.mvd.kube_config[0].client_certificate)
  client_key             = base64decode(azurerm_kubernetes_cluster.mvd.kube_config[0].client_key)
  cluster_ca_certificate = base64decode(azurerm_kubernetes_cluster.mvd.kube_config[0].cluster_ca_certificate)
}

# Create MVD namespace
resource "kubernetes_namespace" "mvd" {
  metadata {
    name = "mvd"
    labels = {
      name        = "mvd"
      environment = var.environment
    }
  }
}
