# Issue: NullPointerException in HashicorpVaultClient when fetching STS client secret

## Context
We are implementing an EDC setup (Consumer/Provider) using the Decentralized Claims Protocol (DCP) for identity. The `consumer-controlplane` needs to authenticate with a Secure Token Service (STS) (running as `consumer-identityhub`) to obtain a token. This requires fetching a client secret from HashiCorp Vault.

## Environment
- **EDC Version**: 0.15.1
- **Component**: `edc-vault-hashicorp` (running in `consumer-controlplane`)
- **Vault Version**: HashiCorp Vault v1.21.1
- **Deployment**: Docker Compose

## The Problem
We are encountering a `NullPointerException` in `org.eclipse.edc.vault.hashicorp.HashicorpVaultClient.resolveSecret` when the EDC connector attempts to fetch the STS client secret from Vault.

### Stack Trace
```
SEVERE 2025-12-23T22:56:16.845473047 JerseyExtension: Unexpected exception caught
java.lang.NullPointerException: Cannot invoke "com.fasterxml.jackson.databind.JsonNode.asText()" because the return value of "com.fasterxml.jackson.databind.JsonNode.get(String)" is null
        at org.eclipse.edc.vault.hashicorp.HashicorpVaultClient.resolveSecret(HashicorpVaultClient.java:86)
        at org.eclipse.edc.vault.hashicorp.HashicorpVault.resolveSecret(HashicorpVault.java:76)
        at org.eclipse.edc.iam.decentralizedclaims.sts.remote.RemoteSecureTokenService.createRequest(RemoteSecureTokenService.java:65)
        at org.eclipse.edc.iam.decentralizedclaims.sts.remote.RemoteSecureTokenService.createToken(RemoteSecureTokenService.java:56)
        at org.eclipse.edc.iam.decentralizedclaims.service.DcpIdentityService.obtainClientCredentials(DcpIdentityService.java:118)
        ...
```

## Investigation & Attempts

### 1. Vault Configuration & Data
We are using HashiCorp Vault with the KV secrets engine. We have tried both KV v1 and KV v2.

**Current Config (KV v1):**
- `EDC_VAULT_HASHICORP_API_SECRET_PATH=/v1/secret-v1`
- `EDC_IAM_STS_OAUTH_CLIENT_SECRET_ALIAS=my-secret` (Simplified for testing)

**Seeded Data:**
We verified via `curl` from inside the container that the secret exists and returns the following JSON structure:
```json
{
  "request_id": "...",
  "lease_id": "",
  "renewable": false,
  "lease_duration": 2764800,
  "data": {
    "content": "OkSHbu3pY82pVzGx",
    "secret": "OkSHbu3pY82pVzGx",
    "client_secret": "OkSHbu3pY82pVzGx",
    "value": "OkSHbu3pY82pVzGx",
    "my-secret": "OkSHbu3pY82pVzGx"
  },
  "wrap_info": null,
  "warnings": null,
  "auth": null,
  "mount_type": "kv"
}
```
We added multiple keys (`content`, `secret`, `value`, etc.) to the secret payload to try and satisfy the `HashicorpVaultClient`'s expectation, but the NPE persists.

### 2. Analysis of the Error
The NPE `Cannot invoke "com.fasterxml.jackson.databind.JsonNode.asText()" because the return value of "com.fasterxml.jackson.databind.JsonNode.get(String)" is null` suggests that `HashicorpVaultClient.resolveSecret` is looking for a specific key in the JSON response (likely inside the `data` object) and failing to find it.

Based on the source code for [HashicorpVaultClient.java ](https://github.com/eclipse-edc/Connector/blob/19554e932c0fb725fe871841241d400269c870ca/extensions/common/vault/vault-hashicorp/src/main/java/org/eclipse/edc/vault/hashicorp/HashicorpVaultClient.java#L47)(v0.15.1), the code does:
```java
return payload.path("data").path("data").get(VAULT_DATA_ENTRY_NAME).asText();
```
where `VAULT_DATA_ENTRY_NAME` is `"content"`.

This implies it expects a structure like:
```json
{
  "data": {
    "data": {
      "content": "..."
    }
  }
}
```
This structure is specific to **KV v2** responses. However, we are seeing this error even when we try to use KV v1 paths, or when we try to use KV v2.

If we use KV v1, the response structure is:
```json
{
  "data": {
    "content": "..."
  }
}
```
In this case, `payload.path("data").path("data")` would return a MissingNode (not null), but `.get("content")` on that MissingNode would return null, causing the NPE on `.asText()`.

**Conclusion:** The `HashicorpVaultClient` in 0.15.1 seems hardcoded to expect the KV v2 response structure (nested `data.data`). It does not seem to support KV v1 structure or auto-detect it.

### 3. Preceding Issue: URL Encoding with DID Aliases
Before hitting the NPE, we struggled with `404 Secret not found` errors when using the actual DID-based alias (`did:web:consumer-identityhub:7083-sts-client-secret`).

We analyzed the URL construction in `HashicorpVaultClient`:
```java
key = URLEncoder.encode(key, StandardCharsets.UTF_8);
// ...
builder.addPathSegments(sanitizedKey)
```
`HttpUrl.addPathSegments` **encodes the path segments again**.

- **Input Key:** `did:web:consumer-identityhub:7083-sts-client-secret`
- **URLEncoder:** `did%3Aweb%3Aconsumer-identityhub%3A7083-sts-client-secret`
- **HttpUrl:** `.../did%253Aweb%253Aconsumer-identityhub%253A7083-sts-client-secret` (Double Encoded!)

This explains why our initial attempts failed. The client double-encodes the key. Vault expects the key to be part of the path.

## Questions
1. Is `HashicorpVaultClient` intended to support only KV v2?
2. Is the double-encoding behavior in `getSecretUrl` intentional? It seems to break keys with special characters like colons unless the Vault is configured to expect double-encoded paths (which is unusual).

## Recommendation
1. **Fix NPE:** Add a check for the existence of the node before calling `.asText()`, or support both KV v1 and v2 structures.
2. **Fix Encoding:** Avoid double-encoding. `URLEncoder.encode` followed by `addPathSegments` (which encodes) is problematic. Use `addEncodedPathSegments` or don't pre-encode.
