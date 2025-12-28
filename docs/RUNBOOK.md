# Operational Runbook

## Table of Contents
- [Overview](#overview)
- [Day 1: Initial Deployment](#day-1-initial-deployment)
- [Day 2: Operations](#day-2-operations)
- [Monitoring and Alerting](#monitoring-and-alerting)
- [Scaling Procedures](#scaling-procedures)
- [Backup and Restore](#backup-and-restore)
- [Disaster Recovery](#disaster-recovery)
- [Troubleshooting](#troubleshooting)
- [Common Operational Tasks](#common-operational-tasks)
- [On-Call Procedures](#on-call-procedures)

## Overview

This runbook provides operational procedures for managing production MVD deployments. It covers routine operations, incident response, and disaster recovery.

**Audience**: SRE, DevOps, Platform Engineering teams

**Prerequisites**:
- Access to Kubernetes cluster (kubectl configured)
- Access to cloud platform console
- Access to monitoring dashboards
- PagerDuty/Opsgenie access (on-call)

## Day 1: Initial Deployment

### Pre-Deployment Checklist

- [ ] Cloud infrastructure provisioned (see [PRODUCTION-DEPLOYMENT.md](PRODUCTION-DEPLOYMENT.md))
- [ ] PostgreSQL databases created and configured
- [ ] Key Vault/Secrets Manager configured
- [ ] DNS configured (domain pointing to load balancer)
- [ ] TLS certificates provisioned (cert-manager configured)
- [ ] Monitoring stack deployed (Prometheus, Grafana, Jaeger)
- [ ] Backup solution configured (Velero or cloud-native)
- [ ] Alerting configured (PagerDuty integration)
- [ ] Documentation reviewed by team
- [ ] Rollback plan documented

### Deployment Steps

**1. Verify Infrastructure**

```bash
# Verify cluster status
kubectl cluster-info
kubectl get nodes

# Verify namespaces
kubectl get namespaces

# Verify persistent volumes
kubectl get pv
kubectl get pvc --all-namespaces
```

**2. Deploy External Dependencies**

```bash
# Deploy External Secrets Operator
helm install external-secrets external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace

# Deploy cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Deploy NGINX Ingress
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer
```

**3. Deploy MVD Components**

```bash
# Deploy via Terraform
cd deployment/terraform/azure  # or aws/gcp
terraform init
terraform plan -out=deployment.tfplan
terraform apply deployment.tfplan

# OR deploy via Kustomize
kubectl apply -k deployment/k8s/overlays/production
```

**4. Seed the Dataspace**

```bash
# Wait for all pods to be ready
kubectl wait --for=condition=ready pod --all --all-namespaces --timeout=600s

# Run seed script
./seed.sh  # or ./seed-k8s.sh for Kubernetes
```

**5. Verify Deployment**

```bash
# Check all pods are running
kubectl get pods --all-namespaces

# Check services and ingresses
kubectl get svc,ingress --all-namespaces

# Test health endpoints
curl -k https://consumer.mvd.yourdomain.com/api/check/health
curl -k https://provider.mvd.yourdomain.com/api/check/health

# Test DSP protocol
# Use Postman collection: deployment/postman/MVD.postman_collection.json
```

**6. Configure Monitoring**

```bash
# Access Grafana
kubectl port-forward -n monitoring svc/grafana 3000:80

# Import dashboards
# - deployment/observability/grafana/dashboards/01-system-overview.json
# - deployment/observability/grafana/dashboards/02-dsp-protocol.json
# - deployment/observability/grafana/dashboards/03-dcp-credentials.json
```

**7. Post-Deployment Tasks**

- [ ] Document actual resource usage vs. planned
- [ ] Verify backup job runs successfully
- [ ] Test alert notifications
- [ ] Update on-call runbook with deployment-specific details
- [ ] Conduct smoke tests
- [ ] Handoff to operations team

## Day 2: Operations

### Daily Operations

**Morning Checklist** (15 minutes):

```bash
# 1. Check cluster health
kubectl get nodes
kubectl top nodes

# 2. Check pod status
kubectl get pods --all-namespaces | grep -v Running

# 3. Check recent alerts
# Visit Prometheus: kubectl port-forward -n monitoring svc/prometheus 9090:9090

# 4. Review resource usage
kubectl top pods --all-namespaces --sort-by=memory | head -20
kubectl top pods --all-namespaces --sort-by=cpu | head -20

# 5. Check recent errors in logs
kubectl logs -n consumer deployment/consumer-controlplane --since=24h | grep -i error
```

**Weekly Maintenance** (1 hour):

- [ ] Review and acknowledge Prometheus alerts
- [ ] Check certificate expiration dates
- [ ] Review resource utilization trends (Grafana)
- [ ] Check for available updates (base images, dependencies)
- [ ] Review audit logs for suspicious activity
- [ ] Test backup restoration (monthly, rotate weekly drill)
- [ ] Update documentation with any operational changes

**Monthly Tasks**:

- [ ] Rotate secrets (see [SECURITY.md](SECURITY.md))
- [ ] Update base images and dependencies
- [ ] Review and update resource requests/limits
- [ ] Conduct disaster recovery drill
- [ ] Review and optimize costs
- [ ] Update runbooks based on incidents

### Monitoring Dashboards

**Access Grafana**:
```bash
kubectl port-forward -n monitoring svc/grafana 3000:80
# Default credentials: admin / prom-operator
```

**Key Dashboards**:
1. **System Overview** (`01-system-overview.json`): JVM metrics, CPU, memory, GC
2. **DSP Protocol** (`02-dsp-protocol.json`): Catalog, negotiation, transfer metrics
3. **DCP Credentials** (`03-dcp-credentials.json`): Credential issuance, validation, DID resolution

**Key Metrics to Watch**:
- **JVM Heap Usage**: Should be < 80% of max heap
- **HTTP Request Rate**: Baseline traffic patterns
- **HTTP Error Rate**: Should be < 1% of total requests
- **Transfer Success Rate**: Should be > 95%
- **Database Connection Pool**: Should have available connections
- **Pod CPU Throttling**: Should be minimal

## Monitoring and Alerting

### Critical Alerts

| Alert | Severity | Response Time | Action |
|-------|----------|---------------|--------|
| **PodCrashLooping** | P1 | Immediate | Check logs, rollback if necessary |
| **HighMemoryUsage** | P2 | 15 min | Check for memory leaks, scale up |
| **DatabaseDown** | P1 | Immediate | Check database status, failover |
| **HighErrorRate** | P2 | 15 min | Check logs, investigate root cause |
| **CertificateExpiringSoon** | P3 | 1 day | Renew certificate |
| **DiskSpaceLow** | P2 | 30 min | Clean up logs, expand volume |

### Alert Response Procedures

**PodCrashLooping**:
```bash
# 1. Identify crashing pod
kubectl get pods --all-namespaces | grep CrashLoopBackOff

# 2. Check logs
kubectl logs -n <namespace> <pod-name> --previous

# 3. Describe pod for events
kubectl describe pod -n <namespace> <pod-name>

# 4. Check resource constraints
kubectl top pod -n <namespace> <pod-name>

# 5. If configuration issue, rollback
kubectl rollout undo deployment/<deployment-name> -n <namespace>
```

**HighMemoryUsage**:
```bash
# 1. Check current memory usage
kubectl top pods --all-namespaces --sort-by=memory

# 2. Check for memory leaks
kubectl exec -it -n <namespace> <pod-name> -- jmap -heap 1

# 3. Scale up if necessary
kubectl scale deployment/<deployment-name> -n <namespace> --replicas=5

# 4. Increase memory limits if needed
kubectl patch deployment/<deployment-name> -n <namespace> -p '{"spec":{"template":{"spec":{"containers":[{"name":"<container>","resources":{"limits":{"memory":"8Gi"}}}]}}}}'
```

**DatabaseDown**:
```bash
# 1. Check PostgreSQL status
kubectl get pods -n database
# OR check cloud-managed database status

# 2. Test connectivity
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql -h <postgres-host> -U mvdadmin -d consumer_edc -c "SELECT 1;"

# 3. Check for failover
# Azure: az postgres flexible-server show --name mvd-postgres-prod --resource-group $RG
# AWS: aws rds describe-db-instances --db-instance-identifier mvd-postgres-prod

# 4. Restart affected pods
kubectl rollout restart deployment -n consumer
```

## Scaling Procedures

### Horizontal Pod Autoscaling (HPA)

**Configure HPA for Dataplane** (handles variable transfer load):

```bash
# Create HPA
kubectl autoscale deployment consumer-dataplane -n consumer \
  --cpu-percent=70 \
  --min=2 \
  --max=10

# Check HPA status
kubectl get hpa -n consumer

# View HPA details
kubectl describe hpa consumer-dataplane -n consumer
```

**HPA Configuration (YAML)**:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: consumer-dataplane-hpa
  namespace: consumer
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: consumer-dataplane
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Pods
        value: 1
        periodSeconds: 60
```

### Manual Scaling

**Scale Up**:
```bash
# Scale controlplane for increased load
kubectl scale deployment consumer-controlplane -n consumer --replicas=5

# Verify scaling
kubectl get pods -n consumer -w
```

**Scale Down** (during low-traffic periods):
```bash
# Scale down to minimum
kubectl scale deployment consumer-controlplane -n consumer --replicas=2

# Verify
kubectl get pods -n consumer
```

### Cluster Autoscaling

**Azure AKS**:
```bash
# Enable cluster autoscaler
az aks update \
  --resource-group $RESOURCE_GROUP \
  --name $CLUSTER_NAME \
  --enable-cluster-autoscaler \
  --min-count 3 \
  --max-count 10
```

**AWS EKS**:
```bash
# Cluster autoscaler is configured via eksctl or Terraform
# Verify configuration
kubectl get deployment cluster-autoscaler -n kube-system
```

### Database Scaling

**PostgreSQL Read Replicas** (for read-heavy workloads):

**Azure**:
```bash
az postgres flexible-server replica create \
  --resource-group $RESOURCE_GROUP \
  --name mvd-postgres-read-replica \
  --source-server mvd-postgres-prod
```

**AWS**:
```bash
aws rds create-db-instance-read-replica \
  --db-instance-identifier mvd-postgres-read-replica \
  --source-db-instance-identifier mvd-postgres-prod
```

## Backup and Restore

### Backup Strategy

**PostgreSQL Backups** (automated via cloud provider):
- **Frequency**: Daily automated backups
- **Retention**: 30 days
- **Type**: Full backup + continuous archiving (PITR)

**Kubernetes State Backups** (via Velero):
- **Frequency**: Daily
- **Retention**: 14 days
- **Scope**: All namespaces, PVCs, cluster resources

### Velero Setup

**Install Velero**:

```bash
# Azure
velero install \
  --provider azure \
  --plugins velero/velero-plugin-for-microsoft-azure:v1.8.0 \
  --bucket mvd-backups \
  --secret-file ./credentials-velero \
  --backup-location-config resourceGroup=$RESOURCE_GROUP,storageAccount=mvdbackups \
  --snapshot-location-config apiTimeout=5m,resourceGroup=$RESOURCE_GROUP

# AWS
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.8.0 \
  --bucket mvd-backups \
  --secret-file ./credentials-velero \
  --backup-location-config region=eu-west-1 \
  --snapshot-location-config region=eu-west-1
```

**Create Backup Schedule**:

```bash
# Daily backup of all namespaces
velero schedule create daily-backup \
  --schedule="0 2 * * *" \
  --include-namespaces consumer,provider,dataspace-issuer \
  --ttl 336h

# Verify schedule
velero schedule get
```

**Manual Backup**:

```bash
# Create on-demand backup
velero backup create manual-backup-$(date +%Y%m%d-%H%M%S) \
  --include-namespaces consumer,provider,dataspace-issuer

# Check backup status
velero backup describe <backup-name>
```

### Restore Procedures

**Full Cluster Restore**:

```bash
# 1. List available backups
velero backup get

# 2. Restore from backup
velero restore create --from-backup daily-backup-20241228

# 3. Monitor restore progress
velero restore describe <restore-name>
velero restore logs <restore-name>

# 4. Verify pods are running
kubectl get pods --all-namespaces
```

**Selective Restore** (single namespace):

```bash
# Restore only consumer namespace
velero restore create consumer-restore \
  --from-backup daily-backup-20241228 \
  --include-namespaces consumer
```

**Database Point-in-Time Recovery**:

**Azure PostgreSQL**:
```bash
az postgres flexible-server restore \
  --resource-group $RESOURCE_GROUP \
  --name mvd-postgres-restored \
  --source-server mvd-postgres-prod \
  --restore-time "2024-12-28T10:00:00Z"
```

**AWS RDS**:
```bash
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier mvd-postgres-prod \
  --target-db-instance-identifier mvd-postgres-restored \
  --restore-time "2024-12-28T10:00:00Z"
```

## Disaster Recovery

### RTO and RPO Targets

| Service | RTO (Recovery Time) | RPO (Data Loss) |
|---------|---------------------|-----------------|
| Controlplane | 15 minutes | 5 minutes |
| Dataplane | 15 minutes | 0 (stateless) |
| IdentityHub | 30 minutes | 5 minutes |
| PostgreSQL | 30 minutes | 5 minutes |
| Full Stack | 1 hour | 15 minutes |

### DR Scenarios

#### Scenario 1: Single Pod Failure

**Detection**: Pod crash alert, health check failure

**Recovery**:
```bash
# Kubernetes self-healing (automatic restart)
# Verify pod restarted
kubectl get pods -n <namespace> -w

# If stuck, force delete
kubectl delete pod <pod-name> -n <namespace> --grace-period=0 --force
```

**RTO**: < 5 minutes (automatic)

#### Scenario 2: Node Failure

**Detection**: Node NotReady, pod eviction

**Recovery**:
```bash
# Kubernetes reschedules pods automatically
# Monitor pod migration
kubectl get pods -n <namespace> -o wide -w

# If node stuck, cordon and drain
kubectl cordon <node-name>
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data

# Verify all pods rescheduled
kubectl get pods --all-namespaces -o wide | grep <node-name>
```

**RTO**: 5-10 minutes (automatic)

#### Scenario 3: Availability Zone Failure

**Detection**: Multiple nodes down, high latency alerts

**Recovery**:
```bash
# Verify pods spread across zones
kubectl get pods -n consumer -o wide

# If insufficient capacity, scale cluster
# Azure
az aks scale --resource-group $RG --name $CLUSTER --node-count 6

# AWS
eksctl scale nodegroup --cluster=$CLUSTER --name=mvd-workers --nodes=6
```

**RTO**: 10-15 minutes (automatic with multi-AZ)

#### Scenario 4: Database Failure

**Detection**: Database connection errors, high error rate

**Recovery**:
```bash
# 1. Check database status
# Azure
az postgres flexible-server show --name mvd-postgres-prod --resource-group $RG

# AWS
aws rds describe-db-instances --db-instance-identifier mvd-postgres-prod

# 2. Failover to standby (HA enabled)
# Automatic for HA configurations

# 3. If manual restore needed
# Restore from latest backup (see Backup and Restore section)

# 4. Update connection strings if new endpoint
kubectl edit configmap consumer-config -n consumer
kubectl rollout restart deployment -n consumer
```

**RTO**: 15-30 minutes

#### Scenario 5: Complete Region Failure

**Prerequisites**: Multi-region deployment required (not in base MVD)

**Recovery**:
1. Activate DR region cluster (pre-deployed in standby)
2. Restore latest database backup to DR region
3. Update DNS to point to DR region load balancer
4. Verify application functionality
5. Communicate status to stakeholders

**RTO**: 1-4 hours (depending on multi-region readiness)

### DR Drill Procedure

**Quarterly DR Test**:

```bash
# 1. Schedule maintenance window
# 2. Create backup
velero backup create dr-drill-$(date +%Y%m%d)

# 3. Delete namespace
kubectl delete namespace consumer

# 4. Restore from backup
velero restore create dr-drill-restore --from-backup dr-drill-$(date +%Y%m%d)

# 5. Verify restoration
kubectl get pods -n consumer
curl https://consumer.mvd.yourdomain.com/api/check/health

# 6. Document results and lessons learned
```

## Troubleshooting

### Pod Issues

**Pod Stuck in Pending**:
```bash
# Check events
kubectl describe pod <pod-name> -n <namespace>

# Common causes:
# - Insufficient CPU/memory: Scale cluster or reduce requests
# - Unschedulable: Check node taints/tolerations
# - PVC not bound: Check storage provisioner
```

**Pod Stuck in ImagePullBackOff**:
```bash
# Check image name
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{.spec.containers[*].image}'

# Check image pull secrets
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{.spec.imagePullSecrets}'

# Verify image exists
docker manifest inspect ghcr.io/ma3u/controlplane:v1.0.0
```

**Pod OOMKilled**:
```bash
# Check memory limits
kubectl get pod <pod-name> -n <namespace> -o jsonpath='{.spec.containers[*].resources.limits.memory}'

# Increase memory limit
kubectl set resources deployment/<deployment> -n <namespace> --limits=memory=4Gi
```

### Network Issues

**Service Not Accessible**:
```bash
# Check service
kubectl get svc -n <namespace>

# Check endpoints
kubectl get endpoints <service-name> -n <namespace>

# Test from inside cluster
kubectl run -it --rm debug --image=busybox --restart=Never -- \
  wget -O- http://<service-name>.<namespace>.svc.cluster.local:8080/api/check/health
```

**Ingress Not Working**:
```bash
# Check ingress
kubectl get ingress -n <namespace>

# Check ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Test TLS
curl -vk https://consumer.mvd.yourdomain.com/api/check/health
```

**NetworkPolicy Blocking Traffic**:
```bash
# List NetworkPolicies
kubectl get networkpolicies --all-namespaces

# Temporarily disable (for debugging only!)
kubectl delete networkpolicy <policy-name> -n <namespace>

# Re-enable after debugging
kubectl apply -f deployment/k8s/base/network-policies/
```

### Application Issues

**High Latency**:
```bash
# Check database query performance
kubectl exec -it -n <namespace> <pod-name> -- \
  psql -h $DB_HOST -U $DB_USER -d consumer_edc -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check JVM GC activity
kubectl exec -it -n <namespace> <pod-name> -- jstat -gcutil 1 5000

# Check for CPU throttling
kubectl top pod <pod-name> -n <namespace>
```

**Contract Negotiation Failures**:
```bash
# Check logs for DCP credential validation errors
kubectl logs -n consumer deployment/consumer-controlplane | grep -i "credential"

# Verify IdentityHub connectivity
kubectl exec -it -n consumer <pod-name> -- \
  curl http://consumer-identityhub:7083/api/v1/health

# Check issuer DID document accessibility
curl https://issuer.mvd.yourdomain.com/.well-known/did.json
```

## Common Operational Tasks

### Update Container Image

```bash
# 1. Update image tag
kubectl set image deployment/consumer-controlplane \
  controlplane=ghcr.io/ma3u/controlplane:v1.1.0 \
  -n consumer

# 2. Monitor rollout
kubectl rollout status deployment/consumer-controlplane -n consumer

# 3. If issues, rollback
kubectl rollout undo deployment/consumer-controlplane -n consumer
```

### Update Configuration

```bash
# 1. Edit ConfigMap
kubectl edit configmap consumer-config -n consumer

# 2. Restart deployment to pick up changes
kubectl rollout restart deployment/consumer-controlplane -n consumer

# 3. Verify configuration
kubectl exec -it -n consumer <pod-name> -- env | grep EDC_
```

### Rotate Secrets

```bash
# 1. Update secret in Key Vault/Secrets Manager
az keyvault secret set --vault-name mvd-keyvault-prod --name postgres-password --value "$NEW_PASSWORD"

# 2. Trigger External Secrets Operator sync (or wait for refresh interval)
kubectl annotate externalsecret consumer-credentials -n consumer force-sync=$(date +%s)

# 3. Restart affected pods
kubectl rollout restart deployment -n consumer
```

### Add New Participant

```bash
# 1. Generate keys
openssl genpkey -algorithm ed25519 -out participant_private.pem
openssl pkey -in participant_private.pem -pubout -out participant_public.pem

# 2. Store keys in vault
az keyvault secret set --vault-name mvd-keyvault-prod --name participant-private-key --file participant_private.pem

# 3. Deploy connector (use existing Terraform module/Kustomize overlay)
kubectl apply -k deployment/k8s/overlays/production/new-participant

# 4. Create ParticipantContext and seed
# Follow seed script steps
```

### Certificate Renewal

```bash
# cert-manager handles automatic renewal
# Verify certificate status
kubectl get certificate --all-namespaces

# Force renewal if needed
kubectl delete secret <tls-secret-name> -n <namespace>
# cert-manager will recreate
```

## On-Call Procedures

### Shift Handoff

**Outgoing Engineer**:
1. Brief incoming engineer on any ongoing incidents
2. Share status of in-progress changes
3. Highlight any upcoming maintenance
4. Document any workarounds in place

**Incoming Engineer**:
1. Review alert history (past 24h)
2. Check monitoring dashboards
3. Review open incidents
4. Verify access to all systems

### Incident Response

**Severity Levels**:

| Level | Impact | Response Time | Example |
|-------|--------|---------------|---------|
| **P1** | Service down | Immediate | Database failure, cluster down |
| **P2** | Degraded performance | 15 minutes | High error rate, slow responses |
| **P3** | Minor issue | 1 hour | Non-critical feature broken |
| **P4** | Cosmetic | Next business day | Documentation error |

**P1 Incident Response**:

1. **Acknowledge alert** (within 5 minutes)
2. **Assess impact**: Check monitoring, customer reports
3. **Initiate war room**: Slack channel #incident-<timestamp>
4. **Communicate**: Update status page, notify stakeholders
5. **Investigate**: Check logs, metrics, recent changes
6. **Mitigate**: Rollback, scale, failover as needed
7. **Resolve**: Verify service restoration
8. **Post-incident**: Document in runbook, schedule blameless postmortem

### Escalation Paths

| Issue | Primary Contact | Escalation |
|-------|----------------|------------|
| Application (EDC) | On-call SRE | Engineering Lead |
| Infrastructure (K8s) | On-call SRE | Platform Team Lead |
| Database | On-call SRE | Database Admin |
| Security | Security On-call | CISO |
| Network | On-call SRE | Network Team |

## Appendix

### Useful Commands

**Check resource usage**:
```bash
kubectl top nodes
kubectl top pods --all-namespaces --sort-by=memory
kubectl top pods --all-namespaces --sort-by=cpu
```

**Tail logs from multiple pods**:
```bash
kubectl logs -f deployment/consumer-controlplane -n consumer --all-containers=true --max-log-requests=10
```

**Get all events sorted by time**:
```bash
kubectl get events --all-namespaces --sort-by='.lastTimestamp'
```

**Debug DNS**:
```bash
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup consumer-controlplane.consumer.svc.cluster.local
```

**Check certificate expiry**:
```bash
kubectl get certificate --all-namespaces -o json | jq -r '.items[] | "\(.metadata.namespace)/\(.metadata.name): \(.status.notAfter)"'
```

### Contact Information

- **On-Call**: PagerDuty rotation
- **Slack Channels**:
  - #mvd-ops (general operations)
  - #mvd-alerts (alert notifications)
  - #incident-* (active incidents)
- **Documentation**: https://github.com/ma3u/MinimumViableDataspace/tree/main/docs
- **Runbook Repository**: https://github.com/ma3u/MinimumViableDataspace

---

**Last Updated**: 2024-12-28  
**Version**: 1.0.0  
**Maintained By**: Platform Engineering Team
