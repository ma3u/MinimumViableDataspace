# Extension Development Guide

This guide explains the core extensions in the Minimum Viable Dataspace (MVD) template and how to create custom extensions for domain-specific dataspaces.

## Overview

MVD uses Eclipse Dataspace Components (EDC) as its foundation. EDC provides a Service Provider Interface (SPI) that allows you to extend functionality through **extensions**. This document covers:

1. Understanding existing MVD extensions
2. How to create custom extensions
3. Extension patterns from real-world dataspaces
4. Troubleshooting and debugging

---

## Existing MVD Extensions

MVD provides four core extensions that handle policy evaluation, identity, and discovery:

### 1. DCP Implementation (`extensions/dcp-impl/`)

**Purpose**: Implements Decentralized Claims Protocol (DCP) for credential-based access control

**Key Components**:

#### `DcpPatchExtension.java`
Registers DCP infrastructure at runtime:
- **Signature Suite**: JWS 2020 for verifiable credential signatures
- **Trusted Issuers**: Registers dataspace issuer DIDs (issuer, localhost:9876, localhost:10100)
- **Scope Mapping**: Maps policies to required credential scopes
- **Post-Validators**: Adds MembershipCredential scope to all DSP requests (catalog, negotiation, transfer)

```java
// Registers MembershipCredential as required for all requests
var contextMappingFunction = new DefaultScopeMappingFunction(
    Set.of("org.eclipse.edc.vc.type:MembershipCredential:read")
);
policyEngine.registerPostValidator(RequestCatalogPolicyContext.class, 
    contextMappingFunction::apply);
```

#### `MembershipCredentialEvaluationFunction.java`
Policy evaluation function for `MembershipCredential` constraints:

```java
// ODRL Policy Example
{
  "odrl:constraint": [{
    "odrl:leftOperand": "MembershipCredential",
    "odrl:operator": "eq",
    "odrl:rightOperand": "active"
  }]
}
```

**How it works**:
1. Extracts credentials from ParticipantAgent
2. Filters credentials by type `MembershipCredential`
3. Checks `membership.since` claim is before current time
4. Returns `true` if valid membership found, `false` otherwise

**Domain customization**: Replace `MembershipCredential` with domain-specific credential types (e.g., `HealthcareLicense`, `EnergyOperatorCredential`)

#### `DataAccessLevelFunction.java`
Policy evaluation function for `DataProcessorCredential` with access levels:

```java
// ODRL Policy Example
{
  "odrl:duty": [{
    "odrl:constraint": [{
      "odrl:leftOperand": "DataAccess.level",
      "odrl:operator": "eq",
      "odrl:rightOperand": "processing"  // or "sensitive"
    }]
  }]
}
```

**How it works**:
1. Looks for `DataProcessorCredential` in participant's credentials
2. Checks `level` claim matches required level (e.g., "processing", "sensitive")
3. Validates `contractVersion` is present

**Domain customization**: Add custom access levels for your domain (e.g., "read-only", "write", "admin" for Health; "TSO", "DSO" for Energy)

#### `PolicyEvaluationExtension.java`
Registers policy functions with EDC Policy Engine:

```java
// Binds MembershipCredentialEvaluationFunction to catalog, negotiation, transfer
bindPermissionFunction(
    MembershipCredentialEvaluationFunction.create(),
    CatalogPolicyContext.class,
    CatalogPolicyContext.CATALOG_SCOPE,
    MEMBERSHIP_CONSTRAINT_KEY
);
```

**Scopes**:
- `CATALOG_SCOPE` - Evaluated when querying catalog
- `NEGOTIATION_SCOPE` - Evaluated during contract negotiation
- `TRANSFER_SCOPE` - Evaluated during data transfer

---

### 2. DID Resolution (`extensions/did-example-resolver/`)

**Purpose**: Resolves did:web DIDs for participant identity verification

#### `SecretsExtension.java`
Seeds private/public keypair into vault for **IntelliJ deployment only**:

```java
// Hard-coded EC keypair (P-256 curve)
// WARNING: Only for development/testing! Production should use HSM/Azure Key Vault
vault.storeSecret(STS_PRIVATE_KEY_ALIAS, privateKey);
vault.storeSecret(STS_PUBLIC_KEY_ID, publicKey);
```

