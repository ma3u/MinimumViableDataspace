# GitHub Issue: EDC STS Authentication with HashiCorp Vault - URL Encoding and Secret Synchronization Problems

## Issue Title
**STS Client Secret Authentication Fails with HashiCorp Vault Due to URL Encoding Inconsistencies and Secret Synchronization Issues**

---

## Problem Description

When deploying Eclipse EDC (v0.14.1) with IdentityHub and HashiCorp Vault for production-grade secret management, the contract negotiation between dataspace participants fails with `401 Unauthorized` errors. The root causes are:

### Issue 1: URL Encoding Inconsistencies in Vault Key Paths

The EDC components use different URL encoding strategies when storing vs. retrieving secrets from HashiCorp Vault:

**Observed Behavior:**
- STS secrets are stored with URL-encoded keys: `did%3Aweb%3Aconsumer-identityhub%253A7083-sts-client-secret`
- Control Plane tries to resolve secrets using unencoded keys: `did:web:consumer-identityhub%3A7083-sts-client-secret`
- This mismatch causes `"Secret not found"` errors

**Error Log Example:**
```
DEBUG [Hashicorp Vault] Secret not found
EdcException: Unable to obtain credentials: Failed to fetch client secret from the vault with alias: did:web:consumer-identityhub%3A7083-sts-client-secret
```

### Issue 2: Vault Partitioning Complexity

The EDC vault interface uses a 2-argument method for secret operations:
```java
vault.storeSecret(participantContextId, secretAlias, secret)
vault.resolveSecret(participantContextId, secretAlias)
```

When using HashiCorp Vault, this partitioning mechanism isn't clearly documented, leading to:
- Secrets stored at paths that differ from where they're retrieved
- Difficulty in manually seeding or debugging vault contents
- No clear contract on how the `participantContextId` partition prefix is applied

### Issue 3: Private Key Resolution (key-1)

The IdentityHub STS endpoint fails with:
```
JWSSigner cannot be generated for private key 'key-1': Private key with ID 'key-1' not found in Config
```

This indicates:
- The `key-1` private key required for JWT signing must be explicitly stored in Vault
- The key alias resolution doesn't fall back to reasonable defaults
- No initialization script or documentation for required vault secrets

### Issue 4: InMemoryVault as Silent Default

Both Control Plane and Identity Hub default to `InMemoryVault` unless explicitly configured with `-Ppersistence=true` during Gradle build. This causes:
- Different vault implementations between components (one may use HashiCorp, another InMemory)
- Secrets stored in one vault instance not accessible from another
- Misleading logs: `"Using the InMemoryVault. This is not suitable for production use."`

---

## Affected Components

| Component | File | Issue |
|-----------|------|-------|
| Control Plane | `StsRemoteClientImpl` | Expects secrets at unencoded vault paths |
| Identity Hub | `StsAccountProvisionerImpl` | Stores secrets with URL-encoded paths |
| Identity Hub | `StsAccountServiceImpl.authenticate()` | Uses vault partitioning |
| HashiCorp Vault Extension | `HashicorpVaultClient` | URL-encodes keys internally |

---

## Environment

- **EDC Version**: 0.14.1
- **IdentityHub Version**: 0.14.1  
- **Vault**: HashiCorp Vault (dev mode)
- **Build**: Gradle with `-Ppersistence=true`
- **DIDs**: `did:web:consumer-identityhub%3A7083`, `did:web:provider-identityhub%3A7093`

---

## Steps to Reproduce

1. Build EDC components with `-Ppersistence=true` for HashiCorp Vault support
2. Deploy consumer/provider Control Planes and Identity Hubs
3. Configure all components to use the same HashiCorp Vault instance
4. Create participants using Identity Hub API
5. Attempt catalog crawl or contract negotiation from consumer to provider
6. Observe `401 Unauthorized` or `"Failed to fetch client secret from vault"` errors

---

## Expected Behavior

1. Secrets stored by Identity Hub should be resolvable by Control Plane
2. URL encoding should be consistent across all components
3. Vault partitioning behavior should be clearly documented
4. Required secrets (like `key-1`) should be documented or auto-generated

---

