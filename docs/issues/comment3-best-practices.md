# HashiCorp Vault Best Practices for EDC

## Production Setup

### 1. Use AppRole Authentication

```hcl
# Enable AppRole auth method
vault auth enable approle

# Create policy for EDC
vault policy write edc-policy - <<EOF
path "secret/data/participants/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}
path "secret/data/shared/*" {
  capabilities = ["read"]
}
EOF

# Create AppRole for Control Plane
vault write auth/approle/role/controlplane \
    token_policies="edc-policy" \
    token_ttl=1h \
    token_max_ttl=4h

# Create AppRole for Identity Hub
vault write auth/approle/role/identityhub \
    token_policies="edc-policy" \
    token_ttl=1h \
    token_max_ttl=4h
```

### 2. EDC Configuration for AppRole

```properties
edc.vault.hashicorp.url=https://vault.example.com:8200
edc.vault.hashicorp.auth.method=approle
edc.vault.hashicorp.approle.role.id=${VAULT_ROLE_ID}
edc.vault.hashicorp.approle.secret.id=${VAULT_SECRET_ID}
edc.vault.hashicorp.api.secret.path=/v1/secret/data
```

### 3. Key Rotation

```bash
#!/bin/bash
# rotate-sts-secrets.sh

PARTICIPANTS=("consumer" "provider")

for PARTICIPANT in "${PARTICIPANTS[@]}"; do
    CONTEXT_ID="did:web:${PARTICIPANT}-identityhub:7083"
    NEW_SECRET=$(openssl rand -base64 32)
    
    vault kv put "secret/participants/${CONTEXT_ID}/sts-client-secret" \
        value="${NEW_SECRET}"
    
    echo "Rotated STS secret for ${CONTEXT_ID}"
done
```

### 4. Backup and Recovery

```bash
# Export all EDC secrets
vault kv get -format=json secret/participants > edc-secrets-backup.json

# Restore from backup
vault kv put secret/participants @edc-secrets-backup.json
```

## Security Recommendations

1. **Never use dev mode in production**
2. **Enable audit logging**
3. **Use TLS for vault communication**
4. **Rotate tokens regularly**
5. **Use separate policies for Control Plane and Identity Hub**
6. **Consider using Vault Agent for token renewal**

## Related Resources

- [HashiCorp Vault Documentation](https://developer.hashicorp.com/vault/docs)
- [EDC Vault Extension](https://github.com/eclipse-edc/Connector/tree/main/extensions/common/vault/vault-hashicorp)
- [STS Account Service Implementation](https://github.com/eclipse-edc/IdentityHub/blob/main/extensions/sts/sts-account-service-local/src/main/java/org/eclipse/edc/identityhub/sts/accountservice/StsAccountServiceImpl.java)