**Why this exists**:
- IntelliJ deployment uses in-memory vault (no persistence)
- Keys must be seeded at startup for STS (Security Token Service)
- Docker Compose and Kubernetes use HashiCorp Vault (persistent)

**Security Note**: This extension only activates if vault is `InMemoryVault` (checked via class name)

**Domain customization**:
- Replace with HSM integration for production (Azure Key Vault, HashiCorp Vault, AWS KMS)
- Add support for other key algorithms (RSA, Ed25519)
- Implement key rotation logic

---

### 3. Catalog Node Resolution (`extensions/catalog-node-resolver/`)

**Purpose**: Discovers other dataspace participants via federated catalog

#### `LazyLoadNodeDirectory.java`
Implements `TargetNodeDirectory` to resolve participant DIDs from a static file:

```java
// Reads deployment/assets/participants file
// Format: {"participantName": "did:web:example.com:participant-id"}
var entries = mapper.readValue(participantListFile, MAP_TYPE);

return entries.entrySet().stream()
    .map(e -> createNode(e.getKey(), e.getValue()))
    .toList();
```

**How it works**:
1. Reads JSON file with participant name → DID mapping
2. Resolves each DID to get DID document
3. Extracts `ProtocolEndpoint` service from DID document
4. Creates `TargetNode` with DSP endpoint URL

**Example participants file**:
```json
{
  "consumer": "did:web:localhost%3A7083:consumer",
  "provider-qna": "did:web:localhost%3A7183:provider-qna",
  "provider-manufacturing": "did:web:localhost%3A7283:provider-manufacturing"
}
```

**Domain customization**:
- Replace with dynamic catalog query (Catena-X Federated Catalog pattern)
- Add caching layer (Redis, in-memory cache)
- Implement participant registration API
- Connect to production catalog services (BPDS for Catena-X, MDS catalog for Mobility)

---

### 4. IdentityHub Initialization (`extensions/superuser-seed/`)

**Purpose**: Seeds initial "super-user" ParticipantContext in IdentityHub for RBAC

#### `ParticipantContextSeedExtension.java`
Creates super-user with admin role:

```java
participantContextService.createParticipantContext(
    ParticipantManifest.Builder.newInstance()
        .participantId("super-user")
        .did("did:web:super-user")
        .active(true)
        .key(KeyDescriptor.Builder.newInstance()
            .keyGeneratorParams(Map.of("algorithm", "EdDSA", "curve", "Ed25519"))
            .keyId("super-user-key")
            .build())
        .roles(List.of(ServicePrincipal.ROLE_ADMIN))
        .build()
);
```

**Why this exists**:
- IdentityHub requires at least one ParticipantContext to store credentials
- Super-user has admin role to create/manage other participants
- API key generated and logged at startup

**Domain customization**:
- Add additional initial participants (e.g., "dataspace-admin", "compliance-auditor")
- Customize roles based on domain (e.g., "clinician", "researcher" for Health)
- Implement participant onboarding workflow

---

## Creating Custom Extensions

### Extension Anatomy

All EDC extensions implement the `ServiceExtension` interface:

```java
package com.example.mydomain;

import org.eclipse.edc.runtime.metamodel.annotation.Inject;
import org.eclipse.edc.spi.system.ServiceExtension;
import org.eclipse.edc.spi.system.ServiceExtensionContext;

public class MyCustomExtension implements ServiceExtension {
    
    @Inject
    private PolicyEngine policyEngine;  // Injected by EDC runtime
    
    @Override
    public String name() {
        return "My Custom Extension";
    }
    
    @Override
    public void initialize(ServiceExtensionContext context) {
        // Called during startup - register services here
    }
    
    @Override
    public void start() {
        // Called after all extensions initialized - start services here
    }
}
```

### Build Configuration

Create `build.gradle.kts`:

```kotlin
plugins {
    `java-library`
}

dependencies {
    implementation(libs.edc.spi.core)           // Core SPI
    implementation(libs.edc.spi.policy)         // Policy engine SPI
    implementation(libs.edc.spi.identity.trust) // Identity/credentials SPI
}
```

Register extension in `resources/META-INF/services/org.eclipse.edc.spi.system.ServiceExtension`:

```
com.example.mydomain.MyCustomExtension
```

---

## Domain-Specific Extension Examples

### Example 1: Health Dataspace - FHIR Resource Policy Function

**Use Case**: Validate that requestor has `HealthcareLicenseCredential` with appropriate specialty

