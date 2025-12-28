# Kubernetes Manifests

Production-ready Kubernetes manifests for deploying MVD with security hardening and environment-specific overlays using Kustomize.

## Directory Structure

```
k8s/
├── base/                           # Base Kubernetes manifests
│   ├── controlplane/               # Controlplane deployment
│   │   └── consumer-controlplane.yaml
│   ├── dataplane/                  # Dataplane deployment with HPA
│   │   └── consumer-dataplane.yaml
│   ├── rbac/                       # RBAC configurations
│   │   └── consumer-controlplane-rbac.yaml
│   ├── network-policies/           # NetworkPolicies (deny-all default)
│   │   └── consumer-network-policies.yaml
│   ├── namespaces.yaml             # Namespace definitions with Pod Security Standards
│   └── kustomization.yaml          # Base kustomization
├── overlays/                       # Environment-specific overlays
│   ├── dev/                        # Development (1 replica, reduced resources)
│   │   └── kustomization.yaml
│   ├── staging/                    # Staging (moderate resources)
│   │   └── kustomization.yaml
│   └── production/                 # Production (HA, full resources)
│       ├── kustomization.yaml
│       ├── ingress.yaml            # Production ingress with TLS
│       └── pod-disruption-budget.yaml
└── README.md                       # This file
```

## Features

### Security Hardening

- **Pod Security Standards**: Restricted mode enforced on all namespaces
- **Non-root containers**: All containers run as UID 10001
- **Read-only root filesystem**: Writable directories mounted as emptyDir
- **Dropped capabilities**: All Linux capabilities dropped
- **Resource limits**: CPU and memory limits enforced
- **NetworkPolicies**: Deny-all default with explicit allow rules
- **RBAC**: Least-privilege service accounts with restricted access

### High Availability

- **Multi-replica deployments**: 3+ replicas for controlplane in production
- **Pod anti-affinity**: Spread pods across nodes/zones
- **Horizontal Pod Autoscaler**: Auto-scaling for dataplane (2-10 replicas)
- **Pod Disruption Budgets**: Ensure minimum availability during disruptions
- **Rolling updates**: Zero-downtime deployments

### Observability

- **Prometheus metrics**: Exposed on port 9090
- **Health probes**: Liveness, readiness, and startup probes
- **Resource monitoring**: CPU/memory requests and limits
- **Distributed tracing**: Jaeger integration (via sidecar or environment)

## Deployment

### Prerequisites

1. **Kubernetes cluster** (1.28+)
2. **kubectl** configured to access cluster
3. **Kustomize** (included in kubectl 1.14+)
4. **External Secrets Operator** (for secrets management)
5. **cert-manager** (for TLS certificates)
6. **NGINX Ingress Controller** (for ingress)

### Deploy Development Environment

```bash
# Apply development overlay
kubectl apply -k deployment/k8s/overlays/dev

# Verify deployment
kubectl get pods -n consumer-dev
kubectl get hpa -n consumer-dev
```

### Deploy Production Environment

```bash
# Apply production overlay
kubectl apply -k deployment/k8s/overlays/production

# Verify deployment
kubectl get pods -n consumer
kubectl get ingress -n consumer
kubectl get pdb -n consumer

# Check TLS certificate
kubectl get certificate -n consumer
```

### View Generated Manifests (Dry Run)

```bash
# Preview what will be deployed (dev)
kubectl kustomize deployment/k8s/overlays/dev

# Preview production deployment
kubectl kustomize deployment/k8s/overlays/production
```

## Configuration

### Secrets Management

Secrets are managed via **External Secrets Operator** (ESO). The manifests reference secrets that ESO syncs from cloud key vaults:

**Required Secrets**:
- `consumer-postgres-credentials`: PostgreSQL connection details
  - `jdbc-url`: JDBC connection string
  - `username`: Database username
  - `password`: Database password
- `consumer-credentials`: EDC vault credentials
  - `vault-client-id`: Vault client ID
  - `vault-client-secret`: Vault client secret
- `consumer-keys`: EDC private keys
  - `private-key`: PEM-encoded private key

