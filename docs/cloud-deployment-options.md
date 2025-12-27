# Cloud Deployment & Container Framework Options

## Executive Summary

This document provides recommendations for deploying Minimum Viable Dataspace (MVD) to production cloud Kubernetes clusters and selecting optimal local development container frameworks.

**Quick Recommendations:**
- **Cloud K8s**: Azure Kubernetes Service (AKS) - Best for enterprise EHDS compliance
- **Local Development**: OrbStack or Rancher Desktop - macOS-optimized alternatives to Docker Desktop

---

## Cloud Kubernetes Deployment Options

### Comparison Matrix

| Feature | Azure AKS | AWS EKS | Google GKE | Recommendation |
|---------|-----------|---------|------------|----------------|
| **EHDS Compliance** | ✅ EU data residency | ⚠️ Requires careful region selection | ✅ EU regions available | **AKS** |
| **Managed Service** | Fully managed control plane | Fully managed control plane | Fully managed (Autopilot) | All equal |
| **Cost (3-node cluster)** | ~$200-300/month | ~$220-350/month | ~$250-400/month | **AKS** (slight edge) |
| **EDC Integration** | Native Azure AD integration | IAM integration | GCP IAM integration | **AKS** |
| **Private Link/VPN** | Azure Private Link | AWS PrivateLink | Private Service Connect | All equal |
| **Vault Integration** | Azure Key Vault | AWS Secrets Manager | Secret Manager | **AKS** (best EDC support) |
| **PostgreSQL** | Azure Database for PostgreSQL | RDS for PostgreSQL | Cloud SQL for PostgreSQL | All equal |
| **Monitoring** | Azure Monitor + Application Insights | CloudWatch + Container Insights | Cloud Monitoring | **GKE** (best integrated) |
| **Data Sovereignty** | EU regions (West Europe, North Europe) | EU regions (Frankfurt, Ireland) | EU regions (Belgium, Netherlands) | **AKS** (more EU options) |

### Recommendation: Azure Kubernetes Service (AKS)

**Rationale:**
1. **EHDS Compliance**: AKS in EU regions (West Europe, North Europe) provides native GDPR/EHDS data residency
2. **Enterprise Readiness**: Best integration with Azure AD for identity management (aligns with EDC DCP)
3. **Cost-Effective**: Slightly lower costs than competitors for equivalent configurations
4. **HashiCorp Vault Integration**: Azure Key Vault works seamlessly with EDC's persistence layer
5. **German/EU Market**: Strong presence in Germany (Germany West Central, Germany North) for GDNG compliance

**Typical AKS Configuration for MVD:**
```yaml
Resource Group: mvd-production
Location: West Europe (Amsterdam) or Germany West Central (Frankfurt)
Node Count: 3-5 nodes
Node VM Size: Standard_D4s_v3 (4 vCPU, 16 GB RAM)
Kubernetes Version: 1.28+ (auto-upgrade enabled)
Network Plugin: Azure CNI
Load Balancer: Standard SKU
Container Registry: Azure Container Registry (ACR)
Monitoring: Azure Monitor for containers
Backup: Azure Backup for AKS
Cost: ~€250-350/month (3 nodes) + storage/egress
```

### Alternative: Amazon EKS

**When to Choose EKS:**
- Existing AWS infrastructure
- Need for AWS-specific services (e.g., DynamoDB, S3)
- Global deployment outside EU

**EKS Configuration:**
```yaml
Region: eu-central-1 (Frankfurt) or eu-west-1 (Ireland)
Node Group: 3-5 t3.large (2 vCPU, 8 GB RAM)
Kubernetes Version: 1.28+
VPC: Private subnets + NAT Gateway
Storage: EBS gp3 volumes
Registry: Amazon ECR
Monitoring: CloudWatch Container Insights
Cost: ~$250-400/month
```

### Alternative: Google Kubernetes Engine (GKE)

**When to Choose GKE:**
- Best-in-class monitoring and observability needs
- Autopilot mode for zero cluster management
- Google Cloud existing infrastructure

**GKE Configuration:**
```yaml
Region: europe-west4 (Netherlands) or europe-west3 (Frankfurt)
Mode: Autopilot (recommended) or Standard
Node Count: 3-5 e2-standard-4 (4 vCPU, 16 GB RAM)
Kubernetes Version: 1.28+ (auto-upgrade)
Network: VPC-native with Private Google Access
Registry: Artifact Registry
Monitoring: Google Cloud Monitoring + Logging
Cost: ~$300-450/month
```

---

## Local Development Container Frameworks

### Comparison Matrix (macOS Focus)