## Related Code Analysis

### StsAccountServiceImpl.authenticate()
```java
// Uses vault partitioning - retrieves from participantContext-specific path
public ServiceResult<StsAccount> authenticate(StsAccount client, String secret) {
    return ofNullable(vault.resolveSecret(client.getParticipantContextId(), client.getSecretAlias()))
            .filter(vaultSecret -> vaultSecret.equals(secret))
            .map(s -> success(client))
            .orElseGet(() -> unauthorized(format("Failed to authenticate client with id %s", client.getId())));
}
```

### StsAccountProvisionerImpl.create()
```java
// Stores secret with participantContext partition
vault.storeSecret(manifest.getParticipantContextId(), secretAlias, accountCredentials.clientSecret())
```

### clientSecretAlias() generation
```java
// From IdentityHubParticipantContext.java
public String clientSecretAlias() {
    return ofNullable(properties.get("clientSecret"))
        .map(Object::toString)
        .orElseGet(() -> participantContextId + "-sts-client-secret");
}
```

---

## Labels

`bug`, `vault`, `authentication`, `documentation`, `breaking-change`

---

# Comment 1: Proposed Solution - Unified HashiCorp Vault Secret Management

## Solution Overview

Implement a **consistent, normalized approach** to vault key management that eliminates URL encoding ambiguity and provides a single source of truth for all secrets.

### Principle: Store Raw, Normalize on Access

All vault keys should be stored in **raw/unencoded form**, with a utility function to normalize keys before any vault operation.

### Implementation

#### 1. Create a VaultKeyNormalizer Utility

```java
public class VaultKeyNormalizer {
    
    /**
     * Normalizes a vault key by URL-decoding it recursively until stable.
     * This ensures consistent key resolution regardless of how many times
     * the key was encoded.
     */
    public static String normalize(String key) {
        if (key == null) return null;
        
        String decoded = key;
        String previous;
        do {
            previous = decoded;
            try {
                decoded = URLDecoder.decode(previous, StandardCharsets.UTF_8);
            } catch (IllegalArgumentException e) {
                // Key contains invalid encoding, use as-is
                return previous;
            }
        } while (!decoded.equals(previous));
        
        return decoded;
    }
    
    /**
     * Creates a safe vault path from DID and suffix.
     * DIDs contain special characters that must be consistently handled.
     */
    public static String createSecretAlias(String did, String suffix) {
        // Use raw DID without encoding - Vault KV v2 supports special chars
        return normalize(did) + "-" + suffix;
    }
}
```

#### 2. Wrap HashiCorp Vault Client

```java
public class NormalizedHashicorpVault implements Vault {
    
    private final Vault delegate;
    
    @Override
    public String resolveSecret(String key) {
        return delegate.resolveSecret(VaultKeyNormalizer.normalize(key));
    }
    
    @Override
    public String resolveSecret(String partition, String key) {
        return delegate.resolveSecret(
            VaultKeyNormalizer.normalize(partition),
            VaultKeyNormalizer.normalize(key)
        );
    }
    
    @Override
    public Result<Void> storeSecret(String key, String value) {
        return delegate.storeSecret(VaultKeyNormalizer.normalize(key), value);
    }
    
    @Override
    public Result<Void> storeSecret(String partition, String key, String value) {
        return delegate.storeSecret(
            VaultKeyNormalizer.normalize(partition),
            VaultKeyNormalizer.normalize(key),
            value
        );
    }
}
```

#### 3. Vault Initialization Script for Required Secrets

```bash
#!/bin/bash
# vault-init.sh - Initialize required secrets for EDC dataspace

VAULT_ADDR=${VAULT_ADDR:-http://localhost:8200}
VAULT_TOKEN=${VAULT_TOKEN:-root}

# Generate EC private key for JWT signing
generate_ec_key() {
    openssl ecparam -name prime256v1 -genkey -noout 2>/dev/null
}

# Store key-1 (required for STS JWT signing)
echo "Storing key-1 private key..."
PRIVATE_KEY=$(generate_ec_key)
curl -s -X POST "${VAULT_ADDR}/v1/secret/data/key-1" \
  -H "X-Vault-Token: ${VAULT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"data\": {\"content\": $(echo "$PRIVATE_KEY" | jq -Rs .)}}"

echo "✓ Vault initialized with required secrets"
```