**Example ExternalSecret**:
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: consumer-postgres-credentials
  namespace: consumer
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: azure-backend
    kind: SecretStore
  target:
    name: consumer-postgres-credentials
    creationPolicy: Owner
  data:
    - secretKey: jdbc-url
      remoteRef:
        key: consumer-postgres-url
    - secretKey: username
      remoteRef:
        key: consumer-postgres-username
    - secretKey: password
      remoteRef:
        key: consumer-postgres-password
```

### ConfigMap Overrides

Override configuration per environment using `configMapGenerator` in kustomization.yaml:

```yaml
configMapGenerator:
  - name: consumer-controlplane-config
    behavior: merge
    literals:
      - EDC_LOG_LEVEL=DEBUG
      - CUSTOM_SETTING=value
```

### Image Tags

Override image tags per environment:

```yaml
images:
  - name: ghcr.io/ma3u/controlplane
    newTag: v1.2.3  # Use specific version for production
```

## Customization

### Add New Component

1. Create deployment YAML in `base/<component>/`
2. Create RBAC YAML in `base/rbac/`
3. Add NetworkPolicy rules in `base/network-policies/`
4. Reference in `base/kustomization.yaml`
5. Override in overlays as needed

### Add New Environment

1. Create directory `overlays/<environment>/`
2. Create `kustomization.yaml` referencing base
3. Add patches for environment-specific config
4. Deploy with `kubectl apply -k overlays/<environment>/`

### Modify Resource Limits

Use strategic merge patches in overlays:

```yaml
patches:
  - target:
      kind: Deployment
      name: consumer-controlplane
    patch: |-
      - op: replace
        path: /spec/template/spec/containers/0/resources/limits/memory
        value: 8Gi
```

## Verification

### Check Pod Status

```bash
# All pods running
kubectl get pods -n consumer

# Pod details
kubectl describe pod <pod-name> -n consumer

# Logs
kubectl logs -n consumer deployment/consumer-controlplane -f
```

### Check Security

```bash
# Verify Pod Security Standards
kubectl get ns consumer -o yaml | grep pod-security

# Check running user
kubectl exec -it -n consumer <pod-name> -- id

# Verify read-only filesystem
kubectl exec -it -n consumer <pod-name> -- touch /test
# Should fail with "Read-only file system"
```

### Check Networking

```bash
# Test internal connectivity
kubectl exec -it -n consumer <controlplane-pod> -- \
  curl http://consumer-dataplane:8081/api/check/health

# Check NetworkPolicies
kubectl get networkpolicies -n consumer

# Describe NetworkPolicy
kubectl describe networkpolicy deny-all -n consumer
```

### Check Autoscaling

```bash
# HPA status
kubectl get hpa -n consumer

# HPA metrics
kubectl describe hpa consumer-dataplane-hpa -n consumer

# Manually scale
kubectl scale deployment consumer-dataplane -n consumer --replicas=5
```

## Troubleshooting

### Pods Not Starting

```bash
# Check events
kubectl get events -n consumer --sort-by='.lastTimestamp'

# Describe pod
kubectl describe pod <pod-name> -n consumer

# Check logs
kubectl logs <pod-name> -n consumer --previous
```

### NetworkPolicy Issues

```bash
# Temporarily delete NetworkPolicy to test
kubectl delete networkpolicy deny-all -n consumer

# Re-apply after testing
kubectl apply -k deployment/k8s/overlays/<environment>/
```

### Secret Not Found

```bash
# Check ExternalSecret status
kubectl get externalsecret -n consumer

# Describe ExternalSecret
kubectl describe externalsecret consumer-credentials -n consumer

# Check if secret was created
kubectl get secret consumer-credentials -n consumer
```

## References

- [Kustomize Documentation](https://kustomize.io/)
- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/pod-security-standards/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [External Secrets Operator](https://external-secrets.io/)
- [cert-manager](https://cert-manager.io/)
- [MVD Production Deployment Guide](../../docs/PRODUCTION-DEPLOYMENT.md)
- [MVD Security Guide](../../docs/SECURITY.md)
- [MVD Operational Runbook](../../docs/RUNBOOK.md)

---

**Last Updated**: 2024-12-28  
**Version**: 1.0.0
