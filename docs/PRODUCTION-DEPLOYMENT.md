# Production Deployment Guide

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Cloud Platform Selection](#cloud-platform-selection)
- [Deployment Architecture](#deployment-architecture)
- [Azure AKS Deployment](#azure-aks-deployment)
- [AWS EKS Deployment](#aws-eks-deployment)
- [GCP GKE Deployment](#gcp-gke-deployment)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Security Hardening](#security-hardening)
- [Cost Optimization](#cost-optimization)
- [Troubleshooting](#troubleshooting)

## Overview

This guide provides step-by-step instructions for deploying MinimumViableDataspace (MVD) to production Kubernetes environments on major cloud platforms: Azure AKS, AWS EKS, and Google Cloud GKE.

**Production Deployment Characteristics**:
- ✅ High Availability (multi-replica, multi-zone)
- ✅ Auto-scaling (HPA for pods, cluster autoscaler)
- ✅ Security hardening (NetworkPolicies, RBAC, Pod Security Standards)
- ✅ Managed services (PostgreSQL, Key Vault, Load Balancer)
- ✅ Observability (Prometheus, Grafana, Jaeger)
- ✅ Disaster Recovery (automated backups, documented procedures)

## Prerequisites

### Required Tools

| Tool | Version | Purpose |
|------|---------|---------|
| `kubectl` | 1.28+ | Kubernetes cluster management |
| `helm` | 3.13+ | Package manager for Kubernetes |
| `terraform` | 1.6+ | Infrastructure as Code |
| Cloud CLI | Latest | Azure CLI / AWS CLI / gcloud |
| `docker` | 24.0+ | Container image management |

### Installation

```bash
# Kubernetes CLI
brew install kubectl

# Helm
brew install helm

# Terraform
brew install terraform

# Azure CLI
brew install azure-cli

# AWS CLI
brew install awscli

# Google Cloud SDK
brew install --cask google-cloud-sdk
```

### Container Images

All MVD container images are published to GitHub Container Registry (GHCR):

```
ghcr.io/ma3u/controlplane:latest
ghcr.io/ma3u/dataplane:latest
ghcr.io/ma3u/identity-hub:latest
ghcr.io/ma3u/catalog-server:latest
ghcr.io/ma3u/issuerservice:latest
```

For production, use specific version tags:
```
ghcr.io/ma3u/controlplane:v1.2.3
```

## Cloud Platform Selection

### Decision Matrix

| Criterion | Azure AKS | AWS EKS | GCP GKE |
|-----------|-----------|---------|---------|
| **EU Data Residency** | ✅ Excellent | ⚠️ Limited | ⚠️ Limited |
| **GDPR Compliance** | ✅ Strong | ✅ Strong | ✅ Strong |
| **Cost (€/month)** | €500-800 | $600-900 | $550-850 |
| **Managed PostgreSQL** | ✅ Azure Database | ✅ RDS | ✅ Cloud SQL |
| **Key Management** | ✅ Key Vault | ✅ KMS/Secrets Mgr | ✅ Secret Manager |
| **Enterprise Support** | ✅ Excellent | ✅ Excellent | ✅ Good |
| **Community/Docs** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

### Recommendation

**Azure AKS** is recommended for MVD deployments requiring:
- EU data residency (EHDS compliance)
- Enterprise Microsoft integration
- Strong GDPR compliance posture

**AWS EKS** is recommended for:
- Global reach and multi-region deployments
- Mature ecosystem and extensive documentation
- Advanced networking requirements

**GCP GKE** is recommended for:
- ML/AI integration requirements
- Cost optimization focus
- Google Cloud ecosystem integration

## Deployment Architecture

### Production Topology

```
┌─────────────────────────────────────────────────────────┐
│                   Cloud Load Balancer                    │
│          (Azure LB / AWS ALB / GCP Load Balancer)       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              NGINX Ingress Controller                    │
│  TLS Termination | Rate Limiting | Authentication       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│          Kubernetes Cluster (3+ worker nodes)            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Consumer Namespace                                │  │
│  │  - Controlplane (3 replicas)                      │  │
│  │  - Dataplane (2 replicas, HPA)                    │  │
│  │  - IdentityHub (2 replicas)                       │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Provider Namespace                                │  │
│  │  - QnA Controlplane (3 replicas)                  │  │
│  │  - Manufacturing Controlplane (3 replicas)        │  │
│  │  - Catalog Server (2 replicas)                    │  │
│  │  - IdentityHub (2 replicas)                       │  │
│  │  - Dataplanes (2 replicas each, HPA)             │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Dataspace Namespace                               │  │
│  │  - Issuer Service (2 replicas)                    │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Observability Namespace                           │  │
│  │  - Prometheus Operator                             │  │
│  │  - Grafana                                         │  │
│  │  - Jaeger                                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│               Managed Services                           │
│  - PostgreSQL (HA, Multi-AZ)                            │
│  - Key Vault / Secrets Manager                          │
│  - Backup Storage                                        │
│  - Monitoring & Logging                                  │
└─────────────────────────────────────────────────────────┘
```

### Resource Requirements

**Per Controlplane Instance**:
- CPU: 1 core (request), 2 cores (limit)
- Memory: 2 GiB (request), 4 GiB (limit)
- Storage: 10 GiB (ephemeral)

**Per Dataplane Instance**:
- CPU: 500m (request), 1 core (limit)
- Memory: 1 GiB (request), 2 GiB (limit)
- Storage: 5 GiB (ephemeral)

**Cluster Sizing (Minimum)**:
- **Development**: 3 nodes x 4 vCPU, 16 GiB RAM each
- **Staging**: 3 nodes x 8 vCPU, 32 GiB RAM each
- **Production**: 6+ nodes x 8 vCPU, 32 GiB RAM each (multi-zone)

## Azure AKS Deployment

### Step 1: Prerequisites

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Set environment variables
export RESOURCE_GROUP="mvd-production-rg"
export LOCATION="westeurope"
export CLUSTER_NAME="mvd-aks-prod"
export ACR_NAME="mvdacr"
```

### Step 2: Create Resource Group

```bash
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION \
  --tags environment=production project=mvd
```

### Step 3: Deploy AKS Cluster

```bash
# Create AKS cluster with production settings
az aks create \
  --resource-group $RESOURCE_GROUP \
  --name $CLUSTER_NAME \
  --node-count 3 \
  --node-vm-size Standard_D8s_v3 \
  --enable-managed-identity \
  --enable-cluster-autoscaler \
  --min-count 3 \
  --max-count 10 \
  --zones 1 2 3 \
  --network-plugin azure \
  --network-policy azure \
  --enable-pod-security-policy \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --kubernetes-version 1.28

# Get credentials
az aks get-credentials \
  --resource-group $RESOURCE_GROUP \
  --name $CLUSTER_NAME \
  --overwrite-existing
```

### Step 4: Deploy Azure PostgreSQL

```bash
# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name mvd-postgres-prod \
  --location $LOCATION \
  --admin-user mvdadmin \
  --admin-password "SECURE_PASSWORD_HERE" \
  --sku-name Standard_D4s_v3 \
  --tier GeneralPurpose \
  --storage-size 128 \
  --version 15 \
  --high-availability Enabled \
  --zone 1 \
  --standby-zone 2

# Create databases
az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name mvd-postgres-prod \
  --database-name consumer_edc

az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name mvd-postgres-prod \
  --database-name provider_edc

az postgres flexible-server db create \
  --resource-group $RESOURCE_GROUP \
  --server-name mvd-postgres-prod \
  --database-name issuer_edc
```

### Step 5: Configure Azure Key Vault

```bash
# Create Key Vault
az keyvault create \
  --resource-group $RESOURCE_GROUP \
  --name mvd-keyvault-prod \
  --location $LOCATION \
  --enable-rbac-authorization \
  --retention-days 90

# Store PostgreSQL credentials
az keyvault secret set \
  --vault-name mvd-keyvault-prod \
  --name postgres-password \
  --value "SECURE_PASSWORD_HERE"

# Store EDC keys
az keyvault secret set \
  --vault-name mvd-keyvault-prod \
  --name consumer-private-key \
  --file deployment/assets/consumer_private.pem
```

### Step 6: Install External Secrets Operator

```bash
# Add Helm repo
helm repo add external-secrets https://charts.external-secrets.io
helm repo update

# Install External Secrets Operator
helm install external-secrets \
  external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace \
  --set installCRDs=true
```

### Step 7: Deploy MVD via Terraform

```bash
cd deployment/terraform/azure

# Initialize Terraform
terraform init

# Create terraform.tfvars
cat > terraform.tfvars <<EOF
resource_group_name = "$RESOURCE_GROUP"
cluster_name        = "$CLUSTER_NAME"
postgres_host       = "mvd-postgres-prod.postgres.database.azure.com"
key_vault_name      = "mvd-keyvault-prod"
environment         = "production"
enable_monitoring   = true
replica_count       = 3
EOF

# Plan deployment
terraform plan

# Apply deployment
terraform apply
```

### Step 8: Verify Deployment

```bash
# Check pods
kubectl get pods --all-namespaces

# Check services
kubectl get svc --all-namespaces

# Check ingress
kubectl get ingress --all-namespaces

# Test health endpoints
curl https://mvd.yourdomain.com/consumer/api/check/health
```

## AWS EKS Deployment

### Step 1: Prerequisites

```bash
# Configure AWS CLI
aws configure

# Set environment variables
export AWS_REGION="eu-west-1"
export CLUSTER_NAME="mvd-eks-prod"
export VPC_CIDR="10.0.0.0/16"
```

### Step 2: Deploy EKS Cluster with eksctl

```bash
# Create cluster configuration
cat > mvd-eks-cluster.yaml <<EOF
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: $CLUSTER_NAME
  region: $AWS_REGION
  version: "1.28"

availabilityZones:
  - ${AWS_REGION}a
  - ${AWS_REGION}b
  - ${AWS_REGION}c

managedNodeGroups:
  - name: mvd-workers
    instanceType: m5.2xlarge
    minSize: 3
    maxSize: 10
    desiredCapacity: 3
    volumeSize: 100
    ssh:
      allow: false
    labels:
      role: worker
      environment: production
    tags:
      k8s.io/cluster-autoscaler/enabled: "true"
      k8s.io/cluster-autoscaler/$CLUSTER_NAME: "owned"

addons:
  - name: vpc-cni
  - name: coredns
  - name: kube-proxy
  - name: aws-ebs-csi-driver

iam:
  withOIDC: true
EOF

# Create cluster
eksctl create cluster -f mvd-eks-cluster.yaml

# Get credentials
aws eks update-kubeconfig \
  --region $AWS_REGION \
  --name $CLUSTER_NAME
```

### Step 3: Deploy RDS PostgreSQL

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier mvd-postgres-prod \
  --db-instance-class db.r5.xlarge \
  --engine postgres \
  --engine-version 15.4 \
  --master-username mvdadmin \
  --master-user-password "SECURE_PASSWORD_HERE" \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --multi-az \
  --backup-retention-period 30 \
  --vpc-security-group-ids sg-xxxxxxxx \
  --db-subnet-group-name mvd-db-subnet-group \
  --publicly-accessible false
```

### Step 4: Configure AWS Secrets Manager

```bash
# Store PostgreSQL credentials
aws secretsmanager create-secret \
  --name mvd/postgres/password \
  --secret-string "SECURE_PASSWORD_HERE" \
  --region $AWS_REGION

# Store EDC keys
aws secretsmanager create-secret \
  --name mvd/consumer/private-key \
  --secret-binary fileb://deployment/assets/consumer_private.pem \
  --region $AWS_REGION
```

### Step 5: Install External Secrets Operator

```bash
# Add Helm repo
helm repo add external-secrets https://charts.external-secrets.io

# Install with AWS backend
helm install external-secrets \
  external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace \
  --set installCRDs=true
```

### Step 6: Deploy MVD

```bash
cd deployment/terraform/aws

terraform init
terraform plan
terraform apply
```

## GCP GKE Deployment

### Step 1: Prerequisites

```bash
# Login to GCP
gcloud auth login

# Set project
export PROJECT_ID="mvd-production"
export CLUSTER_NAME="mvd-gke-prod"
export REGION="europe-west1"

gcloud config set project $PROJECT_ID
```

### Step 2: Deploy GKE Cluster

```bash
# Create GKE cluster
gcloud container clusters create $CLUSTER_NAME \
  --region $REGION \
  --num-nodes 1 \
  --node-locations europe-west1-b,europe-west1-c,europe-west1-d \
  --machine-type n2-standard-8 \
  --disk-size 100 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 3 \
  --enable-autorepair \
  --enable-autoupgrade \
  --enable-network-policy \
  --enable-ip-alias \
  --workload-pool=$PROJECT_ID.svc.id.goog \
  --addons HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver

# Get credentials
gcloud container clusters get-credentials $CLUSTER_NAME \
  --region $REGION
```

### Step 3: Deploy Cloud SQL PostgreSQL

```bash
# Create Cloud SQL instance
gcloud sql instances create mvd-postgres-prod \
  --database-version=POSTGRES_15 \
  --tier=db-custom-4-16384 \
  --region=$REGION \
  --availability-type=REGIONAL \
  --backup \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --retained-backups-count=30

# Create databases
gcloud sql databases create consumer_edc \
  --instance=mvd-postgres-prod

gcloud sql databases create provider_edc \
  --instance=mvd-postgres-prod
```

### Step 4: Configure Secret Manager

```bash
# Store PostgreSQL password
echo -n "SECURE_PASSWORD_HERE" | \
  gcloud secrets create mvd-postgres-password \
  --data-file=-

# Store EDC keys
gcloud secrets create mvd-consumer-private-key \
  --data-file=deployment/assets/consumer_private.pem
```

### Step 5: Deploy MVD

```bash
cd deployment/terraform/gcp

terraform init
terraform plan
terraform apply
```

## Post-Deployment Configuration

### DNS Configuration

Point your domain to the load balancer:

```bash
# Get load balancer IP
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Create DNS A records
# consumer.mvd.yourdomain.com -> LOAD_BALANCER_IP
# provider.mvd.yourdomain.com -> LOAD_BALANCER_IP
```

### TLS Certificates

Install cert-manager for automatic certificate management:

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourdomain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Monitoring Setup

```bash
# Install Prometheus Operator
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install kube-prometheus-stack \
  prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# Access Grafana
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```

## Security Hardening

See [SECURITY.md](SECURITY.md) for comprehensive security hardening guide.

**Quick Checklist**:
- ✅ NetworkPolicies enabled (deny-all default)
- ✅ Pod Security Standards (Restricted)
- ✅ RBAC with least privilege
- ✅ Secrets in external vault (not in Git)
- ✅ TLS for all ingress
- ✅ Non-root containers
- ✅ Read-only root filesystem
- ✅ Resource limits configured
- ✅ Image scanning enabled (Trivy in CI/CD)

## Cost Optimization

### Resource Right-Sizing

```bash
# Install Vertical Pod Autoscaler
kubectl apply -f https://github.com/kubernetes/autoscaler/releases/download/vertical-pod-autoscaler-0.14.0/vpa-v0.14.0.yaml

# Enable VPA recommendations
kubectl create -f - <<EOF
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: consumer-controlplane-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: consumer-controlplane
  updateMode: "Recreate"
EOF
```

### Cost Monitoring

**Azure**:
```bash
az consumption usage list --start-date 2024-01-01 --end-date 2024-01-31
```

**AWS**:
```bash
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity MONTHLY \
  --metrics BlendedCost
```

**GCP**:
```bash
gcloud billing accounts list
gcloud billing projects describe $PROJECT_ID
```

### Estimated Monthly Costs

**Development Environment**: €150-250 / $180-300
- 3 x small nodes
- Development PostgreSQL
- Minimal backups

**Staging Environment**: €350-500 / $400-600
- 3 x medium nodes
- Standard PostgreSQL
- 7-day backups

**Production Environment**: €800-1200 / $900-1400
- 6+ x large nodes (multi-zone)
- HA PostgreSQL
- 30-day backups
- Enhanced monitoring

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n <namespace>

# Describe pod
kubectl describe pod <pod-name> -n <namespace>

# Check logs
kubectl logs <pod-name> -n <namespace>

# Check events
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

**Common Issues**:
- ImagePullBackOff: Check image name and registry credentials
- CrashLoopBackOff: Check application logs
- Pending: Check resource constraints and node availability

### Database Connection Issues

```bash
# Test PostgreSQL connectivity
kubectl run -it --rm debug \
  --image=postgres:15 \
  --restart=Never \
  -- psql -h <postgres-host> -U mvdadmin -d consumer_edc

# Check secrets
kubectl get secret mvd-postgres-credentials -o yaml
```

### Ingress Not Working

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress resources
kubectl get ingress --all-namespaces

# Check ingress logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

### Performance Issues

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -A

# Check HPA status
kubectl get hpa -A

# Check for throttling
kubectl describe pod <pod-name> | grep -A 10 "State:"
```

## Next Steps

1. ✅ Review [SECURITY.md](SECURITY.md) for security hardening
2. ✅ Configure monitoring and alerting
3. ✅ Set up disaster recovery procedures (see [RUNBOOK.md](RUNBOOK.md))
4. ✅ Run smoke tests to verify deployment
5. ✅ Configure DNS and TLS certificates
6. ✅ Set up CI/CD deployment pipeline
7. ✅ Document runbooks for operations team

## Support

For issues or questions:
- GitHub Issues: https://github.com/ma3u/MinimumViableDataspace/issues
- Documentation: https://github.com/ma3u/MinimumViableDataspace/tree/main/docs

---

**Last Updated**: 2024-12-28  
**Version**: 1.0.0
