# OVH Public Cloud Kubernetes Deployment for MVD

**Status**: Terraform templates for OVH Public Cloud Kubernetes deployment are planned for a future phase.

## Overview

This directory will contain Terraform configurations for deploying Minimum Viable Dataspace to OVH Managed Kubernetes Service, the European sovereign cloud platform.

## Planned Architecture

```
┌────────────────────────────────────────────────────────────┐
│           OVH Public Cloud Project (EU)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  OVH Managed Kubernetes                              │  │
│  │  - European sovereign infrastructure                 │  │
│  │  - Kubernetes 1.28+                                  │  │
│  │  - 3-5 node cluster                                  │  │
│  │  - MVD components in 'mvd' namespace                │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  OVH Container Registry (Harbor-based)               │  │
│  │  - controlplane, dataplane, identity-hub, etc.       │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  OVH Databases for PostgreSQL                        │  │
│  │  - PostgreSQL 15                                     │  │
│  │  - High availability option                          │  │
│  │  - 6 databases for MVD components                    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  OVH Key Management Service                          │  │
│  │  - EDC runtime secrets                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  OVH Logs Data Platform                              │  │
│  │  - Log aggregation (Graylog-based)                   │  │
│  │  - Metrics collection                                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## Why OVH Public Cloud?

### European Data Sovereignty
**OVH** is Europe's largest sovereign cloud provider with strong GDPR and data residency guarantees:

- ✅ **European company** - French-owned, no US ownership
- ✅ **EU data centers** - France, Germany, Poland, UK
- ✅ **GDPR compliant by design** - European legal framework
- ✅ **Cost-effective** - 20-30% cheaper than US hyperscalers
- ✅ **No US CLOUD Act** - No extraterritorial access concerns
- ✅ **SecNumCloud qualified** - French cybersecurity certification
- ✅ **ISO 27001, HDS certified** - Healthcare data approved (France)

### When to Use OVH

Choose OVH if:
- ✅ European data sovereignty with cost optimization
- ✅ Need SecNumCloud or HDS (French health data) compliance
- ✅ Multi-region EU deployment (France, Germany, Poland)
- ✅ Prefer European legal framework without US ties
- ✅ SME/startup with budget constraints

### Comparison with Other Clouds

| Feature | OVH | StackIT | Azure (EU) | AWS (EU) |
|---------|-----|---------|------------|----------|
| **European Ownership** | ✅ French | ✅ German | ❌ US | ❌ US |
| **US CLOUD Act Exposure** | ❌ None | ❌ None | ⚠️ Yes | ⚠️ Yes |
| **GDPR Native** | ✅ Yes | ✅ Yes | ⚠️ Adapted | ⚠️ Adapted |
| **Cost (3-node cluster)** | ~€120-180/month | ~€180-250/month | ~€150-200/month | ~€200-300/month |
| **Data Centers** | FR, DE, PL, UK | DE only | 10+ EU regions | 6+ EU regions |

**Key Advantage**: OVH offers **best price/performance** for European sovereign cloud while maintaining strong compliance.

## Recommended Configuration

### Region
- **Primary**: GRA (Gravelines, France) - OVH's largest data center
- **Alternative**: 
  - DE (Frankfurt, Germany) - German data residency
  - BHS (Beauharnois, Canada) - Non-EU option
  - WAW (Warsaw, Poland) - Eastern EU
  - UK (London, UK) - Post-Brexit option

### OVH Managed Kubernetes
- **Kubernetes Version**: 1.28+
- **Node Count**: 3-5 nodes
- **Node Flavor**:
  - Staging: B2-15 (4 vCPU, 15 GB RAM)
  - Production: B2-30 (8 vCPU, 30 GB RAM)
- **Network**: Private network (vRack) with load balancer

### PostgreSQL
- **Engine**: PostgreSQL 15
- **Plan**:
  - Staging: Essential (2 vCPU, 4 GB RAM)
  - Production: Business (4 vCPU, 15 GB RAM, HA)
- **Storage**: 80 GB SSD, encrypted

### Cost Estimate
- **Staging**: ~€120-180/month (cheapest EU sovereign option)
- **Production**: ~€400-600/month (with HA)

**Note**: OVH is typically 20-30% cheaper than AWS/Azure/GCP for equivalent configurations.

## Quick Start (Manual for Now)

Until Terraform templates are available, you can manually deploy:

### Prerequisites

1. **OVH Account**
   - Sign up at [ovhcloud.com](https://www.ovhcloud.com/)
   - Create Public Cloud project
   - Generate OpenStack credentials

2. **OVH CLI**
   ```bash
   # Install OVH CLI
   pip install python-openstackclient
   pip install python-octaviaclient  # For load balancers
   ```

3. **kubectl**
   ```bash
   brew install kubectl
   ```

### Manual Deployment Steps

1. **Create OVH Managed Kubernetes Cluster**
   ```bash
   # Via OVH Control Panel or API
   # Region: GRA (Gravelines) or DE (Frankfurt)
   # Nodes: 3x B2-15 (staging) or 3x B2-30 (production)
   ```

2. **Create Container Registry**
   ```bash
   # OVH provides Harbor-based registry
   # Create via OVH Control Panel
   # Get registry credentials
   ```

3. **Create PostgreSQL Databases**
   ```bash
   # Create OVH Database service for PostgreSQL
   # Essential plan (staging) or Business plan (production)
   # Create 6 databases: consumer, provider_qna, provider_manufacturing, 
   #   consumer_identityhub, provider_identityhub, issuer
   ```

4. **Build and Push Images**
   ```bash
   # Build MVD images
   cd /path/to/MinimumViableDataspace
   ./gradlew -Ppersistence=true build
   ./gradlew -Ppersistence=true dockerize
   
   # Login to OVH registry
   docker login <ovh-registry-url>
   
   # Tag and push images
   docker tag controlplane:latest <ovh-registry-url>/mvd/controlplane:latest
   docker push <ovh-registry-url>/mvd/controlplane:latest
   # Repeat for dataplane, identity-hub, catalog-server, issuerservice
   ```

5. **Configure kubectl**
   ```bash
   # Download kubeconfig from OVH Control Panel
   export KUBECONFIG=/path/to/ovh-kubeconfig.yaml
   kubectl get nodes
   ```

6. **Deploy MVD**
   - Adapt existing `deployment/*.tf` Kubernetes manifests
   - Update image references to OVH registry
   - Update PostgreSQL connection strings
   - Apply with `kubectl apply`

## European Sovereignty Advantages

### Legal Framework
- **French/EU jurisdiction** - No US CLOUD Act
- **GDPR Art. 44-50** - No third-country transfer concerns
- **SecNumCloud qualification** - French state cloud security standard
- **HDS certification** - French health data hosting approved
- **ISO 27001, 27017, 27018** - International standards

### Cost Optimization
- **No US hyperscaler premium** - 20-30% cost savings
- **Transparent pricing** - No hidden egress fees
- **Flat-rate bandwidth** - Predictable costs
- **Pay-as-you-go** - No long-term commitments required

### Operational Benefits
- **Multi-region EU** - France, Germany, Poland, UK
- **vRack private network** - Free inter-DC bandwidth
- **Anti-DDoS included** - No additional cost
- **24/7 European support** - English, French, German

### Use Cases Ideal for OVH

1. **Cost-Sensitive European Deployments**
   - Startups and SMEs with budget constraints
   - Proof-of-concept and staging environments
   - Non-critical production workloads

2. **French Public Sector / Health**
   - SecNumCloud required deployments
   - HDS health data hosting (France)
   - French government agencies

3. **European Dataspaces**
   - Gaia-X compliant architectures
   - Cross-border EU data sharing
   - Research collaborations (Horizon Europe)

4. **Multi-Region EU Strategy**
   - France primary, Germany secondary
   - Geographic redundancy within EU
   - Latency optimization for European users

## Terraform Development Roadmap

Planned Terraform modules for OVH:
- [ ] OVH Managed Kubernetes cluster
- [ ] OVH Container Registry setup
- [ ] OVH Databases for PostgreSQL
- [ ] vRack private network configuration
- [ ] Load Balancer (Octavia)
- [ ] OVH KMS for secrets
- [ ] Logs Data Platform integration

## OVH Terraform Provider

OVH provides official Terraform provider:
```hcl
terraform {
  required_providers {
    ovh = {
      source  = "ovh/ovh"
      version = "~> 0.35"
    }
  }
}

provider "ovh" {
  endpoint           = "ovh-eu"
  application_key    = var.ovh_application_key
  application_secret = var.ovh_application_secret
  consumer_key       = var.ovh_consumer_key
}
```

## Contributing

If you'd like to contribute OVH Public Cloud Terraform templates, please:
1. Follow the structure of `deployment/cloud/azure/`
2. Create `main.tf`, `variables.tf`, `outputs.tf`
3. Use OVH Terraform provider
4. Document cost optimization strategies
5. Include compliance notes (SecNumCloud, HDS, GDPR)
6. Submit a pull request

## References

- [OVH Public Cloud](https://www.ovhcloud.com/en/public-cloud/)
- [OVH Managed Kubernetes](https://www.ovhcloud.com/en/public-cloud/kubernetes/)
- [OVH Terraform Provider](https://registry.terraform.io/providers/ovh/ovh/latest/docs)
- [SecNumCloud Qualification](https://www.ssi.gouv.fr/entreprise/qualification/prestataires-de-service-de-confiance-qualifies/prestataires-de-service-dinformatique-en-nuage-secnumcloud/)
- [OVH Documentation](https://docs.ovh.com/gb/en/)
- [MVD Cloud Deployment Guide](../README.md)

---

## French Summary / Résumé Français

**OVH Public Cloud** est le plus grand fournisseur de cloud souverain européen. Idéal pour :
- Déploiements nécessitant la souveraineté européenne avec optimisation des coûts
- Secteur public français (SecNumCloud)
- Données de santé françaises (HDS)
- PME et startups avec contraintes budgétaires

**Avantages** : Propriété française, absence de US CLOUD Act, 20-30% moins cher qu'AWS/Azure/GCP, certifications SecNumCloud et HDS.
