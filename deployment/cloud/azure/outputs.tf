output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.mvd.name
}

output "aks_cluster_name" {
  description = "Name of the AKS cluster"
  value       = azurerm_kubernetes_cluster.mvd.name
}

output "aks_cluster_id" {
  description = "ID of the AKS cluster"
  value       = azurerm_kubernetes_cluster.mvd.id
}

output "aks_kube_config" {
  description = "Kubernetes configuration for kubectl access"
  value       = azurerm_kubernetes_cluster.mvd.kube_config_raw
  sensitive   = true
}

output "aks_host" {
  description = "AKS cluster API endpoint"
  value       = azurerm_kubernetes_cluster.mvd.kube_config[0].host
  sensitive   = true
}

output "acr_name" {
  description = "Name of Azure Container Registry"
  value       = azurerm_container_registry.mvd.name
}

output "acr_login_server" {
  description = "Login server URL for Azure Container Registry"
  value       = azurerm_container_registry.mvd.login_server
}

output "key_vault_name" {
  description = "Name of Azure Key Vault"
  value       = azurerm_key_vault.mvd.name
}

output "key_vault_uri" {
  description = "URI of Azure Key Vault"
  value       = azurerm_key_vault.mvd.vault_uri
}

output "postgres_fqdn" {
  description = "Fully qualified domain name of PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.mvd.fqdn
  sensitive   = true
}

output "postgres_admin_username" {
  description = "PostgreSQL administrator username"
  value       = azurerm_postgresql_flexible_server.mvd.administrator_login
  sensitive   = true
}

output "log_analytics_workspace_id" {
  description = "ID of Log Analytics Workspace"
  value       = azurerm_log_analytics_workspace.mvd.id
}

output "kubectl_config_command" {
  description = "Command to configure kubectl"
  value       = "az aks get-credentials --resource-group ${azurerm_resource_group.mvd.name} --name ${azurerm_kubernetes_cluster.mvd.name}"
}

output "acr_login_command" {
  description = "Command to login to Azure Container Registry"
  value       = "az acr login --name ${azurerm_container_registry.mvd.name}"
}
