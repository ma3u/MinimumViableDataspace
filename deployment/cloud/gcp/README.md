# Google GKE Deployment for MVD

**Status**: Terraform templates for Google GKE deployment are planned for a future phase.

## Overview

This directory will contain Terraform configurations for deploying Minimum Viable Dataspace to Google Kubernetes Engine (GKE).

## Planned Architecture

```
┌────────────────────────────────────────────────────────────┐
│                 Google Cloud Project                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Google Kubernetes Engine (GKE)                      │  │
│  │  - VPC with public/private subnets                   │  │
│  │  - GKE control plane (managed)                       │  │
│  │  - Node pools (3-5 e2-standard-4)                    │  │
│  │  - MVD components in 'mvd' namespace                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Artifact Registry                                    │  │
│  │  - controlplane, dataplane, identity-hub, etc.       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cloud SQL for PostgreSQL                            │  │
│  │  - High availability (HA)                            │  │
│  │  - 6 databases for MVD components                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Secret Manager                                       │  │
│  │  - EDC runtime secrets                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Cloud Monitoring & Logging                           │  │
│  │  - GKE metrics                                       │  │
│  │  - Structured logs                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Recommended Configuration

### Region
- **Primary**: `europe-west4` (Netherlands) - GDPR/EHDS compliance
- **Alternative**: `europe-west3` (Frankfurt)

### GKE Cluster
- **Mode**: Standard (for control) or Autopilot (for ease)
- **Kubernetes Version**: 1.28+
- **Node Count**: 3-5 nodes
- **Machine Type**:
  - Staging: `e2-standard-2` (2 vCPU, 8 GB RAM)
  - Production: `e2-standard-4` (4 vCPU, 16 GB RAM)
- **Network**: VPC-native with Private Google Access

### Cloud SQL PostgreSQL
- **Engine**: PostgreSQL 15
- **Tier**:
  - Staging: `db-f1-micro` or `db-g1-small`
  - Production: `db-custom-2-8192` (2 vCPU, 8 GB RAM)
- **Storage**: 100 GB SSD
- **High Availability**: Enabled for production

### Cost Estimate
- **Staging**: ~$250-300/month
- **Production**: ~$600-900/month (with HA)

**Note**: GKE Autopilot mode can reduce costs by auto-scaling node resources, but may have higher per-pod costs.

## When to Use GKE

Choose Google GKE if:
- ✅ Best-in-class monitoring and observability (Cloud Monitoring/Logging)
- ✅ Autopilot mode for zero cluster management overhead
- ✅ Existing Google Cloud infrastructure
- ✅ Integration with GCP services (BigQuery, Pub/Sub, etc.)
- ✅ Strong Kubernetes integration (GKE is Google's native platform)

## Quick Start (Manual for Now)

Until Terraform templates are available, you can manually deploy:

1. **Create GKE Cluster**
   ```bash
   # Standard mode
   gcloud container clusters create mvd-cluster \
     --region europe-west4 \
     --num-nodes 3 \
     --machine-type e2-standard-2 \
     --enable-ip-alias \
     --enable-stackdriver-kubernetes
   
   # OR Autopilot mode (recommended for ease)
   gcloud container clusters create-auto mvd-cluster \
     --region europe-west4
   ```

2. **Create Artifact Registry Repository**
   ```bash
   gcloud artifacts repositories create mvd \
     --repository-format=docker \
     --location=europe-west4
   ```

3. **Create Cloud SQL PostgreSQL**
   ```bash
   gcloud sql instances create mvd-postgres \
     --database-version=POSTGRES_15 \
     --tier=db-custom-2-8192 \
     --region=europe-west4 \
     --availability-type=regional  # HA
   
   # Create databases
   for db in consumer provider_qna provider_manufacturing consumer_identityhub provider_identityhub issuer; do
     gcloud sql databases create $db --instance=mvd-postgres
   done
   ```

4. **Configure kubectl**
   ```bash
   gcloud container clusters get-credentials mvd-cluster --region europe-west4
   ```

5. **Push Images**
   ```bash
   gcloud auth configure-docker europe-west4-docker.pkg.dev
   
   PROJECT_ID=$(gcloud config get-value project)
   docker tag controlplane:latest europe-west4-docker.pkg.dev/$PROJECT_ID/mvd/controlplane:latest
   docker push europe-west4-docker.pkg.dev/$PROJECT_ID/mvd/controlplane:latest
   # Repeat for other images
   ```

6. **Deploy MVD**
   - Adapt existing `deployment/*.tf` Kubernetes manifests
   - Update image references to Artifact Registry
   - Apply with `kubectl apply`

## GKE Autopilot vs Standard

| Feature | Autopilot | Standard |
|---------|-----------|----------|
| **Node Management** | Fully managed | Manual |
| **Cost** | Pay-per-pod | Pay-per-node |
| **Flexibility** | Limited node config | Full control |
| **Security** | Hardened by default | Manual hardening |
| **Recommended For** | Production simplicity | Custom requirements |

**Recommendation**: Use Autopilot for MVD unless you need specific node configurations (e.g., GPU, high-memory nodes).

## Monitoring Advantages

GKE provides best-in-class observability out of the box:
- **Cloud Monitoring**: Pre-built dashboards for GKE, no setup needed
- **Cloud Logging**: Structured logs with powerful query language
- **Cloud Trace**: Distributed tracing integration
- **Error Reporting**: Automatic error aggregation and alerting

This makes GKE ideal for production deployments where monitoring is critical.

## Contributing

If you'd like to contribute Google GKE Terraform templates, please:
1. Follow the structure of `deployment/cloud/azure/`
2. Create `main.tf`, `variables.tf`, `outputs.tf`
3. Support both Standard and Autopilot modes
4. Document in this README
5. Submit a pull request

## References

- [Google GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [GKE Autopilot](https://cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview)
- [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres)
- [GKE Best Practices](https://cloud.google.com/kubernetes-engine/docs/best-practices)
- [MVD Cloud Deployment Guide](../README.md)
