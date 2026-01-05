# Kubernetes Deployment for Health Dataspace Demo

This directory contains Kubernetes manifests for deploying the EHDS-compliant Health Dataspace Demo on OrbStack with KinD (Kubernetes in Docker).

## Directory Structure

```
k8s/
├── 00-namespace.yaml          # health-dataspace namespace
├── infrastructure/            # Infrastructure layer
│   ├── 01-postgresql.yaml    # PostgreSQL StatefulSet with init SQL
│   ├── 02-vault.yaml         # HashiCorp Vault (dev mode)
│   └── 03-did-server.yaml    # NGINX DID document server
├── edc-consumer/             # Consumer EDC components (TODO)
├── edc-provider/             # Provider EDC components (TODO)
├── trust-anchor/             # Issuer service (TODO)
└── application/              # Application layer (TODO)
```

## Quick Start

### Prerequisites

- **OrbStack** installed and running
- **KinD** installed: `brew install kind`
- **kubectl** installed: `brew install kubectl`
- Docker images built (or use `--skip-build`)

### Deployment

Use the deployment script from the project root:

```bash
# Full deployment (complete EDC stack)
./start-health-demo-kind.sh --mode full

# Mock mode (application only, no EDC)
./start-health-demo-kind.sh --mode mock

# Hybrid mode (EDC catalog + mock data)
./start-health-demo-kind.sh --mode hybrid

# Clean install (delete existing cluster)
./start-health-demo-kind.sh --cleanup

# Skip Gradle build (reuse existing JARs)
./start-health-demo-kind.sh --skip-build
```

### Manual Deployment

If you prefer to deploy manually:

```bash
# 1. Create KinD cluster
kind create cluster --config ../kind.config.yaml --wait 2m

# 2. Build Docker images (from project root)
docker build -t health-ehr-backend:latest ./backend-mock
docker build -t health-frontend:latest ./frontend
# ... (build other images as needed)

# 3. Load images into KinD
kind load docker-image health-ehr-backend:latest --name health-dataspace
kind load docker-image health-frontend:latest --name health-dataspace
# ... (load other images)

# 4. Apply manifests
kubectl apply -f 00-namespace.yaml
kubectl apply -f infrastructure/

# 5. Wait for infrastructure to be ready
kubectl wait --for=condition=ready pod -l app=health-postgres -n health-dataspace --timeout=120s
kubectl wait --for=condition=ready pod -l app=health-vault -n health-dataspace --timeout=60s
```

## Port Mappings

KinD cluster exposes services via NodePort, mapped to localhost:

| Component | Service Port | NodePort | Host Port | Description |
|-----------|-------------|----------|-----------|-------------|
| Frontend | 80 | 30000 | 3000 | React catalog browser |
| EHR Backend | 3001 | 30001 | 3001 | FHIR R4 backend |
| Backend-EDC | 3002 | 30002 | 3002 | EDC proxy service |
| Consumer CP (Mgmt) | 8081 | 30081 | 8081 | Consumer management API |
| Consumer CP (DSP) | 8082 | 30082 | 8082 | Dataspace protocol |
| Provider CP (Mgmt) | 8191 | 30191 | 8191 | Provider management API |
| Provider CP (DSP) | 8192 | 30192 | 8192 | Dataspace protocol |
| Consumer IdHub | 7082 | 30702 | 7082 | Identity API |
| Provider IdHub | 7092 | 30712 | 7092 | Identity API |
| Vault | 8200 | 30200 | 8200 | HashiCorp Vault |
| PostgreSQL | 5432 | 30432 | 5432 | Database (optional external) |

## Infrastructure Components

### PostgreSQL (01-postgresql.yaml)

- **Type**: StatefulSet
- **Purpose**: Persistent storage for EDC components
- **Databases**:
  - `consumer` - Consumer EDC data
  - `provider_qna` - Provider EHR connector data
  - `provider_manufacturing` - Provider trials connector (optional)
  - `identity` - Identity Hub data
  - `catalog_server` - Federated catalog data
  - `issuer` - Trust anchor data with membership attestations
- **Init SQL**: Automatically creates databases, users, and seeds attestations
- **Storage**: 5Gi persistent volume

### HashiCorp Vault (02-vault.yaml)

- **Type**: Deployment
- **Purpose**: Secrets management for private keys
- **Mode**: Development (dev root token: `root`)
- **Access**: http://localhost:8200
- **Security**: IPC_LOCK capability added

### DID Server (03-did-server.yaml)

- **Type**: Deployment (NGINX)
- **Purpose**: Hosts DID documents for did:web resolution
- **Endpoint**: `/.well-known/did.json`
- **Config**: NGINX configuration via ConfigMap

## Health Checks

All infrastructure components include readiness and liveness probes:

- **PostgreSQL**: `pg_isready` command
- **Vault**: HTTP GET `/v1/sys/health`
- **DID Server**: HTTP GET `/.well-known/did.json`

## Namespace

All components deploy to the `health-dataspace` namespace with labels:
- `name: health-dataspace`
- `purpose: ehds-dataspace-demo`

## Useful Commands

```bash
# View all pods
kubectl get pods -n health-dataspace

# View pod logs
kubectl logs -f <pod-name> -n health-dataspace

# Describe a pod
kubectl describe pod <pod-name> -n health-dataspace

# Port-forward to a service
kubectl port-forward -n health-dataspace svc/health-postgres 5432:5432

# Delete the cluster
kind delete cluster --name health-dataspace

# View cluster info
kubectl cluster-info --context kind-health-dataspace
```

## Development Status

**Completed**:
- ✅ Namespace configuration
- ✅ Infrastructure layer (PostgreSQL, Vault, DID server)
- ✅ KinD cluster configuration with port mappings
- ✅ Deployment script framework

**TODO**:
- ⏳ EDC Consumer manifests (control plane, data plane, identity hub)
- ⏳ EDC Provider manifests (control plane, data plane, identity hub, catalog)
- ⏳ Trust Anchor manifests (issuer service)
- ⏳ Application layer manifests (frontend, backends)
- ⏳ Seeding script integration for k8s mode
- ⏳ Complete deployment script
- ⏳ End-to-end testing
- ⏳ Documentation updates

## Benefits of KinD/OrbStack Deployment

1. **Native macOS Performance**: OrbStack is faster and more efficient than Docker Desktop
2. **Kubernetes-Native**: Production-like deployment environment
3. **Isolated**: Can run alongside Docker Compose without port conflicts
4. **Persistent Storage**: StatefulSets with persistent volumes
5. **Health Checks**: Proper readiness/liveness probes
6. **Scalable**: Easy to add replicas or resources
7. **Development-Friendly**: Quick iteration with `kind load docker-image`

## Related Files

- `../kind.config.yaml` - KinD cluster configuration
- `../../start-health-demo-kind.sh` - Deployment script
- `../../seed-dataspace.sh` - Dataspace seeding script
- `../docker-compose.yml` - Original Docker Compose reference

## References

- [OrbStack](https://orbstack.dev)
- [KinD Documentation](https://kind.sigs.k8s.io)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Health Dataspace Demo - User Manual](../../docs/USER-MANUAL.md)
- [Health Dataspace Demo - Developer Manual](../../docs/DEVELOPER-MANUAL.md)
