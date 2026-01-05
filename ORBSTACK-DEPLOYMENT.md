# OrbStack Kubernetes Deployment - Health Dataspace Demo

## ✅ Deployment Status: SUCCESS

The Health Dataspace Demo has been successfully deployed to OrbStack's native Kubernetes cluster.

## Deployed Services

| Service | Status | Internal Port | Access URL |
|---------|--------|---------------|------------|
| Health Frontend | ✅ Running | 80 | http://localhost:3000 |
| EHR Backend | ✅ Running | 3001 | http://localhost:3001 |
| Backend-EDC | ✅ Running | 3002 | http://localhost:3002 |
| HealthDCAT-AP Editor | ✅ Running | 8080 | http://localhost:8880 |

## Architecture

### Deployment Type
- **Platform**: OrbStack native Kubernetes (not KinD)
- **Namespace**: `health-dataspace`
- **Service Type**: NodePort with kubectl port-forward
- **Image Pull Policy**: Never (local images)

### Why OrbStack Native Instead of KinD?

OrbStack's native Kubernetes was already running and using the ports that KinD would need. Rather than create conflicts, we deployed directly to OrbStack's Kubernetes, which provides:

- ✅ Better integration with macOS
- ✅ Faster performance
- ✅ Lower resource usage
- ✅ No port mapping conflicts
- ✅ Native Docker integration

## Accessing the Services

### Via Port Forwarding (Currently Active)

Port forwarding is currently established in the background:

```bash
# Frontend
http://localhost:3000

# EHR Backend API
http://localhost:3001

# EHR Backend Health Check
curl http://localhost:3001/health

# HealthDCAT-AP Editor
http://localhost:8880
```

### Re-establishing Port Forwarding

If port forwarding stops, re-establish it with:

```bash
kubectl port-forward -n health-dataspace svc/health-frontend 3000:80 &
kubectl port-forward -n health-dataspace svc/ehr-backend 3001:3001 &
kubectl port-forward -n health-dataspace svc/healthdcatap-editor 8880:8080 &
```

### Via Direct NodePort Access

Alternatively, access services via NodePort:

```bash
# Get the node IP
kubectl get nodes -o wide

# Access services (replace NODE_IP with actual IP)
http://NODE_IP:30000  # Frontend
http://NODE_IP:30001  # EHR Backend
http://NODE_IP:30880  # HealthDCAT-AP Editor
```

## Management Commands

### View All Resources

```bash
kubectl get all -n health-dataspace
```

### View Pod Status

```bash
kubectl get pods -n health-dataspace
```

### View Pod Logs

```bash
# Frontend logs
kubectl logs -f deployment/health-frontend -n health-dataspace

# EHR Backend logs
kubectl logs -f deployment/ehr-backend -n health-dataspace

# Backend-EDC logs
kubectl logs -f deployment/backend-edc -n health-dataspace
```

### Restart a Deployment

```bash
kubectl rollout restart deployment/health-frontend -n health-dataspace
kubectl rollout restart deployment/ehr-backend -n health-dataspace
kubectl rollout restart deployment/backend-edc -n health-dataspace
```

### Scale a Deployment

```bash
kubectl scale deployment/health-frontend --replicas=2 -n health-dataspace
```

### Delete All Resources

```bash
kubectl delete namespace health-dataspace
```

## Deployed Components

### 1. Health Frontend (React)
- **Image**: `health-frontend:latest`
- **Replicas**: 1
- **Resources**: Default
- **Health Checks**: HTTP GET / on port 80

### 2. EHR Backend (Node.js/Express)
- **Image**: `health-ehr-backend:latest`
- **Replicas**: 1
- **Environment**: Mock data mode
- **Health Checks**: HTTP GET /health on port 3001
- **Records**: 21 synthetic EHR records

### 3. Backend-EDC (Node.js/Express Proxy)
- **Image**: `backend-edc:latest`
- **Replicas**: 1
- **Purpose**: EDC connector proxy (currently in mock mode)
- **Configuration**: Via ConfigMap

### 4. HealthDCAT-AP Editor (SHACL Validator)
- **Image**: `isaitb/shacl-validator:latest` (public)
- **Replicas**: 1
- **Purpose**: DCAT-AP for Health metadata validation

## Current Limitations

### What's Working
- ✅ Frontend catalog browser
- ✅ EHR Backend with 21 mock records
- ✅ HealthDCAT-AP metadata editor
- ✅ Basic health checks

### What's Not Deployed (Mock Mode)
- ⏸️ EDC Consumer/Provider connectors
- ⏸️ PostgreSQL database
- ⏸️ HashiCorp Vault
- ⏸️ Identity Hubs
- ⏸️ Issuer Service

These components are not needed for mock mode but can be deployed by applying:
```bash
kubectl apply -f deployment/k8s/infrastructure/
```

## Docker Cleanup

All Docker Compose services were confirmed stopped before deployment:

```bash
# No health-related Docker Compose services running
docker-compose -f docker-compose.health.yml -f docker-compose.edc.yml ps
# Result: Empty (all clean)
```

## Troubleshooting

### Port Already in Use

If port forwarding fails:

```bash
# Kill existing port forwards
pkill -f "kubectl port-forward"

# Re-establish
kubectl port-forward -n health-dataspace svc/health-frontend 3000:80 &
```

### Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n health-dataspace

# Check logs
kubectl logs <pod-name> -n health-dataspace
```

### Image Pull Errors

All images should be local with `imagePullPolicy: Never`. If you see pull errors:

```bash
# Rebuild the image
cd /path/to/app
docker build -t <image-name>:latest .

# Restart the deployment
kubectl rollout restart deployment/<deployment-name> -n health-dataspace
```

## Next Steps

### To Enable Full Mode

1. Apply infrastructure manifests:
   ```bash
   kubectl apply -f deployment/k8s/infrastructure/
   ```

2. Build and apply EDC manifests (when complete):
   ```bash
   kubectl apply -f deployment/k8s/edc-consumer/
   kubectl apply -f deployment/k8s/edc-provider/
   kubectl apply -f deployment/k8s/trust-anchor/
   ```

3. Run seeding script (when k8s mode is implemented):
   ```bash
   ./seed-dataspace.sh --mode=k8s
   ```

## Deployment Timestamp

**Deployed**: 2026-01-05 14:56 UTC
**Platform**: OrbStack Kubernetes on macOS
**Context**: orbstack
**Namespace**: health-dataspace
**Mode**: Mock (application layer only)