```java
package org.eclipse.edc.demo.health.policy;

import org.eclipse.edc.participant.spi.ParticipantAgentPolicyContext;
import org.eclipse.edc.policy.engine.spi.AtomicConstraintRuleFunction;
import org.eclipse.edc.policy.model.Operator;
import org.eclipse.edc.policy.model.Permission;

public class HealthcareLicenseFunction<C extends ParticipantAgentPolicyContext> 
        extends AbstractCredentialEvaluationFunction 
        implements AtomicConstraintRuleFunction<Permission, C> {
    
    public static final String HEALTHCARE_LICENSE_KEY = "HealthcareLicense";
    
    @Override
    public boolean evaluate(Operator operator, Object rightOperand, 
                          Permission permission, C policyContext) {
        if (!operator.equals(Operator.EQ)) {
            policyContext.reportProblem("Only EQ operator supported");
            return false;
        }
        
        var requiredSpecialty = (String) rightOperand; // e.g., "cardiology", "radiology"
        var pa = policyContext.participantAgent();
        var credentials = getCredentialList(pa);
        
        return credentials.getContent().stream()
            .filter(vc -> vc.getType().contains("HealthcareLicenseCredential"))
            .flatMap(vc -> vc.getCredentialSubject().stream())
            .anyMatch(cs -> {
                var specialty = cs.getClaim("healthcare", "specialty");
                var licenseExpiry = cs.getClaim("healthcare", "validUntil");
                return specialty.equals(requiredSpecialty) 
                    && Instant.parse(licenseExpiry).isAfter(Instant.now());
            });
    }
}
```

**ODRL Policy**:
```json
{
  "odrl:permission": [{
    "odrl:action": "odrl:use",
    "odrl:constraint": [{
      "odrl:leftOperand": "HealthcareLicense",
      "odrl:operator": "eq",
      "odrl:rightOperand": "cardiology"
    }]
  }]
}
```

---

### Example 2: Energy Dataspace - TSO/DSO Authorization Function

**Use Case**: Validate grid operator credentials for balancing data access

```java
package org.eclipse.edc.demo.energy.policy;

public class GridOperatorLicenseFunction<C extends ParticipantAgentPolicyContext> 
        extends AbstractCredentialEvaluationFunction 
        implements AtomicConstraintRuleFunction<Permission, C> {
    
    public static final String GRID_OPERATOR_KEY = "GridOperatorLicense";
    
    @Override
    public boolean evaluate(Operator operator, Object rightOperand, 
                          Permission permission, C policyContext) {
        var requiredType = (String) rightOperand; // "TSO" or "DSO"
        var credentials = getCredentialList(policyContext.participantAgent());
        
        return credentials.getContent().stream()
            .filter(vc -> vc.getType().contains("GridOperatorCredential"))
            .flatMap(vc -> vc.getCredentialSubject().stream())
            .anyMatch(cs -> {
                var operatorType = cs.getClaim("energy", "operatorType");
                var gridArea = cs.getClaim("energy", "gridArea");
                return operatorType.equals(requiredType) && gridArea != null;
            });
    }
}
```

**ODRL Policy (Energy-Data-X pattern)**:
```json
{
  "odrl:permission": [{
    "odrl:action": "odrl:use",
    "odrl:constraint": [
      {
        "odrl:leftOperand": "GridOperatorLicense",
        "odrl:operator": "eq",
        "odrl:rightOperand": "TSO"
      },
      {
        "odrl:leftOperand": "energy:DataPurpose",
        "odrl:operator": "eq",
        "odrl:rightOperand": "balancing"
      }
    ]
  }]
}
```

---

### Example 3: Mobility Dataspace - Real-Time Data Time Window

**Use Case**: Allow real-time traffic data access only during specific time windows

```java
package org.eclipse.edc.demo.mobility.policy;

public class RealTimeDataWindowFunction<C extends ParticipantAgentPolicyContext> 
        implements AtomicConstraintRuleFunction<Permission, C> {
    
    @Override
    public boolean evaluate(Operator operator, Object rightOperand, 
                          Permission permission, C policyContext) {
        if (!operator.equals(Operator.LTEQ)) {
            policyContext.reportProblem("Only LTEQ operator supported for time windows");
            return false;
        }
        
        // rightOperand is max age in seconds (e.g., 300 for 5 minutes)
        var maxAgeSeconds = Integer.parseInt(rightOperand.toString());
        
        // Check if requestor's credential includes real-time data access
        var credentials = getCredentialList(policyContext.participantAgent());
        return credentials.getContent().stream()
            .filter(vc -> vc.getType().contains("MobilityDataAccessCredential"))
            .flatMap(vc -> vc.getCredentialSubject().stream())
            .anyMatch(cs -> {
                var accessLevel = cs.getClaim("mobility", "accessLevel");
                return "realtime".equals(accessLevel);
            });
    }
}
```

