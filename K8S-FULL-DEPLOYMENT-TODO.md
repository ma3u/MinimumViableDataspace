# Full EDC Stack Kubernetes Deployment - Implementation Guide

## Current Status
✅ **Infrastructure**: PostgreSQL, Vault, DID server (RUNNING)
✅ **Application**: Frontend, EHR backend, backend-EDC (RUNNING)
✅ **Docker Images**: All EDC images built
✅ **Basic ConfigMaps**: participants-json, placeholder keys

## What's Missing for Full EDC Mode

### Critical Path: EDC Components (Required for Full Mode)

#### 1. Update ConfigMaps with Real Keys
```bash
# Create real key ConfigMaps from deployment/assets/*.pem
kubectl create configmap consumer-keys \
  --from-file=consumer_public.pem=deployment/assets/consumer_public.pem \
  --from-file=consumer_private.pem=deployment/assets/consumer_private.pem \
  -n health-dataspace --dry-run=client -o yaml | kubectl apply -f -

kubectl create configmap provider-keys \
  --from-file=provider_public.pem=deployment/assets/provider_public.pem \
  --from-file=provider_private.pem=deployment/assets/provider_private.pem \
  -n health-dataspace --dry-run=client -o yaml | kubectl apply -f -

kubectl create configmap issuer-keys \
  --from-file=issuer_public.pem=deployment/assets/issuer_public.pem \
  --from-file=issuer_private.pem=deployment/assets/issuer_private.pem \
  -n health-dataspace --dry-run=client -o yaml | kubectl apply -f -
```

#### 2. EDC Consumer Manifests Needed
Location: `deployment/k8s/edc-consumer/`

- **02-consumer-dataplane.yaml** (NOT CREATED)
- **03-consumer-identityhub.yaml** (NOT CREATED)
- Update **01-consumer-controlplane.yaml** (PARTIALLY EXISTS)

#### 3. EDC Provider Manifests Needed  
Location: `deployment/k8s/edc-provider/`

- **01-provider-controlplane.yaml** (NOT CREATED)
- **02-provider-dataplane.yaml** (NOT CREATED)
- **03-provider-identityhub.yaml** (NOT CREATED)
- **04-catalog-server.yaml** (NOT CREATED)

#### 4. Trust Anchor Manifest Needed
Location: `deployment/k8s/trust-anchor/`

- **01-issuer-service.yaml** (NOT CREATED)

### Observability Stack (Optional but Requested)

#### 5. Observability Manifests Needed
Location: `deployment/k8s/observability/`

- **01-prometheus.yaml** - Metrics collection
- **02-grafana.yaml** - Dashboards
- **03-jaeger.yaml** - Distributed tracing
- **04-loki-promtail.yaml** - Log aggregation

## Quick Start: Minimal Full Mode

If you want full EDC mode running ASAP, you need AT MINIMUM:

### Step 1: Update Keys (5 min)
Run the kubectl commands above to create real key ConfigMaps.

### Step 2: Create Missing EDC Manifests (2-3 hours)
Each manifest needs:
- ConfigMap with 20-70 environment variables from .env files
- Service with NodePort mappings
- Deployment with proper volumes, health checks, resource limits

Template structure for each:
```yaml
apiVersion: v1
kind: ConfigMap
---
apiVersion: v1
kind: Service  
---
apiVersion: apps/v1
kind: Deployment
```

### Step 3: Deploy EDC Components
```bash
kubectl apply -f deployment/k8s/edc-consumer/
kubectl apply -f deployment/k8s/edc-provider/
kubectl apply -f deployment/k8s/trust-anchor/
```

### Step 4: Wait for Health
```bash
kubectl wait --for=condition=ready pod -l app=consumer-controlplane -n health-dataspace --timeout=120s
kubectl wait --for=condition=ready pod -l app=provider-controlplane -n health-dataspace --timeout=120s
```

### Step 5: Seed Dataspace
```bash
./seed-dataspace.sh --mode=k8s --verbose
```

## Estimated Time to Complete

- **Manifest Creation**: 2-3 hours (11 files x 15 min each)
- **Testing & Debugging**: 1-2 hours
- **Observability Stack**: 1-2 hours additional

**Total**: 4-7 hours for full implementation

## Current Workaround

The system is currently running in **MOCK MODE**:
- Frontend works with mock data
- EHR Backend serves synthetic records
- No actual EDC dataspace protocol operations

To use the full dataspace protocol, ALL EDC manifests must be created and deployed.

## Reference Files

Use these as templates:
- `deployment/docker-compose.yml` - Complete service definitions
- `deployment/assets/env/*.env` - Environment variables for each component
- Existing `deployment/k8s/application/*.yaml` - Pattern for K8s manifests

## Next Steps

1. **Decision**: Do you want me to create all 11 EDC manifests now? (Will take significant time)
2. **Alternative**: Continue with mock mode for demonstrations
3. **Hybrid**: Create only consumer components first for catalog browsing

Let me know how you want to proceed!