#### 4. Docker Compose Integration

```yaml
# docker-compose.yml
services:
  vault:
    image: hashicorp/vault:latest
    environment:
      VAULT_DEV_ROOT_TOKEN_ID: root
    healthcheck:
      test: ["CMD", "vault", "status"]
      interval: 5s
      timeout: 3s
      retries: 10

  vault-init:
    image: hashicorp/vault:latest
    depends_on:
      vault:
        condition: service_healthy
    environment:
      VAULT_ADDR: http://vault:8200
      VAULT_TOKEN: root
    volumes:
      - ./vault-init.sh:/vault-init.sh
    entrypoint: ["/bin/sh", "/vault-init.sh"]
    restart: "no"
```

### Vault Path Convention

Use a clear, hierarchical path structure:

```
secret/
├── participants/
│   ├── {participantContextId}/
│   │   ├── sts-client-secret
│   │   ├── api-token
│   │   └── private-keys/
│   │       └── key-1
├── shared/
│   └── super-user-apikey
```

Example paths (unencoded):
```
secret/data/participants/did:web:consumer-identityhub:7083/sts-client-secret
secret/data/participants/did:web:provider-identityhub:7093/sts-client-secret
secret/data/shared/key-1
```

### Configuration

```properties
# Control Plane configuration
edc.vault.hashicorp.url=http://vault:8200
edc.vault.hashicorp.token=root
edc.vault.hashicorp.api.secret.path=/v1/secret/data

# Identity Hub configuration (same vault)
edc.vault.hashicorp.url=http://vault:8200
edc.vault.hashicorp.token=root
edc.vault.hashicorp.api.secret.path=/v1/secret/data
```

---

# Comment 2: Recommendations for EDC Team

## Suggested Improvements to Eclipse EDC

### 1. **Standardize URL Encoding Behavior**

**Current Problem**: Different components apply URL encoding inconsistently when interacting with Vault.

**Recommendation**: 
- Document the expected encoding behavior in the Vault SPI
- Add a `@VaultKeyFormat` annotation or configuration to explicitly declare encoding expectations
- Consider adding a `VaultKeyStrategy` enum: `RAW`, `URL_ENCODED`, `BASE64`

```java
public interface Vault {
    /**
     * @param key The secret key. Keys are normalized (URL-decoded) before use.
     *            Callers should NOT pre-encode keys.
     */
    @Nullable
    String resolveSecret(String key);
}
```

### 2. **Add Vault Health Check and Diagnostics**

**Recommendation**: Add a diagnostic endpoint that validates vault connectivity and lists accessible secrets:

```java
@GET
@Path("/health/vault")
public VaultDiagnostics checkVault() {
    return new VaultDiagnostics(
        vaultReachable: vault.isHealthy(),
        secretsAccessible: vault.listSecrets("/").size(),
        implementationType: vault.getClass().getSimpleName(),
        warnings: vault.getWarnings()  // e.g., "Using InMemoryVault"
    );
}
```

### 3. **Fail Fast on InMemoryVault in Production**

**Current Problem**: InMemoryVault is used silently as a fallback, causing hard-to-debug issues.

**Recommendation**:
```java
if (vault instanceof InMemoryVault) {
    if (environment.isProduction()) {
        throw new EdcException("InMemoryVault is not suitable for production. " +
            "Configure a persistent vault (HashiCorp, Azure KeyVault, etc.)");
    }
    monitor.warning("⚠️ Using InMemoryVault - secrets will NOT persist across restarts");
}
```

### 4. **Document Vault Partitioning Behavior**

The 2-argument vault methods use partitioning:
```java
vault.storeSecret(participantContextId, secretAlias, secret)
```

**Recommendation**: Document how partitioning works:
- Is `participantContextId` a path prefix?
- Are partitions isolated (multi-tenant)?
- What's the resulting Vault path?

