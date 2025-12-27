# StackIT Kubernetes Deployment for MVD

**Status**: Terraform templates for StackIT Kubernetes deployment are planned for a future phase.

## Overview

This directory will contain Terraform configurations for deploying Minimum Viable Dataspace to StackIT Kubernetes Engine (SKE), the German sovereign cloud platform by Schwarz IT.

## Planned Architecture

```
┌────────────────────────────────────────────────────────────┐
│              StackIT Project (Germany)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  StackIT Kubernetes Engine (SKE)                     │  │
│  │  - Sovereign German infrastructure                   │  │
│  │  - Kubernetes 1.28+                                  │  │
│  │  - 3-5 node cluster                                  │  │
│  │  - MVD components in 'mvd' namespace                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  StackIT Container Registry (Harbor-based)           │  │
│  │  - controlplane, dataplane, identity-hub, etc.       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  StackIT PostgreSQL (Managed)                        │  │
│  │  - PostgreSQL 15                                     │  │
│  │  - High availability                                 │  │
│  │  - 6 databases for MVD components                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  StackIT Secrets Manager                             │  │
│  │  - EDC runtime secrets                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  StackIT Monitoring                                   │  │
│  │  - Prometheus-based metrics                          │  │
│  │  - Log aggregation                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Why StackIT?

### German Data Sovereignty
**StackIT** is the sovereign cloud platform of Schwarz IT (parent company of Lidl and Kaufland), designed for **German and EU data sovereignty**:

- ✅ **100% German infrastructure** - All data centers in Germany
- ✅ **GDPR/EHDS native compliance** - Purpose-built for EU regulations
- ✅ **German Digital Sovereignty Act (GDNG)** - Full compliance
- ✅ **Gaia-X aligned** - European cloud federation standards
- ✅ **BSI C5 certified** - German Federal Office for Information Security
- ✅ **No US CLOUD Act exposure** - German legal jurisdiction only

### When to Use StackIT

Choose StackIT if:
- ✅ German/EU data sovereignty is mandatory (GDNG, EHDS)
- ✅ Building Gaia-X compliant dataspaces
- ✅ Public sector or healthcare deployments in Germany
- ✅ Need BSI C5 or similar German certifications
- ✅ Prefer German support and legal framework

### Comparison with Global Clouds

| Feature | StackIT | Azure (EU) | AWS (EU) | GCP (EU) |
|---------|---------|------------|----------|----------|
| **German Data Sovereignty** | ✅ 100% | ⚠️ EU only | ⚠️ EU only | ⚠️ EU only |
| **US CLOUD Act Exposure** | ❌ None | ⚠️ Yes | ⚠️ Yes | ⚠️ Yes |
| **GDNG Compliance** | ✅ Native | ⚠️ Manual | ⚠️ Manual | ⚠️ Manual |
| **Gaia-X Aligned** | ✅ Yes | ⚠️ Partial | ⚠️ Partial | ⚠️ Partial |
| **Cost (3-node cluster)** | ~€180-250/month | ~€150-200/month | ~€200-300/month | ~€250-400/month |

## Recommended Configuration

### Region
- **Primary**: Germany (Frankfurt or Heilbronn data centers)
- **All infrastructure located in Germany**

### SKE Cluster
- **Kubernetes Version**: 1.28+
- **Node Count**: 3-5 nodes
- **Node Type**:
  - Staging: Standard nodes (2 vCPU, 8 GB RAM)
  - Production: Performance nodes (4 vCPU, 16 GB RAM)
- **Network**: Private cluster with load balancer

### PostgreSQL
- **Engine**: PostgreSQL 15
- **Configuration**:
  - Staging: Small instance
  - Production: High-availability with backups
- **Storage**: SSD-based, encrypted

### Cost Estimate
- **Staging**: ~€180-250/month
- **Production**: ~€600-900/month (with HA)

**Note**: StackIT pricing is competitive with global clouds while providing superior German data sovereignty.

## Quick Start (Manual for Now)

Until Terraform templates are available, you can manually deploy:

### Prerequisites

1. **StackIT Account**
   - Sign up at [stackit.de](https://www.stackit.de/)
   - Create project in StackIT Portal
   - Generate API credentials

2. **StackIT CLI**
   ```bash
   # Install StackIT CLI (if available)
   # Documentation: https://docs.stackit.cloud/
   ```

3. **kubectl**
   ```bash
   brew install kubectl
   ```

### Manual Deployment Steps

1. **Create SKE Cluster**
   - Use StackIT Portal or CLI
   - Select Germany region
   - Configure 3 nodes (staging) or 5 nodes (production)
   - Enable private networking

2. **Create Container Registry**
   - StackIT provides Harbor-based registry
   - Create repository for MVD images

3. **Create PostgreSQL Instance**
   - Use StackIT PostgreSQL service
   - Create 6 databases: `consumer`, `provider_qna`, `provider_manufacturing`, `consumer_identityhub`, `provider_identityhub`, `issuer`

4. **Build and Push Images**
   ```bash
   # Build MVD images
   cd /path/to/MinimumViableDataspace
   ./gradlew -Ppersistence=true build
   ./gradlew -Ppersistence=true dockerize
   
   # Login to StackIT registry
   docker login <stackit-registry-url>
   
   # Tag and push images
   docker tag controlplane:latest <stackit-registry-url>/mvd/controlplane:latest
   docker push <stackit-registry-url>/mvd/controlplane:latest
   # Repeat for other images
   ```

5. **Configure kubectl**
   ```bash
   # Download kubeconfig from StackIT Portal
   export KUBECONFIG=/path/to/stackit-kubeconfig.yaml
   kubectl get nodes
   ```

6. **Deploy MVD**
   - Adapt existing `deployment/*.tf` Kubernetes manifests
   - Update image references to StackIT registry
   - Apply with `kubectl apply`

## Data Sovereignty Advantages

### Legal Framework
- **German jurisdiction only** - No US CLOUD Act compliance required
- **GDPR Art. 44-50** - Adequate level of protection without transfer mechanisms
- **German GDNG** - Native compliance with Health Data Use Act
- **BSI oversight** - German federal cybersecurity standards

### Operational Benefits
- **No cross-border data transfers** - All processing in Germany
- **Simplified compliance** - No SCCs, BCRs, or TIA required
- **Lower legal risk** - No extraterritorial access concerns
- **Audit simplicity** - German auditors, German standards

### Use Cases Ideal for StackIT

1. **Health Dataspaces (EHDS)**
   - EHDS requires EU/EEA data localization
   - German hospitals and research institutions
   - Clinical trial data management

2. **Public Sector**
   - German government agencies (Verwaltungscloud)
   - Critical infrastructure (KRITIS)
   - Public research institutions

3. **Gaia-X Dataspaces**
   - Catena-X (automotive)
   - Manufacturing-X
   - Other federated data spaces

4. **Financial Services**
   - BaFin-regulated institutions
   - German banking sector
   - Insurance dataspaces

## Terraform Development Roadmap

Planned Terraform modules for StackIT:
- [ ] SKE cluster provisioning
- [ ] StackIT Container Registry setup
- [ ] PostgreSQL managed service
- [ ] Secrets Manager integration
- [ ] Network configuration (VPC, subnets)
- [ ] Monitoring and logging setup

## Contributing

If you'd like to contribute StackIT Kubernetes Terraform templates, please:
1. Follow the structure of `deployment/cloud/azure/`
2. Create `main.tf`, `variables.tf`, `outputs.tf`
3. Document German sovereignty features
4. Include compliance notes (GDNG, BSI C5)
5. Submit a pull request

**Note**: StackIT Terraform provider may have different resource names than AWS/Azure/GCP. Consult [StackIT Terraform Provider Documentation](https://registry.terraform.io/providers/stackitcloud/stackit/latest/docs).

## References

- [StackIT Official Website](https://www.stackit.de/)
- [StackIT Documentation](https://docs.stackit.cloud/)
- [StackIT Kubernetes Engine (SKE)](https://www.stackit.de/en/product/kubernetes-engine/)
- [Gaia-X Framework](https://gaia-x.eu/)
- [German GDNG (Health Data Use Act)](https://www.bundesgesundheitsministerium.de/)
- [MVD Cloud Deployment Guide](../README.md)

---

## German Summary / Deutsche Zusammenfassung

**StackIT** ist die souveräne Cloud-Plattform der Schwarz IT für deutsche und europäische Datensouveränität. Ideal für:
- EHDS-konforme Gesundheitsdatenräume
- Gaia-X Dataspaces (Catena-X, Manufacturing-X)
- Öffentliche Verwaltung und KRITIS
- Banken und BaFin-regulierte Institutionen

**Vorteile**: 100% deutsche Infrastruktur, kein US CLOUD Act, native GDNG-Konformität, BSI C5 zertifiziert.
