# Azure AKS Deployment for MVD

This directory contains Terraform configuration for deploying Minimum Viable Dataspace to Azure Kubernetes Service (AKS).

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                  Azure Resource Group                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Azure Kubernetes Service (AKS)                      │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Namespace: mvd                                │  │  │
│  │  │  - consumer-controlplane + dataplane           │  │  │
│  │  │  - provider-qna-controlplane + dataplane       │  │  │
│  │  │  - provider-manufacturing-cp + dp              │  │  │
│  │  │  - provider-catalog-server                     │  │  │
│  │  │  - consumer-identityhub                        │  │  │
│  │  │  - provider-identityhub                        │  │  │
│  │  │  - issuer-service                              │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Azure Container Registry (ACR)                     │  │
│  │  - controlplane:latest                              │  │
│  │  - dataplane:latest                                 │  │
│  │  - identity-hub:latest                              │  │
│  │  - catalog-server:latest                            │  │
│  │  - issuerservice:latest                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Azure Database for PostgreSQL Flexible Server      │  │
│  │  Databases: consumer, provider_qna,                 │  │
│  │    provider_manufacturing, consumer_identityhub,    │  │
│  │    provider_identityhub, issuer                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Azure Key Vault                                     │  │
│  │  - Secrets for EDC runtimes                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Log Analytics Workspace                             │  │
│  │  - Container Insights                                │  │
│  │  - Logs and metrics                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Azure CLI**
   ```bash
   brew install azure-cli
   az login
   ```

2. **Terraform**
   ```bash
   brew install terraform
   ```

3. **kubectl**
   ```bash
   brew install kubectl
   ```

4. **Build MVD Images**
   ```bash
   cd /path/to/MinimumViableDataspace
   ./gradlew -Ppersistence=true build
   ./gradlew -Ppersistence=true dockerize
   ```

## Configuration

### Staging Environment (Default)
```hcl
# terraform.tfvars
location         = "germanywestcentral"  # Frankfurt
node_count       = 3
node_vm_size     = "Standard_D2s_v3"
postgres_sku     = "B_Standard_B1ms"
environment      = "staging"
postgres_admin_password = "YourSecurePassword123!"
```

### Production Environment
```hcl
# terraform.tfvars
location                     = "westeurope"  # Amsterdam (primary)
node_count                   = 5
node_vm_size                 = "Standard_D4s_v3"
postgres_sku                 = "GP_Standard_D4s_v3"
enable_auto_scaling          = true
min_node_count               = 5
max_node_count               = 15
postgres_backup_retention_days = 35
log_retention_days           = 90
environment                  = "production"
postgres_admin_password      = "YourProductionSecurePassword123!"
```

**Important**: Change `acr_name` and `key_vault_name` to unique values (they must be globally unique across all Azure).

## Deployment

### Step 1: Initialize Terraform
```bash
cd deployment/cloud/azure
terraform init
```

### Step 2: Create terraform.tfvars
```bash
cat > terraform.tfvars <<EOF
postgres_admin_password = "YourSecurePassword123!"
acr_name                = "mvdregistry$(date +%s)"  # Unique name
key_vault_name          = "mvd-kv-$(date +%s)"       # Unique name
EOF
```

### Step 3: Plan Deployment
```bash
terraform plan
```

Review the plan carefully. It will create:
- Resource Group
- AKS Cluster (3 nodes)
- Azure Container Registry
- Azure Key Vault
- PostgreSQL Flexible Server (6 databases)
- Virtual Network + Subnets
- Log Analytics Workspace
- Network Security Groups
- Role Assignments

**Cost Estimate**: ~€150-200/month (staging), ~€500-800/month (production)

### Step 4: Apply Configuration
```bash
terraform apply
# Type 'yes' when prompted
```

Deployment takes ~15-20 minutes.

### Step 5: Configure kubectl
```bash
az aks get-credentials --resource-group mvd-rg --name mvd-cluster
kubectl get nodes  # Verify cluster access
```

### Step 6: Push Docker Images to ACR
```bash
# Login to ACR
az acr login --name $(terraform output -raw acr_name)

# Tag images
ACR_SERVER=$(terraform output -raw acr_login_server)
docker tag controlplane:latest $ACR_SERVER/controlplane:latest
docker tag dataplane:latest $ACR_SERVER/dataplane:latest
docker tag identity-hub:latest $ACR_SERVER/identity-hub:latest
docker tag catalog-server:latest $ACR_SERVER/catalog-server:latest
docker tag issuerservice:latest $ACR_SERVER/issuerservice:latest

# Push images
docker push $ACR_SERVER/controlplane:latest
docker push $ACR_SERVER/dataplane:latest
docker push $ACR_SERVER/identity-hub:latest
docker push $ACR_SERVER/catalog-server:latest
docker push $ACR_SERVER/issuerservice:latest
```

### Step 7: Deploy MVD to AKS