---

### Example 4: Education Dataspace - Learner Consent Verification (Prometheus-X pattern)

**Use Case**: Verify learner has granted explicit consent for data access

```java
package org.eclipse.edc.demo.education.policy;

public class LearnerConsentFunction<C extends ParticipantAgentPolicyContext> 
        extends AbstractCredentialEvaluationFunction 
        implements AtomicConstraintRuleFunction<Permission, C> {
    
    @Override
    public boolean evaluate(Operator operator, Object rightOperand, 
                          Permission permission, C policyContext) {
        var requiredConsentType = (String) rightOperand; // e.g., "diploma-sharing"
        var credentials = getCredentialList(policyContext.participantAgent());
        
        return credentials.getContent().stream()
            .filter(vc -> vc.getType().contains("LearnerConsentCredential"))
            .flatMap(vc -> vc.getCredentialSubject().stream())
            .anyMatch(cs -> {
                var consentType = cs.getClaim("education", "consentType");
                var expiresAt = cs.getClaim("education", "expiresAt");
                return consentType.equals(requiredConsentType) 
                    && Instant.parse(expiresAt).isAfter(Instant.now());
            });
    }
}
```

---

## EDC SPI Extension Points

### Common SPIs for Extension Development

| SPI | Purpose | Example Use |
|-----|---------|-------------|
| `PolicyEngine` | Register policy evaluation functions | Custom ODRL constraint evaluation |
| `DidResolverRegistry` | Register DID resolution methods | Support did:key, did:ion, did:example |
| `TrustedIssuerRegistry` | Register trusted credential issuers | Dataspace issuer, domain-specific issuers |
| `ScopeExtractorRegistry` | Map policies to credential scopes | Extract required scopes from ODRL |
| `SignatureSuiteRegistry` | Register signature algorithms | JWS 2020, JsonWebSignature2020 |
| `Vault` | Store/retrieve secrets | Private keys, API keys |
| `ParticipantContextService` | Manage IdentityHub participants | Create participants, assign roles |
| `TargetNodeDirectory` | Federated catalog participant list | Participant discovery |

### Extension Lifecycle Hooks

```java
public interface ServiceExtension {
    // 1. Called first - return extension name
    default String name() { return getClass().getSimpleName(); }
    
    // 2. Called during startup - register services
    default void initialize(ServiceExtensionContext context) {}
    
    // 3. Called after all extensions initialized
    default void start() {}
    
    // 4. Called during shutdown
    default void shutdown() {}
}
```

---

## Debugging Extensions

### IntelliJ IDEA

1. **Set breakpoint** in extension code
2. **Run dataspace compound configuration** (`.run/dataspace.run.xml`)
3. Extension loads during runtime initialization
4. Breakpoint hits when extension method called

**Tip**: Extensions load in order of dependencies. Check logs:
```
INFO [Extension Lifecycle] Initializing extension: DcpPatchExtension
INFO [Extension Lifecycle] Initializing extension: PolicyEvaluationExtension
```

### Docker Compose

Extensions are compiled into runtime JARs. To debug:

1. **Enable remote debugging** in `docker-compose.yml`:
```yaml
environment:
  JAVA_TOOL_OPTIONS: "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
ports:
  - "5005:5005"  # Remote debug port
```

2. **Attach IntelliJ debugger**: Run → Attach to Process → localhost:5005

### Kubernetes

Enable remote debugging for pod:

```bash
# Port-forward debug port
kubectl port-forward -n mvd service/consumer-controlplane 5005:5005

# Attach IntelliJ debugger to localhost:5005
```

---

## Troubleshooting

### Extension Not Loading

**Problem**: Extension not found at runtime

