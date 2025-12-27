# Protocol Compliance Testing

This module contains Technology Compatibility Kit (TCK) tests for verifying MVD's compliance with:
- **DSP (Dataspace Protocol) 2025-1**: ~140 test cases for catalog, negotiation, transfer protocols
- **DCP (Decentralized Claims Protocol) 1.0**: Verifiable Presentation and Credential Issuance protocols

## Prerequisites

1. **Running MVD Dataspace** - Start the complete dataspace before running TCK tests:
   ```bash
   # Option A: IntelliJ
   # Run .run/dataspace compound configuration
   # Run ./seed.sh
   
   # Option B: Docker Compose
   cd deployment && docker compose up -d
   cd .. && ./seed.sh
   
   # Option C: Kubernetes
   # ... (see WARP.md for full deployment)
   ./seed-k8s.sh
   ```

2. **TCK Dependencies** - The test module uses SNAPSHOT versions from Sonatype:
   - `org.eclipse.dataspacetck:boot:0.1.0-SNAPSHOT`
   - `org.eclipse.dataspacetck:dsp:0.1.0-SNAPSHOT`
   - `org.eclipse.dataspacetck:dcp-tck:0.1.0-SNAPSHOT`

## Running Protocol Compliance Tests

### DSP TCK Tests

```bash
# Run all DSP protocol compliance tests
./gradlew :tests:protocol-compliance:test -PrunProtocolComplianceTests=true

# Run with custom endpoint configuration
./gradlew :tests:protocol-compliance:test \
  -PrunProtocolComplianceTests=true \
  -Ptck.dsp.base.url=http://localhost \
  -Ptck.dsp.protocol.url=http://provider-qna-controlplane:8082
```

### DCP TCK Tests

```bash
# Run all DCP protocol compliance tests
./gradlew :tests:protocol-compliance:test \
  -PrunProtocolComplianceTests=true \
  -Ptck.dcp.cs.url=http://provider-identityhub:7083/api/identity/v1alpha
```

### Why Tests Are Disabled by Default

Protocol compliance tests:
- Require a **fully running MVD dataspace** (8+ services)
- Take **5-10 minutes** to complete
- Are **integration tests**, not unit tests
- Should run in **CI/CD on dedicated infrastructure**

Enable them explicitly with `-PrunProtocolComplianceTests=true`.

## Test Coverage

### DSP TCK Tests

| Test Group | Description | Test Count |
|------------|-------------|------------|
| **MET:XX-XX** | Metadata endpoint compliance | ~10 tests |
| **CAT:XX-XX** | Catalog protocol | ~30 tests |
| **CN:XX-XX** | Contract negotiation (provider) | ~40 tests |
| **CN_C:XX-XX** | Contract negotiation (consumer) | ~20 tests |
| **TP:XX-XX** | Transfer process (provider) | ~30 tests |
| **TP_C:XX-XX** | Transfer process (consumer) | ~10 tests |

**Total**: ~140 DSP protocol compliance tests

### DCP TCK Tests

| Test Package | Description | System Under Test |
|--------------|-------------|-------------------|
| `dcp.verification.presentation.cs` | Verifiable Presentation Protocol | Credential Service |
| `dcp.verification.presentation.verifier` | Verifiable Presentation Protocol | Verifier |
| `dcp.verification.issuance.cs` | Credential Issuance Protocol | Credential Service |
| `dcp.verification.issuance.issuer` | Credential Issuance Protocol | Issuer Service |

## Configuration

### DSP TCK Configuration Properties

The TCK tests use the following configuration (can be overridden via Gradle properties):

```properties
# Connector under test base URL
dataspacetck.dsp.connector.base.url=http://localhost

# DSP protocol endpoint URL
dataspacetck.dsp.connector.protocol.url=http://provider-qna-controlplane:8082

# Connector agent ID
dataspacetck.dsp.connector.agent.id=did:web:provider-identityhub:provider

# TCK server configuration
dataspacetck.dsp.tck.hostname=localhost
dataspacetck.dsp.tck.port=8080

# Test-specific configuration (examples)
CAT_01_01_DATASETID=asset-1
CN_01_01_DATASETID=asset-1
CN_01_01_OFFERID=<offer-id-from-catalog>
```

### DCP TCK Configuration Properties

```properties
# Credential Service URL
dataspacetck.dcp.cs.url=http://provider-identityhub:7083/api/identity/v1alpha

# Verifier DID
dataspacetck.dcp.verifier.did=did:web:consumer-identityhub:consumer

# Issuer Service URL
dataspacetck.dcp.issuer.url=http://dataspace-issuer-service:10016

# Secure Token Service URL
dataspacetck.dcp.sts.url=http://provider-identityhub:7083/api/identity/v1alpha/sts
```

## CI/CD Integration

### GitHub Actions

```yaml
# Add to .github/workflows/test.yml
protocol-compliance:
  name: Protocol Compliance Tests
  runs-on: ubuntu-latest
  needs: build-jars
  
  steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Deploy MVD to Kubernetes
      run: |
        kind create cluster -n mvd
        # ... deploy MVD
        ./seed-k8s.sh
    
    - name: Run Protocol Compliance Tests
      run: ./gradlew :tests:protocol-compliance:test -PrunProtocolComplianceTests=true
    
    - name: Upload TCK reports
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: tck-reports
        path: tests/protocol-compliance/build/reports/
```

## Troubleshooting

### Tests Fail with "Connection refused"

**Cause**: MVD dataspace not running or endpoints not accessible

**Solution**:
1. Verify all services healthy: `docker ps` or check IntelliJ
2. Check endpoint URLs match your deployment
3. Verify seed script completed: `./seed.sh`

### Tests Timeout

**Cause**: TCK tests take time (~5-10 minutes total)

**Solution**:
- Increase timeout: `-Djunit.jupiter.execution.timeout.default=10m`
- Run test subsets instead of full suite

### Snapshot Dependencies Not Found

**Cause**: TCK artifacts not yet in Sonatype snapshots repository

**Solution**:
1. Check https://github.com/eclipse-dataspacetck/dsp-tck for latest versions
2. Update `build.gradle.kts` with correct version
3. Build TCK locally if needed:
```bash
git clone https://github.com/eclipse-dataspacetck/dsp-tck
cd dsp-tck
./gradlew publishToMavenLocal
```

### DID Resolution Failures

**Cause**: DID documents not accessible or improperly configured

**Solution**:
1. Verify NGINX running: `docker ps | grep nginx`
2. Check DID documents accessible:
```bash
curl http://localhost:7083/.well-known/did.json  # consumer
curl http://localhost:7083/.well-known/did.json  # provider
```

## References

- [DSP TCK GitHub](https://github.com/eclipse-dataspacetck/dsp-tck)
- [DCP TCK GitHub](https://github.com/eclipse-dataspacetck/dcp-tck)
- [DSP Specification 2025-1](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1/)
- [DCP Specification 1.0](https://eclipse-dataspace-dcp.github.io/decentralized-claims-protocol/v1.0/)
- [MVD Testing Guide](../../docs/TESTING.md)

## Current Status

⚠️ **Work in Progress**: Protocol compliance tests are currently under development.

**Completed**:
- ✅ Test module structure created
- ✅ Build configuration with TCK dependencies
- ✅ Documentation (this README)

**TODO**:
- ⏳ Wrapper test classes for DSP TCK
- ⏳ Wrapper test classes for DCP TCK
- ⏳ Configuration files (tck.properties)
- ⏳ CI/CD integration
- ⏳ Test fixtures and utilities

These tests will be completed incrementally as TCK artifacts become available in stable releases.
