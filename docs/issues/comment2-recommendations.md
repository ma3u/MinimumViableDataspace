# Recommendations for EDC Team

Based on debugging the STS client secret authentication failures in MVD-Health, here are recommendations for the Eclipse Dataspace Components team:

## 1. Standardize Vault Key Handling

**Problem**: Different components encode/decode vault keys differently, causing lookup mismatches.

**Recommendation**: 
- Define a canonical format for vault keys (unencoded recommended)
- Create a shared utility for vault key normalization
- Document the expected format in the EDC documentation

## 2. Improve Error Messages

**Problem**: Error message says "alias: did:web:consumer-identityhub%3A7083-sts-client-secret" but the actual vault path is different.

**Recommendation**:
- Log the **exact** vault path being queried (including base path, partitions)
- Include the vault URL and secret path in debug logs
- Add correlation between STS token requests and vault lookups

## 3. Document Vault Partitioning

**Problem**: The vault partitioning mechanism (using `participantContextId` as partition) is undiscoverable.

**Recommendation**:
- Document that `vault.resolveSecret(partition, key)` expects both parameters
- Explain how `participantContextId` is used as a vault partition
- Provide examples of expected vault paths for different scenarios

## 4. Add Vault Health Checks

**Problem**: Silent fallback to InMemoryVault when HashiCorp Vault connection fails.

**Recommendation**:
- Add startup health check that verifies vault connectivity
- Fail fast if configured vault is unreachable (don't silently fall back)
- Log warning if falling back to InMemoryVault

## 5. Provide Vault Migration Tools

**Problem**: Moving from InMemoryVault to HashiCorp Vault requires manual secret recreation.

**Recommendation**:
- Provide CLI tool to export/import vault secrets
- Document required secrets and their formats
- Provide vault initialization script template

## 6. Enhance StsAccountService Logging

**Problem**: Hard to trace STS token generation flow.

**Recommendation**:
Add trace-level logging for:
- Client secret resolution attempts (with normalized key)
- Token generation success/failure
- Credential presentation flow

## 7. Add Integration Tests

**Recommendation**:
- Add integration tests with HashiCorp Vault (not just InMemoryVault)
- Test URL-encoded DIDs as participant context IDs
- Test vault partitioning with special characters