| Feature | Docker Desktop | Rancher Desktop | OrbStack | Podman Desktop |
|---------|----------------|-----------------|----------|----------------|
| **License** | Free for small teams, paid for enterprise | Open Source (Apache 2.0) | Free for individuals, paid for teams | Open Source (Apache 2.0) |
| **macOS Performance** | ⚠️ Slow (VM-based) | Good (lightweight VM) | ✅ **Excellent** (optimized) | Good (QEMU) |
| **Kubernetes Support** | ✅ Built-in | ✅ K3s (lightweight) | ✅ Built-in | ⚠️ Via minikube |
| **Memory Usage** | ~2-4 GB idle | ~1-2 GB idle | **~500 MB idle** | ~1-2 GB idle |
| **Startup Time** | ~30-60s | ~20-40s | **~5-10s** | ~30-50s |
| **KinD Support** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Docker Compose** | ✅ Native | ✅ Native | ✅ Native | ✅ Native |
| **Apple Silicon** | ✅ Native | ✅ Native | ✅ **Optimized** | ✅ Native |
| **Resource Limits** | Manual configuration | Manual configuration | **Auto-tuned** | Manual configuration |
| **Price** | $0-7/user/month | Free | $0-8/user/month | Free |

### Recommendation: OrbStack

**Rationale:**
1. **Best Performance**: 3-5x faster than Docker Desktop on macOS
2. **Minimal Resource Usage**: ~500 MB idle vs 2-4 GB for Docker Desktop
3. **Instant Startup**: 5-10 seconds vs 30-60 seconds
4. **KinD Compatible**: Full support for Kubernetes in Docker (used in MVD deployment)
5. **Docker Desktop Drop-in Replacement**: No code changes needed
6. **macOS Native**: Optimized for Apple Silicon and Intel Macs
7. **Cost-Effective**: Free for individuals, $8/user/month for teams

**Installation:**
```bash
# Install via Homebrew
brew install orbstack

# Or download from https://orbstack.dev
```

**MVD-Specific Benefits:**
- Faster EDC runtime startup (~3-5 seconds per container vs 10-15 seconds)
- Reduced build times for `./gradlew dockerize` (20-30% faster)
- Lower battery drain on MacBook development
- Native KinD cluster creation works identically to Docker Desktop

### Alternative: Rancher Desktop

**When to Choose Rancher Desktop:**
- Need 100% open source solution (no proprietary components)
- Want K3s (lightweight Kubernetes) instead of full Kubernetes
- Prefer SUSE/Rancher ecosystem

**Installation:**
```bash
brew install rancher-desktop
```

**Benefits:**
- Free and open source (Apache 2.0)
- Includes nerdctl (Docker CLI alternative)
- Built-in Kubernetes cluster (K3s)
- Good performance on macOS

**Trade-offs:**
- Slightly slower than OrbStack
- More memory usage than OrbStack
- Steeper learning curve for K3s vs standard Kubernetes

### Alternative: Podman Desktop

**When to Choose Podman Desktop:**
- Prefer Red Hat ecosystem
- Want rootless container execution
- Need compatibility with RHEL/Fedora environments

**Installation:**
```bash
brew install podman-desktop
```

**Trade-offs:**
- Kubernetes support via minikube (more complex)
- Some Docker Compose features not 100% compatible
- Requires familiarity with Podman vs Docker differences

### NOT Recommended: Docker Desktop (for Mac)

**Reasons:**
- Performance issues on macOS (VM overhead)
- High memory usage (2-4 GB idle)
- Slow startup times (30-60 seconds)
- Licensing concerns for enterprises (paid after 250 employees)
- Battery drain on MacBooks

**When Docker Desktop IS Acceptable:**
- Small teams (<250 employees) - free tier
- Already paid licensing
- Enterprise Docker support contract
- Need Docker Extensions ecosystem

---

## Deployment Architecture Recommendations

### Development Environment (Local)

```
┌─────────────────────────────────────────┐
│     macOS Developer Machine             │
│  ┌───────────────────────────────────┐  │
│  │  OrbStack / Rancher Desktop       │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  KinD Cluster (mvd-local)   │  │  │
│  │  │  - 1 control plane          │  │  │
│  │  │  - EDC runtimes             │  │  │
│  │  │  - PostgreSQL               │  │  │
│  │  │  - Vault                    │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

Cost: $0-8/month (OrbStack personal)
Performance: Excellent
Use Case: Day-to-day development, testing
```

### Staging Environment (Cloud)

```
┌─────────────────────────────────────────┐
│   Azure Kubernetes Service (AKS)       │
│   Region: Germany West Central         │
│  ┌───────────────────────────────────┐  │
│  │  Kubernetes Cluster (mvd-staging) │  │
│  │  - 3 nodes (Standard_D2s_v3)      │  │
│  │  - Azure Load Balancer            │  │
│  │  - Azure Key Vault                │  │
│  │  - Azure PostgreSQL Flexible      │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

Cost: ~€150-200/month
Performance: Good (smaller nodes)
Use Case: Integration testing, demo environment
```

### Production Environment (Cloud)