Example documentation:
```
The vault uses logical partitioning for participant isolation.
When calling vault.storeSecret("participant-A", "my-secret", value):
- HashiCorp Vault: Stored at /v1/secret/data/participant-A/my-secret
- Azure KeyVault: Stored as participant-A--my-secret
- InMemoryVault: Stored with composite key "participant-A:my-secret"
```

### 5. **Provide Required Secrets Manifest**

**Recommendation**: Add a `secrets-manifest.json` to document all required secrets:

```json
{
  "secrets": [
    {
      "alias": "key-1",
      "description": "EC private key for STS JWT signing",
      "format": "PEM (PKCS#8)",
      "required": true,
      "autoGenerate": true,
      "algorithm": "EC P-256"
    },
    {
      "alias": "{participantContextId}-sts-client-secret",
      "description": "OAuth client secret for STS authentication",
      "format": "alphanumeric string (16+ chars)",
      "required": true,
      "autoGenerate": true
    }
  ]
}
```

### 6. **Add Vault Integration Tests with HashiCorp Vault**

**Recommendation**: Include Testcontainers-based integration tests:

```java
@Testcontainers
class HashicorpVaultIntegrationTest {
    
    @Container
    static VaultContainer<?> vault = new VaultContainer<>("hashicorp/vault:1.15")
        .withVaultToken("test-token");
    
    @Test
    void shouldStoreAndRetrieveSecretWithSpecialCharacters() {
        var key = "did:web:example.com%3A8080-secret";
        vault.storeSecret(key, "my-secret-value");
        
        // Should work regardless of encoding
        assertThat(vault.resolveSecret(key)).isEqualTo("my-secret-value");
        assertThat(vault.resolveSecret(URLDecoder.decode(key))).isEqualTo("my-secret-value");
    }
}
```

### 7. **Error Message Improvement**

**Current Error**:
```
Failed to fetch client secret from the vault with alias: did:web:consumer-identityhub%3A7083-sts-client-secret
```

**Recommended Error**:
```
Failed to fetch client secret from vault.
  Alias: did:web:consumer-identityhub%3A7083-sts-client-secret
  Vault Type: HashicorpVault
  Vault URL: http://vault:8200
  
Troubleshooting:
1. Verify the secret exists: vault kv get secret/did:web:consumer-identityhub%3A7083-sts-client-secret
2. Check vault connectivity: curl -H "X-Vault-Token: $TOKEN" http://vault:8200/v1/sys/health
3. Ensure consistent URL encoding in secret aliases

See: https://github.com/eclipse-edc/Connector/blob/main/docs/vault-troubleshooting.md
```

---

# Comment 3: Best Practices for HashiCorp Vault Persistent Key Storage

## HashiCorp Vault Configuration for EDC Dataspaces

### 1. Production Vault Setup

```bash
# Start Vault in server mode (not dev)
vault server -config=/vault/config/vault.hcl

# Initialize Vault (save unseal keys securely!)
vault operator init -key-shares=5 -key-threshold=3

# Unseal Vault
vault operator unseal $KEY_1
vault operator unseal $KEY_2
vault operator unseal $KEY_3
```

### 2. Vault Configuration (vault.hcl)

```hcl
# Storage backend - use Consul, PostgreSQL, or Raft for HA
storage "postgresql" {
  connection_url = "postgres://vault:password@db:5432/vault"
  table          = "vault_kv_store"
}

# Listener
listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = false
  tls_cert_file = "/vault/certs/vault.crt"
  tls_key_file  = "/vault/certs/vault.key"
}

# Enable UI for debugging (disable in production)
ui = true

# Audit logging (essential for compliance)
audit {
  file {
    file_path = "/vault/logs/audit.log"
  }
}
```

### 3. Secret Engine Setup

```bash
# Enable KV secrets engine v2
vault secrets enable -path=secret kv-v2

# Create policy for EDC components
vault policy write edc-policy - <<EOF
path "secret/data/participants/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "secret/data/shared/*" {
  capabilities = ["read", "list"]
}

path "secret/metadata/*" {
  capabilities = ["list"]
}
EOF

# Create token for EDC with limited permissions
vault token create -policy=edc-policy -ttl=8760h
```

### 4. Key Rotation Strategy

