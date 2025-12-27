# Amazon EKS Deployment for MVD

**Status**: Terraform templates for AWS EKS deployment are planned for a future phase.

## Overview

This directory will contain Terraform configurations for deploying Minimum Viable Dataspace to Amazon Elastic Kubernetes Service (EKS).

## Planned Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     AWS Account                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Amazon EKS Cluster                                  │  │
│  │  - VPC with public/private subnets                   │  │
│  │  - EKS control plane                                 │  │
│  │  - Managed node groups (3-5 t3.large)               │  │
│  │  - MVD components in 'mvd' namespace                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Amazon Elastic Container Registry (ECR)             │  │
│  │  - controlplane, dataplane, identity-hub, etc.       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Amazon RDS for PostgreSQL                           │  │
│  │  - Multi-AZ for HA                                   │  │
│  │  - 6 databases for MVD components                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AWS Secrets Manager                                 │  │
│  │  - EDC runtime secrets                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  CloudWatch                                           │  │
│  │  - Container Insights                                │  │
│  │  - Logs and metrics                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Recommended Configuration

### Region
- **Primary**: `eu-central-1` (Frankfurt) - GDPR/EHDS compliance
- **Alternative**: `eu-west-1` (Ireland)

### EKS Cluster
- **Kubernetes Version**: 1.28+
- **Node Count**: 3-5 nodes
- **Instance Type**: 
  - Staging: `t3.large` (2 vCPU, 8 GB RAM)
  - Production: `t3.xlarge` (4 vCPU, 16 GB RAM)
- **Network**: VPC with private subnets, NAT Gateway

### RDS PostgreSQL
- **Engine**: PostgreSQL 15
- **Instance Class**:
  - Staging: `db.t3.micro`
  - Production: `db.t3.medium` or `db.r6g.large`
- **Storage**: 100 GB GP3
- **Multi-AZ**: Enabled for production

### Cost Estimate
- **Staging**: ~$200-250/month
- **Production**: ~$600-900/month (with Multi-AZ HA)

## When to Use EKS

Choose AWS EKS if:
- ✅ Existing AWS infrastructure
- ✅ Need for AWS-specific services (S3, DynamoDB, Lambda)
- ✅ Global deployment outside EU
- ✅ Integration with AWS IAM and security services

## Quick Start (Manual for Now)

Until Terraform templates are available, you can manually deploy:

1. **Create EKS Cluster**
   ```bash
   eksctl create cluster \
     --name mvd-cluster \
     --region eu-central-1 \
     --nodes 3 \
     --node-type t3.large \
     --managed
   ```

2. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name mvd/controlplane --region eu-central-1
   aws ecr create-repository --repository-name mvd/dataplane --region eu-central-1
   aws ecr create-repository --repository-name mvd/identity-hub --region eu-central-1
   aws ecr create-repository --repository-name mvd/catalog-server --region eu-central-1
   aws ecr create-repository --repository-name mvd/issuerservice --region eu-central-1
   ```

3. **Create RDS PostgreSQL**
   - Use AWS Console or CLI to create RDS instance
   - Create 6 databases: `consumer`, `provider_qna`, `provider_manufacturing`, `consumer_identityhub`, `provider_identityhub`, `issuer`

4. **Push Images**
   ```bash
   aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-central-1.amazonaws.com
   
   docker tag controlplane:latest <account-id>.dkr.ecr.eu-central-1.amazonaws.com/mvd/controlplane:latest
   docker push <account-id>.dkr.ecr.eu-central-1.amazonaws.com/mvd/controlplane:latest
   # Repeat for other images
   ```

5. **Deploy MVD**
   - Adapt existing `deployment/*.tf` Kubernetes manifests
   - Update image references to ECR
   - Apply with `kubectl apply`

## Contributing

If you'd like to contribute AWS EKS Terraform templates, please:
1. Follow the structure of `deployment/cloud/azure/`
2. Create `main.tf`, `variables.tf`, `outputs.tf`
3. Document in this README
4. Submit a pull request

## References

- [Amazon EKS Documentation](https://docs.aws.amazon.com/eks/)
- [eksctl - EKS CLI](https://eksctl.io/)
- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [MVD Cloud Deployment Guide](../README.md)
