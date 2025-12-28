# Security Hardening Guide

## Table of Contents
- [Overview](#overview)
- [Threat Model](#threat-model)
- [Security Architecture](#security-architecture)
- [Kubernetes Security](#kubernetes-security)
- [Network Security](#network-security)
- [Application Security](#application-security)
- [Secrets Management](#secrets-management)
- [Identity and Access](#identity-and-access)
- [Compliance](#compliance)
- [Security Monitoring](#security-monitoring)
- [Incident Response](#incident-response)

## Overview

This document provides comprehensive security hardening guidelines for production deployments of MinimumViableDataspace (MVD). It covers infrastructure, application, and operational security controls.

**Security Principles**:
- 🔒 Defense in Depth (multiple security layers)
- 🔐 Least Privilege (minimal necessary access)
- 🔑 Zero Trust (verify everything)
- 📊 Continuous Monitoring (detect and respond)
- 🛡️ Secure by Default (safe configurations)

## Threat Model

### Attack Surfaces

| Component | Attack Vector | Risk | Mitigation |
|-----------|--------------|------|------------|
| **Ingress/API** | DDoS, injection, authentication bypass | HIGH | Rate limiting, WAF, TLS, OAuth2 |
| **Inter-service** | MITM, lateral movement | MEDIUM | mTLS, NetworkPolicies, service mesh |
| **Data Storage** | Data breach, unauthorized access | CRITICAL | Encryption at rest/transit, RBAC |
| **Secrets** | Credential theft, key exposure | CRITICAL | External vault, rotation, HSM |
| **Container Images** | Malicious code, vulnerabilities | HIGH | Scanning, signing, verified registries |
| **Supply Chain** | Compromised dependencies | MEDIUM | SBOM, vulnerability scanning, pinned versions |

### Threat Actors

1. **External Attackers**: Network-based attacks, credential theft
2. **Malicious Insiders**: Unauthorized access, data exfiltration
3. **Compromised Dependencies**: Supply chain attacks
4. **Accidental Exposure**: Misconfiguration, human error

## Security Architecture

### Defense-in-Depth Layers

```
┌─────────────────────────────────────────────────────────┐
│ Layer 7: Compliance & Audit                             │
│ - GDPR compliance | Audit logging | Data governance     │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 6: Application Security                           │
│ - Input validation | OAuth2/OIDC | Rate limiting        │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 5: Container Security                             │
│ - Non-root | Read-only FS | Vulnerability scanning      │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Pod Security                                    │
│ - Pod Security Standards | Security contexts            │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Network Security                               │
│ - NetworkPolicies | mTLS | Ingress filtering            │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Infrastructure Security                        │
│ - RBAC | Encryption | Secrets management                │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Cloud Platform Security                        │
│ - IAM | Security groups | Cloud KMS | Monitoring        │
└─────────────────────────────────────────────────────────┘
```

## Kubernetes Security

### Pod Security Standards

Apply **Restricted** Pod Security Standard to all namespaces:

```yaml
# deployment/k8s/base/pod-security.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: consumer
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### Security Contexts

**Deployment Security Context Template**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: consumer-controlplane
spec:
  template:
    spec:
      # Pod-level security
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      
      containers:
      - name: controlplane
        image: ghcr.io/ma3u/controlplane:v1.0.0
        
        # Container-level security
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          runAsUser: 10001
          capabilities:
            drop:
            - ALL
        
        # Resource limits (prevent DoS)
        resources:
          requests:
            cpu: 1000m
            memory: 2Gi
          limits:
            cpu: 2000m
            memory: 4Gi
        
        # Volume mounts (writable dirs)
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: cache
          mountPath: /var/cache
      
      volumes:
      - name: tmp
        emptyDir: {}
      - name: cache
        emptyDir: {}
```

### RBAC Configuration

**Principle**: Grant minimum permissions necessary.

```yaml
# deployment/k8s/base/rbac.yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: consumer-controlplane
  namespace: consumer
automountServiceAccountToken: true

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: consumer-controlplane
  namespace: consumer
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]
  # Restrict to specific secret names
  resourceNames: ["consumer-credentials", "consumer-keys"]

- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: consumer-controlplane
  namespace: consumer
subjects:
- kind: ServiceAccount
  name: consumer-controlplane
  namespace: consumer
roleRef:
  kind: Role
  name: consumer-controlplane
  apiGroup: rbac.authorization.k8s.io
```

### Image Security

**Dockerfile Best Practices**:

```dockerfile
# Use minimal base image
FROM eclipse-temurin:17-jre-alpine

# Create non-root user
RUN addgroup -g 10001 edc && \
    adduser -u 10001 -G edc -D -h /home/edc edc

# Set ownership
COPY --chown=edc:edc build/libs/controlplane.jar /app/controlplane.jar

# Switch to non-root user
USER edc

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8081/api/check/health || exit 1

# Read-only entrypoint
ENTRYPOINT ["java", "-jar", "/app/controlplane.jar"]
```

**Image Scanning in CI/CD** (already implemented):

```yaml
# .github/workflows/build-release.yml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/ma3u/controlplane:${{ github.sha }}
    format: 'sarif'
    severity: 'CRITICAL,HIGH'
    output: 'trivy-results.sarif'

- name: Upload Trivy results to GitHub Security
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: 'trivy-results.sarif'
```

## Network Security

### NetworkPolicies

**Default Deny-All Policy**:

```yaml
# deployment/k8s/base/network-policies/00-deny-all.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all-ingress
  namespace: consumer
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

**Allow Controlplane ↔ Dataplane**:

```yaml
# deployment/k8s/base/network-policies/01-consumer-internal.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: consumer-internal-communication
  namespace: consumer
spec:
  podSelector:
    matchLabels:
      app: consumer-controlplane
  policyTypes:
  - Egress
  egress:
  # Allow to dataplane
  - to:
    - podSelector:
        matchLabels:
          app: consumer-dataplane
    ports:
    - protocol: TCP
      port: 8081
  # Allow to IdentityHub
  - to:
    - podSelector:
        matchLabels:
          app: consumer-identityhub
    ports:
    - protocol: TCP
      port: 7083
  # Allow DNS
  - to:
    - namespaceSelector:
        matchLabels:
          name: kube-system
    ports:
    - protocol: UDP
      port: 53
```

**Allow Ingress from NGINX**:

```yaml
# deployment/k8s/base/network-policies/02-ingress.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-nginx
  namespace: consumer
spec:
  podSelector:
    matchLabels:
      app: consumer-controlplane
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080  # Management API
    - protocol: TCP
      port: 8282  # DSP API
```

**PostgreSQL Egress**:

```yaml
# deployment/k8s/base/network-policies/03-database.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-postgres-egress
  namespace: consumer
spec:
  podSelector:
    matchLabels:
      component: edc-runtime
  policyTypes:
  - Egress
  egress:
  - to:
    - podSelector: {}
      namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 5432
```

### TLS Configuration

**NGINX Ingress TLS**:

```yaml
# deployment/k8s/overlays/production/ingress-tls.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: consumer-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-protocols: "TLSv1.3"
    nginx.ingress.kubernetes.io/ssl-ciphers: "ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - consumer.mvd.yourdomain.com
    secretName: consumer-tls-cert
  rules:
  - host: consumer.mvd.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: consumer-controlplane
            port:
              number: 8080
```

**Rate Limiting**:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: consumer-ingress
  annotations:
    nginx.ingress.kubernetes.io/rate-limit: "100"  # requests per minute
    nginx.ingress.kubernetes.io/limit-rps: "10"    # requests per second
    nginx.ingress.kubernetes.io/limit-connections: "50"
```

## Application Security

### API Authentication

**OAuth2/OIDC for Management API**:

Configure EDC to use OAuth2 bearer tokens:

```properties
# controlplane.properties
edc.oauth.token.validation.endpoint=https://your-idp.com/token/introspect
edc.oauth.client.id=mvd-controlplane
edc.oauth.client.secret.alias=oauth-client-secret
edc.oauth.public.key.alias=oauth-public-key
```

**API Key Management**:

Rotate API keys regularly and store in external vault:

```bash
# Generate strong API key
openssl rand -base64 32

# Store in Azure Key Vault
az keyvault secret set \
  --vault-name mvd-keyvault-prod \
  --name consumer-api-key \
  --value "$(openssl rand -base64 32)"
```

### Input Validation

EDC implements input validation via JSON Schema. Custom extensions should follow suit:

```java
// Example: Validate asset creation
public class AssetValidator {
    private static final Pattern ID_PATTERN = Pattern.compile("^[a-zA-Z0-9_-]+$");
    private static final int MAX_NAME_LENGTH = 255;
    
    public void validate(Asset asset) {
        if (!ID_PATTERN.matcher(asset.getId()).matches()) {
            throw new ValidationException("Invalid asset ID format");
        }
        if (asset.getName().length() > MAX_NAME_LENGTH) {
            throw new ValidationException("Asset name too long");
        }
        // Additional validations...
    }
}
```

### DCP Security

**Verifiable Credential Validation**:

Ensure all VCs are properly validated:

```java
// extensions/dcp-impl/src/main/java/org/eclipse/edc/demo/dcp/policy/MembershipCredentialEvaluationFunction.java
@Override
public Result<Void> evaluate(Policy policy, PolicyContext context) {
    var credential = context.getContextData(VerifiableCredential.class);
    
    // 1. Verify signature
    if (!verifySignature(credential)) {
        return Result.failure("Invalid credential signature");
    }
    
    // 2. Check expiration
    if (credential.getExpirationDate().isBefore(Instant.now())) {
        return Result.failure("Credential expired");
    }
    
    // 3. Verify issuer is trusted
    if (!trustedIssuers.contains(credential.getIssuer())) {
        return Result.failure("Untrusted issuer");
    }
    
    // 4. Validate credential type
    if (!credential.getType().contains("MembershipCredential")) {
        return Result.failure("Invalid credential type");
    }
    
    return Result.success();
}
```

## Secrets Management

### External Secrets Operator

**Azure Key Vault Integration**:

```yaml
# deployment/k8s/base/external-secrets/secret-store.yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: azure-backend
  namespace: consumer
spec:
  provider:
    azurekv:
      authType: WorkloadIdentity
      vaultUrl: https://mvd-keyvault-prod.vault.azure.net
      serviceAccountRef:
        name: external-secrets-sa

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: consumer-credentials
  namespace: consumer
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: azure-backend
    kind: SecretStore
  target:
    name: consumer-credentials
    creationPolicy: Owner
  data:
  - secretKey: postgres-password
    remoteRef:
      key: consumer-postgres-password
  - secretKey: private-key
    remoteRef:
      key: consumer-private-key
```

**AWS Secrets Manager Integration**:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-backend
  namespace: consumer
spec:
  provider:
    aws:
      service: SecretsManager
      region: eu-west-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
```

**GCP Secret Manager Integration**:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: gcp-backend
  namespace: consumer
spec:
  provider:
    gcpsm:
      projectID: mvd-production
      auth:
        workloadIdentity:
          clusterLocation: europe-west1
          clusterName: mvd-gke-prod
          serviceAccountRef:
            name: external-secrets-sa
```

### Secret Rotation

**Automated Rotation Policy**:

| Secret Type | Rotation Period | Implementation |
|-------------|----------------|----------------|
| Database passwords | 90 days | Cloud-managed rotation |
| API keys | 90 days | Manual rotation + automation |
| TLS certificates | 60 days (auto) | cert-manager |
| EDC private keys | 180 days | Manual rotation |
| Service account tokens | 365 days | Kubernetes auto-rotation |

**Rotation Procedure**:

```bash
# 1. Generate new secret
NEW_PASSWORD=$(openssl rand -base64 32)

# 2. Store in vault with new version
az keyvault secret set \
  --vault-name mvd-keyvault-prod \
  --name postgres-password \
  --value "$NEW_PASSWORD"

# 3. Update database
ALTER USER mvdadmin WITH PASSWORD '$NEW_PASSWORD';

# 4. Trigger pod restart (ESO syncs new secret)
kubectl rollout restart deployment/consumer-controlplane -n consumer

# 5. Verify connectivity
kubectl logs -n consumer deployment/consumer-controlplane | grep "Database connection established"
```

## Identity and Access

### Kubernetes RBAC

**Cluster Admin** (Platform Team):
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: platform-admins
subjects:
- kind: Group
  name: platform-admins@yourcompany.com
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io
```

**Namespace Admin** (Application Team):
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: consumer-admins
  namespace: consumer
subjects:
- kind: Group
  name: consumer-team@yourcompany.com
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: admin
  apiGroup: rbac.authorization.k8s.io
```

**Read-Only** (Developers):
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: consumer-viewers
  namespace: consumer
subjects:
- kind: Group
  name: developers@yourcompany.com
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: view
  apiGroup: rbac.authorization.k8s.io
```

### Cloud IAM

**Azure - Workload Identity**:

```bash
# Create managed identity
az identity create \
  --name mvd-consumer-identity \
  --resource-group $RESOURCE_GROUP

# Grant Key Vault access
az keyvault set-policy \
  --name mvd-keyvault-prod \
  --object-id $(az identity show --name mvd-consumer-identity --resource-group $RESOURCE_GROUP --query principalId -o tsv) \
  --secret-permissions get list

# Federate with Kubernetes service account
az identity federated-credential create \
  --name consumer-federated-credential \
  --identity-name mvd-consumer-identity \
  --resource-group $RESOURCE_GROUP \
  --issuer $(az aks show --name $CLUSTER_NAME --resource-group $RESOURCE_GROUP --query "oidcIssuerProfile.issuerUrl" -o tsv) \
  --subject system:serviceaccount:consumer:consumer-controlplane
```

## Compliance

### GDPR Requirements

**Data Protection Officer (DPO) Responsibilities**:
- ✅ Data inventory and classification
- ✅ Privacy impact assessments
- ✅ Data breach notification procedures
- ✅ Right to erasure implementation
- ✅ Audit logging and retention

**Technical Controls**:

```yaml
# Encrypt data at rest
spec:
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      storageClassName: encrypted-gp3  # Cloud-managed encryption
      
# Audit logging
apiVersion: v1
kind: ConfigMap
metadata:
  name: controlplane-config
data:
  EDC_AUDIT_LOG_ENABLED: "true"
  EDC_AUDIT_LOG_LEVEL: "INFO"
  EDC_AUDIT_LOG_RETENTION_DAYS: "2555"  # 7 years for GDPR
```

### SOC 2 Controls

| Control Area | Implementation |
|--------------|----------------|
| **CC6.1 - Logical Access** | RBAC, MFA, least privilege |
| **CC6.6 - Encryption** | TLS 1.3, AES-256 at rest |
| **CC7.2 - Monitoring** | Prometheus, Grafana, alerting |
| **CC8.1 - Change Management** | GitOps, PR reviews, CI/CD |
| **CC9.2 - Vendor Management** | SBOM, vulnerability scanning |

### ISO 27001 Alignment

- **A.9 - Access Control**: RBAC, IAM integration
- **A.10 - Cryptography**: Key Vault, TLS, encrypted storage
- **A.12 - Operations Security**: Monitoring, backups, patching
- **A.14 - System Acquisition**: Secure SDLC, testing
- **A.17 - Business Continuity**: DR plan, backups, HA

## Security Monitoring

### Audit Logging

**Enable Kubernetes Audit Logs**:

```yaml
# audit-policy.yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
- level: RequestResponse
  resources:
  - group: ""
    resources: ["secrets", "configmaps"]
- level: Metadata
  resources:
  - group: ""
    resources: ["pods", "services"]
- level: None
  userGroups: ["system:serviceaccounts"]
```

**EDC Audit Logging**:

```properties
edc.audit.log.enabled=true
edc.audit.log.events=asset.access,contract.negotiation,transfer.initiated
edc.audit.log.destination=syslog://logging-service:514
```

### Security Alerts

**Prometheus Alert Rules**:

```yaml
# deployment/observability/prometheus/alerts/security.yaml
groups:
- name: security
  interval: 30s
  rules:
  - alert: UnauthorizedAPIAccess
    expr: rate(http_server_requests_total{status="401"}[5m]) > 10
    for: 2m
    annotations:
      summary: "High rate of 401 errors on {{ $labels.instance }}"
      
  - alert: PodSecurityViolation
    expr: kube_pod_status_phase{phase="Failed"} and kube_pod_info{pod=~".*security.*"}
    annotations:
      summary: "Pod security violation detected"
      
  - alert: SecretAccessSpike
    expr: rate(apiserver_audit_event_total{verb="get",objectRef_resource="secrets"}[5m]) > 100
    for: 1m
    annotations:
      summary: "Unusual secret access pattern detected"
```

### Vulnerability Management

**Continuous Scanning**:

```bash
# Scan running images
trivy image --severity HIGH,CRITICAL ghcr.io/ma3u/controlplane:latest

# Scan Kubernetes manifests
trivy config deployment/k8s/

# Scan Infrastructure as Code
trivy config deployment/terraform/
```

**Patching Schedule**:

| Component | Patching Cadence | Window |
|-----------|-----------------|--------|
| Kubernetes | Monthly | Maintenance window |
| Base images | Weekly | Automated rebuild |
| Dependencies | As needed | CVE-driven |
| OS packages | Weekly | Automated updates |

## Incident Response

### Security Incident Runbook

**Phase 1: Detection**
1. Alert triggered via monitoring
2. On-call engineer notified (PagerDuty/Opsgenie)
3. Initial triage within 15 minutes

**Phase 2: Containment**
```bash
# Isolate compromised pod
kubectl label pod <pod-name> quarantine=true -n <namespace>
kubectl patch networkpolicy quarantine-policy -n <namespace> -p '{"spec":{"podSelector":{"matchLabels":{"quarantine":"true"}}}}'

# Revoke access
kubectl delete rolebinding <suspicious-binding> -n <namespace>

# Capture forensics
kubectl logs <pod-name> -n <namespace> > incident-logs.txt
kubectl describe pod <pod-name> -n <namespace> > incident-describe.txt
```

**Phase 3: Eradication**
```bash
# Delete compromised resources
kubectl delete pod <pod-name> -n <namespace>

# Rotate secrets
./scripts/rotate-all-secrets.sh

# Apply patches
kubectl set image deployment/<deployment> container=ghcr.io/ma3u/controlplane:patched
```

**Phase 4: Recovery**
```bash
# Restore from backup if needed
velero restore create --from-backup production-backup-20241228

# Verify integrity
./scripts/verify-deployment.sh

# Resume normal operations
kubectl patch deployment <deployment> -p '{"spec":{"replicas":3}}'
```

**Phase 5: Post-Incident**
- Document incident in runbook
- Update threat model
- Implement preventive controls
- Conduct blameless postmortem

### Communication Plan

| Stakeholder | When | Method |
|-------------|------|--------|
| Security Team | Immediately | Slack #security-incidents |
| Engineering Leads | Within 30min | Email + Slack |
| Legal/DPO | Data breach suspected | Phone call |
| Customers | Confirmed breach | Email notification |
| Regulators | GDPR breach (>72h) | Formal notification |

## Security Checklist

### Pre-Production

- [ ] All secrets in external vault (not Git)
- [ ] Pod Security Standards enforced
- [ ] NetworkPolicies applied (default deny)
- [ ] RBAC configured (least privilege)
- [ ] TLS certificates configured (Let's Encrypt)
- [ ] Container images scanned (no CRITICAL vulns)
- [ ] Non-root containers enforced
- [ ] Resource limits configured
- [ ] Audit logging enabled
- [ ] Monitoring and alerting configured
- [ ] Backup and DR tested
- [ ] Incident response plan documented

### Ongoing

- [ ] Weekly vulnerability scans
- [ ] Monthly secret rotation
- [ ] Quarterly penetration testing
- [ ] Audit log review (weekly)
- [ ] Access review (quarterly)
- [ ] DR drill (quarterly)
- [ ] Security training (annually)

## References

- [CIS Kubernetes Benchmark](https://www.cisecurity.org/benchmark/kubernetes)
- [OWASP Kubernetes Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Kubernetes_Security_Cheat_Sheet.html)
- [NSA/CISA Kubernetes Hardening Guide](https://media.defense.gov/2022/Aug/29/2003066362/-1/-1/0/CTR_KUBERNETES_HARDENING_GUIDANCE_1.2_20220829.PDF)
- [EDC Security Documentation](https://eclipse-edc.github.io/docs/)

---

**Last Updated**: 2024-12-28  
**Version**: 1.0.0  
**Security Contact**: security@yourcompany.com