```
┌─────────────────────────────────────────┐
│   Azure Kubernetes Service (AKS)       │
│   Region: West Europe (Primary)        │
│           + Germany West Central (DR)  │
│  ┌───────────────────────────────────┐  │
│  │  Kubernetes Cluster (mvd-prod)    │  │
│  │  - 5 nodes (Standard_D4s_v3)      │  │
│  │  - Azure Application Gateway      │  │
│  │  - Azure Key Vault (HSM-backed)   │  │
│  │  - Azure PostgreSQL HA            │  │
│  │  - Azure Backup                   │  │
│  │  - Azure Monitor + Log Analytics  │  │
│  │  - Private Link for all services  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  Disaster Recovery (DR)           │  │
│  │  - Geo-redundant storage          │  │
│  │  - Cross-region replication       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

Cost: ~€500-800/month
Performance: Excellent (with HA/DR)
Use Case: Production workloads, EHDS compliance
```

---

## Cost Analysis

### Monthly Cost Breakdown

| Environment | Container Platform | Cloud K8s | Total |
|-------------|-------------------|-----------|-------|
| **Development (Local)** | OrbStack: €0-7 | N/A | **€0-7** |
| **Staging (AKS)** | N/A | 3 nodes + PostgreSQL + Vault: €150-200 | **€150-200** |
| **Production (AKS)** | N/A | 5 nodes + PostgreSQL HA + Monitoring + Backup: €500-800 | **€500-800** |

**Annual Cost (All Environments):** €7,800 - €12,000

**Cost Optimization Tips:**
1. Use Azure Reserved Instances (40-60% savings)
2. Enable auto-scaling to reduce idle resource costs
3. Use spot instances for non-production environments
4. Implement pod resource limits to avoid over-provisioning

---

## Migration Path from Current Setup

### Phase 1: Local Development Transition
1. Install OrbStack or Rancher Desktop
2. Verify KinD cluster creation: `kind create cluster -n mvd --config deployment/kind.config.yaml`
3. Test MVD deployment: `./gradlew -Ppersistence=true dockerize && kind load docker-image ...`
4. Validate seeding: `./seed-edc.sh`
5. Uninstall Docker Desktop (optional)

### Phase 2: Cloud Staging Setup
1. Create Azure account (or AWS/GCP)
2. Provision AKS cluster with Terraform (create `deployment/cloud/azure/`)
3. Set up Azure Container Registry (ACR)
4. Push EDC images: `docker tag controlplane:latest mvdregistry.azurecr.io/controlplane:latest`
5. Deploy to AKS: `kubectl apply -f deployment/cloud/azure/`
6. Test end-to-end DSP flow

### Phase 3: Production Deployment
1. Create production AKS cluster with HA configuration
2. Enable Azure Monitor and Log Analytics
3. Configure Azure Key Vault with HSM
4. Set up Azure PostgreSQL with geo-replication
5. Implement Azure Private Link for all services
6. Configure disaster recovery to secondary region
7. Perform security audit and penetration testing

---

## Security Considerations

### Cloud K8s Best Practices
- ✅ Enable Azure RBAC for Kubernetes authorization
- ✅ Use Azure Private Link for database/vault access
- ✅ Enable Azure Defender for Kubernetes
- ✅ Implement network policies (Calico or Azure Network Policies)
- ✅ Use pod security policies/standards
- ✅ Enable audit logging to Azure Monitor
- ✅ Rotate credentials regularly (Azure Key Vault integration)

### Local Development Security
- ✅ Use OrbStack's built-in isolation (stronger than Docker Desktop)
- ✅ Never commit secrets to git (use .env files)
- ✅ Run with least privilege (avoid root containers)
- ✅ Keep base images updated (automated with Dependabot)

---

## Monitoring & Observability

### Recommended Stack
1. **Azure Monitor** (AKS) or **CloudWatch** (EKS) or **Cloud Monitoring** (GKE)
   - Container insights
   - Log aggregation
   - Metrics collection

2. **Prometheus + Grafana** (Self-hosted)
   - Already configured in MVD-health demo
   - Portable across cloud providers
   - Custom dashboards for EDC metrics

3. **Jaeger** (Distributed Tracing)
   - Already configured in MVD-health demo
   - OTLP protocol support
   - DSP message flow visualization

4. **Loki** (Log Aggregation)
   - Already configured in MVD-health demo
   - Complements Grafana
   - Cost-effective alternative to cloud logging

---

## References

- [Azure AKS Documentation](https://learn.microsoft.com/en-us/azure/aks/)
- [Amazon EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Google GKE Documentation](https://cloud.google.com/kubernetes-engine/docs)
- [OrbStack Official Site](https://orbstack.dev)
- [Rancher Desktop Documentation](https://docs.rancherdesktop.io/)
- [EDC Deployment Guide](https://eclipse-edc.github.io/docs/)
- [KinD Documentation](https://kind.sigs.k8s.io/)
