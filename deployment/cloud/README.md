# Cloud Deployment for Minimum Viable Dataspace

This directory contains Terraform configurations for deploying MVD to managed Kubernetes services in major cloud providers.

## Overview

The cloud deployment templates provide production-ready configurations for:
- **Azure AKS** (`azure/`) - Recommended for EHDS/GDPR compliance
- **Amazon EKS** (`aws/`) - For AWS-native environments
- **Google GKE** (`gcp/`) - For Google Cloud environments
- **StackIT** (`stackit/`) - German sovereign cloud (Gaia-X, GDNG)
- **OVH Public Cloud** (`ovh/`) - European sovereign cloud (cost-effective)

## Quick Start

### Prerequisites

```bash
# Install required tools
brew install terraform azure-cli aws-cli google-cloud-sdk kubectl

# Authenticate to your cloud provider
az login          # Azure
aws configure     # AWS
gcloud auth login # GCP
```

### Deployment Steps

1. **Build MVD Images**
```bash
cd /path/to/MinimumViableDataspace
./gradlew -Ppersistence=true build
./gradlew -Ppersistence=true dockerize
```

2. **Choose Your Cloud Provider**
   - **Azure**: See `azure/README.md`
   - **AWS**: See `aws/README.md`
   - **GCP**: See `gcp/README.md`
   - **StackIT**: See `stackit/README.md`
   - **OVH**: See `ovh/README.md`

3. **Deploy**
```bash
cd azure/  # or aws/ or gcp/
terraform init
terraform plan
terraform apply
```

4. **Seed the Dataspace**
```bash
# Get kubeconfig
az aks get-credentials --resource-group mvd-rg --name mvd-cluster  # Azure
# aws eks update-kubeconfig --region eu-central-1 --name mvd-cluster  # AWS
# gcloud container clusters get-credentials mvd-cluster --region europe-west4  # GCP

# Seed
kubectl get pods -n mvd  # Verify all pods are running
./seed-cloud.sh  # Custom seed script for cloud deployment
```

## Architecture Comparison

| Feature | Azure AKS | AWS EKS | Google GKE | StackIT | OVH |
|---------|-----------|---------|------------|---------|-----|
| **Control Plane Cost** | Free | $0.10/hour (~$73/month) | Free (Autopilot) | Free | Free |
| **Node Cost** (3 nodes) | ~€150-200/month | ~$200-300/month | ~$250-400/month | ~€180-250/month | ~€120-180/month |
| **EU Data Residency** | ✅ West Europe, Germany | ✅ Frankfurt, Ireland | ✅ Belgium, Netherlands | ✅ Germany only | ✅ FR, DE, PL, UK |
| **Sovereign Cloud** | ❌ US company | ❌ US company | ❌ US company | ✅ German | ✅ French |
| **US CLOUD Act** | ⚠️ Applies | ⚠️ Applies | ⚠️ Applies | ❌ No exposure | ❌ No exposure |
| **EHDS Compliance** | ✅ Excellent | ⚠️ Good | ✅ Good | ✅ Excellent | ✅ Excellent |
| **EDC Integration** | ✅ Best (Azure Key Vault) | ✅ Good (AWS Secrets Manager) | ✅ Good (Secret Manager) | ✅ Good | ✅ Good |
| **Managed PostgreSQL** | Azure Database for PostgreSQL | RDS for PostgreSQL | Cloud SQL for PostgreSQL | StackIT PostgreSQL | OVH Databases |
| **Monitoring** | Azure Monitor | CloudWatch | Cloud Monitoring | Prometheus-based | Logs Data Platform |

## Recommendation

**Azure AKS** is recommended for EHDS/GDPR compliance due to:
- Strong EU data residency guarantees
- Native Azure AD integration for EDC identity management
- Best HashiCorp Vault integration via Azure Key Vault
- Cost-effective for European deployments

## Cost Estimates

### Staging Environment
- **Nodes**: 3x small instances (2 vCPU, 8 GB RAM)
- **Database**: Small PostgreSQL instance
- **Secrets**: Basic key vault
- **Total**: ~€150-200/month (Azure), ~$200-250/month (AWS/GCP)

### Production Environment
- **Nodes**: 5x medium instances (4 vCPU, 16 GB RAM)
- **Database**: High-availability PostgreSQL with backups
- **Secrets**: HSM-backed key vault
- **Monitoring**: Full stack (logs, metrics, traces)
- **Total**: ~€500-800/month (Azure), ~$600-900/month (AWS/GCP)

## Security Considerations

All cloud deployments include:
- ✅ Private cluster networking (nodes not exposed to internet)
- ✅ Managed identity/service accounts (no long-lived credentials)
- ✅ Network policies for pod-to-pod communication
- ✅ Secrets management via cloud-native key vaults
- ✅ TLS/SSL for all external endpoints
- ✅ Audit logging enabled
- ✅ Role-based access control (RBAC)

**CRITICAL**: Review and customize these templates for your organization's security policies before deploying to production.

## Customization

Each cloud provider directory contains:
- `main.tf` - Primary infrastructure configuration
- `variables.tf` - Customizable parameters (region, node count, instance types)
- `outputs.tf` - Output values (cluster endpoint, credentials)
- `README.md` - Provider-specific instructions

**Recommended customizations:**
1. Change `location`/`region` to your preferred EU region
2. Adjust `node_count` and `node_size` based on workload
3. Configure backup retention policies
4. Set up monitoring alerts and dashboards
5. Configure ingress/load balancer settings

## Troubleshooting

### Pods not starting
```bash
kubectl get pods -n mvd
kubectl describe pod <pod-name> -n mvd
kubectl logs <pod-name> -n mvd
```

### Database connection issues
- Verify database firewall rules allow cluster subnet
- Check secrets are correctly configured in Key Vault
- Validate connection strings in environment variables

### Image pull errors
- Ensure container registry is accessible from cluster
- Verify image names and tags are correct
- Check service account has pull permissions

## References

- [Azure AKS Best Practices](https://learn.microsoft.com/en-us/azure/aks/best-practices)
- [Amazon EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [Google GKE Best Practices](https://cloud.google.com/kubernetes-engine/docs/best-practices)
- [MVD Architecture Documentation](../../WARP.md)
- [Cloud Deployment Options Analysis](../../docs/cloud-deployment-options.md)
