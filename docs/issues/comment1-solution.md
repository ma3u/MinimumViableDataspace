# Proposed Solution: Unified HashiCorp Vault Secret Management

## Solution Overview

Implement a **consistent, normalized approach** to vault key management that eliminates URL encoding ambiguity and provides a single source of truth for all secrets.

### Principle: Store Raw, Normalize on Access

All vault keys should be stored in **raw/unencoded form**, with a utility function to normalize keys before any vault operation.

## Implementation

### 1. Create a VaultKeyNormalizer Utility

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

### 2. Wrap HashiCorp Vault Client

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

### 3. Vault Initialization Script for Required Secrets

```bash
#!/bin/bash
# vault-init.sh - Initialize required secrets for EDC dataspace

VAULT_ADDR="${VAULT_ADDR:-http://localhost:8200}"
VAULT_TOKEN="${VAULT_TOKEN:-root}"

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

echo "Done: Vault initialized with required secrets"
```

### 4. Docker Compose Integration

```yaml
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

## Vault Path Convention

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

## Configuration

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