**Note**: This Terraform configuration creates the infrastructure only. You need to create Kubernetes manifests for MVD components or adapt the existing `deployment/*.tf` files to use ACR images.

Example approach:
```bash
# Copy and modify existing Kubernetes deployment
cd ../../  # Back to deployment/ directory

# Update consumer.tf, provider.tf to use ACR images
# Change image references from "controlplane:latest" to 
# "${ACR_SERVER}/controlplane:latest"

# Apply with Terraform targeting AKS
terraform init
terraform apply -var="kubeconfig_path=$HOME/.kube/config"
```

**Alternative**: Create Kubernetes YAML manifests in `deployment/cloud/azure/k8s/` and apply with:
```bash
kubectl apply -f deployment/cloud/azure/k8s/
```

### Step 8: Seed the Dataspace
```bash
cd ../../../  # Back to repository root
./seed-k8s.sh  # May need adaptation for AKS
```

## Customization

### Change Region
Edit `variables.tf` or `terraform.tfvars`:
```hcl
location = "westeurope"  # Amsterdam
# OR
location = "germanywestcentral"  # Frankfurt
```

Available EU regions:
- `westeurope` - Netherlands (Amsterdam)
- `northeurope` - Ireland (Dublin)
- `germanywestcentral` - Germany (Frankfurt)
- `germanynorth` - Germany (Berlin)
- `francecentral` - France (Paris)
- `uksouth` - UK (London)

### Enable Auto-scaling
```hcl
enable_auto_scaling = true
min_node_count      = 3
max_node_count      = 10
```

### Add Production High Availability
```hcl
environment                  = "production"
node_count                   = 5
postgres_backup_retention_days = 35
```

This enables:
- PostgreSQL zone-redundant high availability
- Geo-redundant backups
- Key Vault purge protection

## Monitoring

### View Container Logs
```bash
# Get all pods
kubectl get pods -n mvd

# View logs for specific pod
kubectl logs -n mvd <pod-name> -f

# View logs for all containers in a pod
kubectl logs -n mvd <pod-name> --all-containers=true
```

### Azure Monitor
Access via Azure Portal:
1. Navigate to AKS cluster
2. Click "Monitoring" → "Insights"
3. View container performance, logs, and metrics

### Log Analytics Queries
```kusto
// View all container logs
ContainerLog
| where Namespace == "mvd"
| order by TimeGenerated desc

// View error logs
ContainerLog
| where Namespace == "mvd"
| where LogEntry contains "ERROR"
| order by TimeGenerated desc
```

## Troubleshooting

### Pods not starting
```bash
kubectl get pods -n mvd
kubectl describe pod <pod-name> -n mvd
kubectl logs <pod-name> -n mvd
```

### ACR pull errors
Verify role assignment:
```bash
az role assignment list --scope $(terraform output -raw acr_id)
```

Re-apply if missing:
```bash
terraform apply -target=azurerm_role_assignment.aks_acr_pull
```

### PostgreSQL connection issues
1. Verify databases exist:
   ```bash
   az postgres flexible-server db list \
     --resource-group mvd-rg \
     --server-name $(terraform output -raw postgres_fqdn | cut -d. -f1)
   ```

2. Check network connectivity from AKS:
   ```bash
   kubectl run -it --rm psql-test --image=postgres:15 \
     --restart=Never -- \
     psql -h <postgres-fqdn> -U mvdadmin -d consumer
   ```

### Terraform state lock issues
```bash
# Clear state lock (use carefully!)
terraform force-unlock <lock-id>
```

## Cleanup

**Warning**: This will delete ALL resources and data.

```bash
terraform destroy
# Type 'yes' when prompted
```

## Cost Optimization

1. **Stop cluster during non-work hours** (staging only):
   ```bash
   az aks stop --resource-group mvd-rg --name mvd-cluster
   az aks start --resource-group mvd-rg --name mvd-cluster
   ```

2. **Use Azure Reserved Instances**: 40-60% savings for 1-3 year commitments

3. **Enable auto-scaling**: Scale down during low usage

4. **Use spot instances** (staging only):
   Add spot node pool for non-critical workloads

## Security Best Practices

- ✅ Private cluster enabled (nodes not exposed to internet)
- ✅ Azure RBAC for Kubernetes authorization
- ✅ Network policies (Calico)
- ✅ Secrets managed in Azure Key Vault
- ✅ Container scanning enabled in ACR
- ✅ Audit logging to Log Analytics

**Additional recommendations**:
- Enable Azure Policy for Kubernetes
- Configure Azure Firewall for egress traffic
- Implement pod security policies
- Enable Microsoft Defender for Containers

## References

- [Azure AKS Documentation](https://learn.microsoft.com/en-us/azure/aks/)
- [Azure Key Vault Integration](https://learn.microsoft.com/en-us/azure/aks/csi-secrets-store-driver)
- [Azure PostgreSQL Flexible Server](https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/)
- [MVD Cloud Deployment Guide](../README.md)