```bash
#!/bin/bash
# rotate-sts-secrets.sh

PARTICIPANT_ID=$1
OLD_ALIAS="${PARTICIPANT_ID}-sts-client-secret"
NEW_SECRET=$(openssl rand -base64 32)

# Store new secret
vault kv put secret/participants/${PARTICIPANT_ID}/sts-client-secret \
  content="${NEW_SECRET}"

# Update EDC (via Identity Hub API)
curl -X PUT "http://identityhub:7082/api/identity/v1alpha/participants/${PARTICIPANT_ID}/credentials" \
  -H "X-Api-Key: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"clientSecret\": \"${NEW_SECRET}\"}"

echo "Secret rotated for ${PARTICIPANT_ID}"
```

### 5. Backup and Recovery

```bash
# Backup Vault data
vault operator raft snapshot save backup.snap

# Backup secret values (encrypted)
vault kv get -format=json secret/participants | \
  gpg --encrypt --recipient admin@example.com > vault-backup.gpg

# Restore from backup
vault operator raft snapshot restore backup.snap
```

### 6. Monitoring and Alerting

```yaml
# Prometheus rules for Vault
groups:
  - name: vault
    rules:
      - alert: VaultSealed
        expr: vault_core_unsealed == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Vault is sealed"
          
      - alert: VaultTokenExpiring
        expr: vault_token_ttl < 86400
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Vault token expires in less than 24 hours"
```

### 7. EDC-Specific Vault Structure

```
secret/
├── participants/
│   ├── did:web:consumer-identityhub:7083/
│   │   ├── sts-client-secret          # STS OAuth client secret
│   │   ├── api-token                  # Participant context API token
│   │   └── keys/
│   │       ├── signing-key            # Token signing private key
│   │       └── encryption-key         # Data encryption key
│   └── did:web:provider-identityhub:7093/
│       └── ...
├── shared/
│   ├── key-1                          # Default signing key
│   └── super-user-apikey              # Admin API key
└── certificates/
    ├── tls-cert                       # TLS certificate
    └── tls-key                        # TLS private key
```

### 8. Seeding Script for Development

```bash
#!/bin/bash
# seed-vault-secrets.sh

set -e

VAULT_ADDR=${VAULT_ADDR:-http://localhost:8200}
VAULT_TOKEN=${VAULT_TOKEN:-root}

log() { echo "[$(date +'%H:%M:%S')] $1"; }

store_secret() {
    local path=$1
    local key=$2
    local value=$3
    
    curl -sf -X POST "${VAULT_ADDR}/v1/secret/data/${path}" \
      -H "X-Vault-Token: ${VAULT_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "{\"data\": {\"${key}\": \"${value}\"}}" > /dev/null
    
    log "✓ Stored: ${path}"
}

# Generate signing key
SIGNING_KEY=$(openssl ecparam -name prime256v1 -genkey -noout 2>/dev/null)

# Store shared secrets
store_secret "shared/key-1" "content" "${SIGNING_KEY}"
store_secret "shared/super-user-apikey" "content" "c3VwZXItdXNlcg==.c3VwZXItc2VjcmV0LWtleQo="

# Store participant secrets
for participant in "consumer" "provider"; do
    DID="did:web:${participant}-identityhub:7083"
    SECRET=$(openssl rand -hex 16)
    API_TOKEN=$(openssl rand -base64 32)
    
    store_secret "participants/${DID}/sts-client-secret" "content" "${SECRET}"
    store_secret "participants/${DID}/api-token" "content" "${API_TOKEN}"
    
    log "✓ Initialized participant: ${DID}"
done

log "🔐 Vault seeding complete"
```

---

## Summary

The core issues stem from:
1. **Inconsistent URL encoding** across EDC components
2. **Undocumented vault partitioning** behavior
3. **Missing required secrets** (key-1) documentation
4. **Silent fallback** to InMemoryVault

The solution involves:
1. Normalizing all vault keys to raw/unencoded format
2. Using a consistent path structure
3. Documenting and automating secret initialization
4. Adding better error messages and diagnostics

This would significantly improve the developer experience when deploying EDC dataspaces with production-grade secret management.