**Checklist**:
- [ ] `META-INF/services/org.eclipse.edc.spi.system.ServiceExtension` exists?
- [ ] Fully qualified class name listed in service file?
- [ ] Extension module included in launcher `build.gradle.kts`?
- [ ] Extension compiled (`./gradlew :extensions:my-extension:build`)?

**Example launcher dependency**:
```kotlin
// launchers/controlplane/build.gradle.kts
dependencies {
    implementation(project(":extensions:my-custom-extension"))
}
```

---

### Policy Function Not Evaluating

**Problem**: Custom policy function never called

**Checklist**:
- [ ] Policy function registered with `PolicyEngine.registerFunction()`?
- [ ] Constraint key bound to scope with `RuleBindingRegistry.bind()`?
- [ ] ODRL policy uses correct `odrl:leftOperand` key?
- [ ] Policy applied to asset/contract definition?

**Debug pattern**:
```java
@Override
public boolean evaluate(...) {
    context.getMonitor().debug("MyPolicyFunction.evaluate() called");
    // Your logic here
}
```

---

### DID Resolution Fails

**Problem**: `DidResolverRegistry.resolve(did)` returns failure

**Checklist**:
- [ ] DID format correct? (e.g., `did:web:localhost%3A7083:participant`)
- [ ] DID document accessible at `https://{domain}/.well-known/did.json`?
- [ ] DID resolver registered for method? (did:web resolver included by default)
- [ ] Network connectivity to DID document URL?

**Test DID resolution manually**:
```bash
# For did:web:localhost%3A7083:participant
curl http://localhost:7083/.well-known/did.json
```

---

### Credential Validation Fails

**Problem**: Valid credential rejected by policy function

**Checklist**:
- [ ] Credential type matches expected type? (case-sensitive)
- [ ] Credential issuer registered in `TrustedIssuerRegistry`?
- [ ] Credential not expired? (check `expirationDate`)
- [ ] Credential signature valid? (check `SignatureSuiteRegistry`)
- [ ] Claim namespace correct? (e.g., `"mvd"`, `"healthcare"`, `"energy"`)

**Debug credential structure**:
```java
credentials.forEach(vc -> {
    monitor.info("Credential type: " + vc.getType());
    monitor.info("Credential subject claims: " + vc.getCredentialSubject().get(0).getClaims());
});
```

---

## Best Practices

### 1. Fail-Safe Policy Evaluation
Always return `false` and report problem on error:
```java
if (operator != Operator.EQ) {
    policyContext.reportProblem("Unsupported operator: " + operator);
    return false;  // Deny access
}
```

### 2. Namespace Isolation
Use domain-specific namespaces for claims:
```java
// Good: Domain-specific namespace
var specialty = cs.getClaim("healthcare", "specialty");

// Bad: Generic namespace (collisions possible)
var specialty = cs.getClaim("specialty");
```

### 3. Logging for Audit Trail
Log policy decisions for compliance:
```java
monitor.info("Policy evaluation: MembershipCredential - %s"
    .formatted(result ? "ALLOWED" : "DENIED"));
```

### 4. Extension Configuration
Make extensions configurable via settings:
```java
@Setting(value = "Custom issuer DID")
private static final String ISSUER_DID_PROPERTY = "edc.custom.issuer.did";

var issuerDid = context.getSetting(ISSUER_DID_PROPERTY, "did:web:default");
```

---

## References

### MVD Extensions
- `extensions/dcp-impl/` - DCP protocol and policy functions
- `extensions/did-example-resolver/` - DID resolution for demo
- `extensions/catalog-node-resolver/` - Participant discovery
- `extensions/superuser-seed/` - IdentityHub initialization

### EDC Documentation
- [EDC Extension Model](https://eclipse-edc.github.io/docs/#/submodule/Connector/docs/developer/architecture)
- [Policy Engine SPI](https://eclipse-edc.github.io/docs/#/submodule/Connector/docs/developer/policy-engine)
- [Identity Trust SPI](https://github.com/eclipse-edc/Connector/tree/main/spi/common/identity-trust-spi)

### Real-World Dataspace Patterns
- Catena-X: CX-0152 (Policy Constraints), CX-0050 (Credentials)
- Energy-Data-X: Grid operator credentials, balancing purpose constraints
- EONA-X: Traveler consent, multimodal booking authorization
- Prometheus-X: Learner consent, Personal Data Intermediary (PDI)

See `.specify/REAL-WORLD-DATASPACE-EXAMPLES.md` for comprehensive patterns.
