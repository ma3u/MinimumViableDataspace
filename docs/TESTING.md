# Testing Guide for Minimum Viable Dataspace (MVD)

This guide covers all testing approaches for MVD core components, from unit tests to end-to-end protocol tests.

## Table of Contents
- [Quick Start](#quick-start)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Run all unit tests
./gradlew test

# Run specific module tests
./gradlew :extensions:dcp-impl:test

# Run with coverage report
./gradlew test jacocoRootReport

# View coverage report
open build/reports/jacoco/jacocoRootReport/html/index.html

# Run end-to-end tests (requires running dataspace)
./gradlew :tests:end2end:test
```

---

## Test Types

### 1. Unit Tests

**Purpose**: Test individual components in isolation

**Location**: `<module>/src/test/java/`

**Framework**: JUnit 5 + Mockito + AssertJ

**Examples**:
- Policy evaluation functions (`extensions/dcp-impl`)
- DID resolution logic (`extensions/did-example-resolver`)
- Catalog participant discovery (`extensions/catalog-node-resolver`)

**When to Use**:
- Testing business logic without external dependencies
- Fast feedback during development
- High coverage of edge cases

### 2. Integration Tests

**Purpose**: Test components working together with real dependencies

**Framework**: JUnit 5 + Testcontainers (planned)

**Examples** (planned):
- IdentityHub credential issuance with real vault
- Policy evaluation with real credential validation
- Catalog discovery with multiple participants

**When to Use**:
- Testing component interactions
- Validating configuration correctness
- Database schema validation

### 3. End-to-End (E2E) Tests

**Purpose**: Test complete DSP protocol flows

**Location**: `tests/end2end/`

**Framework**: JUnit 5 + RestAssured + Awaitility

**Coverage**:
- ✅ Full transfer flow (catalog → negotiation → transfer → EDR)
- ✅ Credential issuance flow
- ⚠️ Catalog query and filtering (partial)
- ⚠️ Policy-based access control (partial)

**Prerequisites**:
- Running MVD dataspace (IntelliJ/Docker Compose/Kubernetes)
- Seeded data (`./seed.sh` or `./seed-k8s.sh`)

**When to Use**:
- Validating complete user workflows
- Testing deployment configurations
- Regression testing

---

## Running Tests

### Unit Tests

```bash
# All modules
./gradlew test

# Specific module
./gradlew :extensions:dcp-impl:test

# Specific test class
./gradlew :extensions:dcp-impl:test --tests MembershipCredentialEvaluationFunctionTest

# Specific test method
./gradlew :extensions:dcp-impl:test --tests MembershipCredentialEvaluationFunctionTest.evaluate_withValidMembershipCredential_shouldReturnTrue

# With detailed output
./gradlew test --info

# Fail fast (stop on first failure)
./gradlew test --fail-fast
```

### End-to-End Tests

**Step 1**: Start MVD dataspace

```bash
# Option A: IntelliJ
# 1. Run .run/dataspace compound configuration
# 2. Wait for all services healthy (~30-60 seconds)
# 3. Run ./seed.sh

# Option B: Docker Compose
cd deployment
docker compose up -d
cd ..
./seed.sh

# Option C: Kubernetes
kind create cluster -n mvd --config deployment/kind.config.yaml
# ... (full deployment steps in WARP.md)
./seed-k8s.sh
```

**Step 2**: Run E2E tests

```bash
# All E2E tests
./gradlew :tests:end2end:test

# Specific E2E test
./gradlew :tests:end2end:test --tests TransferEndToEndTest

# With logs
./gradlew :tests:end2end:test --info
```

### Checkstyle

```bash
# Run checkstyle on all modules
./gradlew checkstyleMain checkstyleTest

# View checkstyle reports
open build/reports/checkstyle/main.html
```

---

## Writing Tests

### Unit Test Template

```java
package org.eclipse.edc.demo.extension;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class MyComponentTest {

    private MyComponent component;
    private Dependency mockDependency;

    @BeforeEach
    void setUp() {
        mockDependency = mock(Dependency.class);
        component = new MyComponent(mockDependency);
    }

    @Test
    void testHappyPath() {
        // Arrange
        when(mockDependency.someMethod()).thenReturn("expected");

        // Act
        var result = component.doSomething();

        // Assert
        assertThat(result).isEqualTo("expected");
        verify(mockDependency).someMethod();
    }

    @Test
    void testErrorHandling() {
        // Arrange
        when(mockDependency.someMethod()).thenThrow(new RuntimeException("error"));

        // Act & Assert
        assertThat(component.doSomething()).isFalse();
    }
}
```

### Test Naming Convention

Use descriptive names following the pattern: `methodName_condition_expectedResult`

**Examples**:
- `evaluate_withValidMembershipCredential_shouldReturnTrue`
- `resolve_withInvalidDidFormat_shouldReturnFailure`
- `discover_whenNoParticipantsAvailable_shouldReturnEmptyList`

### EDC-Specific Test Patterns

#### Testing Policy Functions

```java
@Test
void testPolicyFunction() {
    var function = MyPolicyFunction.create();
    var policyContext = mock(ParticipantAgentPolicyContext.class);
    var permission = mock(Permission.class);
    var participantAgent = mock(ParticipantAgent.class);
    
    when(policyContext.participantAgent()).thenReturn(participantAgent);
    when(participantAgent.getClaims()).thenReturn(Map.of("vc", vcList));
    
    var result = function.evaluate(Operator.EQ, "expected", permission, policyContext);
    
    assertThat(result).isTrue();
    verify(policyContext, never()).reportProblem(anyString());
}
```

#### Testing with Verifiable Credentials

```java
private VerifiableCredential createTestCredential() {
    return VerifiableCredential.Builder.newInstance()
            .type("TestCredential")
            .credentialSubject(CredentialSubject.Builder.newInstance()
                    .id("subject-123")
                    .claim("namespace:claim", Map.of("key", "value"))
                    .build())
            .build();
}
```

### Adding Tests to New Extensions

1. **Create test directory**:
```bash
mkdir -p extensions/my-extension/src/test/java/org/eclipse/edc/demo/myext
```

2. **Add test dependencies** to `build.gradle.kts`:
```kotlin
dependencies {
    implementation(...)
    
    testImplementation(libs.edc.junit)
}
```

3. **Write tests** following naming conventions

4. **Run tests**:
```bash
./gradlew :extensions:my-extension:test
```

---

## Test Coverage

### Viewing Coverage Reports

```bash
# Generate coverage for all modules
./gradlew test jacocoRootReport

# Open HTML report
open build/reports/jacoco/jacocoRootReport/html/index.html

# View XML report (for CI tools)
cat build/reports/jacoco/jacocoRootReport/jacocoRootReport.xml
```

### Coverage Goals

| Component Type | Target Coverage |
|----------------|----------------|
| Policy Functions | 90%+ |
| Core Extensions | 80%+ |
| Utility Classes | 85%+ |
| Launchers | 50%+ (integration tested) |

### Interpreting Coverage

- **Green (80%+)**: Good coverage
- **Yellow (60-80%)**: Needs improvement
- **Red (<60%)**: Insufficient coverage

**Note**: Coverage is a metric, not a goal. Focus on meaningful tests over coverage percentage.

---

## CI/CD Integration

### GitHub Actions Workflows

MVD includes three CI/CD workflows:

#### 1. Test Workflow (`.github/workflows/test.yml`)

**Triggers**: Push to main, Pull requests

**Jobs**:
- Run unit tests (Java 17, 21 matrix)
- Generate JaCoCo coverage reports
- Upload test results and coverage artifacts
- Comment PR with coverage report

**Usage**:
```bash
# Runs automatically on push/PR
# View results: GitHub Actions tab
```

#### 2. Build Workflow (`.github/workflows/build.yml`)

**Triggers**: Push to main, Tags

**Jobs**:
- Build JAR files with persistence
- Build and push Docker images to GHCR
- Create build summary

**Images Published**:
- `ghcr.io/<owner>/mvd-controlplane:main`
- `ghcr.io/<owner>/mvd-dataplane:main`
- `ghcr.io/<owner>/mvd-identity-hub:main`
- `ghcr.io/<owner>/mvd-catalog-server:main`
- `ghcr.io/<owner>/mvd-issuerservice:main`

### Local CI Simulation

```bash
# Simulate test workflow
./gradlew test checkstyleMain checkstyleTest jacocoRootReport

# Simulate build workflow
./gradlew build -Ppersistence=true
./gradlew -Ppersistence=true dockerize
```

---

## Troubleshooting

### Common Issues

#### Tests Fail with "No such method" Errors

**Cause**: Mockito version mismatch or EDC API changes

**Solution**:
```bash
# Clean and rebuild
./gradlew clean test --refresh-dependencies
```

#### E2E Tests Timeout

**Cause**: Dataspace not fully started or not seeded

**Solution**:
1. Verify all runtimes healthy: `docker ps` or check IntelliJ run configurations
2. Re-run seed script: `./seed.sh`
3. Check logs for errors:
```bash
# IntelliJ: Check console output
# Docker Compose:
docker logs consumer-controlplane
docker logs provider-qna-controlplane
```

#### Coverage Report Not Generated

**Cause**: Tests not executed or JaCoCo not configured

**Solution**:
```bash
# Ensure tests run first
./gradlew clean test jacocoRootReport

# Verify JaCoCo task exists
./gradlew tasks --group verification
```

#### Checkstyle Violations

**Cause**: Code style doesn't match EDC conventions

**Solution**:
```bash
# View violations
./gradlew checkstyleMain checkstyleTest

# Common violations:
# - Missing Javadoc
# - Line length >120 characters
# - Incorrect import order
# - Missing copyright header
```

### Debugging Tests

#### IntelliJ IDEA

1. Set breakpoint in test
2. Right-click test → "Debug 'TestName'"
3. Step through with debugger

#### Command Line

```bash
# Run with debug output
./gradlew test --debug --tests MyTest

# Run with JVM debug port
./gradlew test --debug-jvm --tests MyTest
# Then attach remote debugger to port 5005
```

### Getting Help

- **EDC Testing Docs**: https://github.com/eclipse-edc/Connector/blob/main/docs/developer/testing.md
- **GitHub Issues**: https://github.com/ma3u/MinimumViableDataspace/issues
- **WARP.md**: AI assistant guidance for development workflows

---

## Test Maintenance

### When to Update Tests

- **API changes**: Update mocks and assertions
- **New features**: Add test coverage for new functionality
- **Bug fixes**: Add regression test before fixing
- **Refactoring**: Ensure tests still pass

### Test Review Checklist

- [ ] Tests follow naming convention
- [ ] Happy path and error cases covered
- [ ] Mocks used appropriately (not over-mocking)
- [ ] Assertions are specific and meaningful
- [ ] Tests are independent (no shared state)
- [ ] Tests run quickly (<5s per test)

---

## Future Enhancements

### Planned Additions

- **Integration Tests**: Testcontainers for EDC runtimes
- **Protocol Compliance**: dsp-tck and dcp-tck integration
- **Performance Tests**: Load testing with JMeter
- **Contract Tests**: Pact for consumer-driven contracts
- **Mutation Testing**: PIT for test quality validation

### Contributing Tests

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on:
- Writing test documentation
- Adding new test categories
- Improving test infrastructure
- Reviewing test PRs

---

## Resources

- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [AssertJ Documentation](https://assertj.github.io/doc/)
- [RestAssured Documentation](https://rest-assured.io/)
- [EDC Testing Guide](https://github.com/eclipse-edc/Connector/blob/main/docs/developer/testing.md)
- [WARP.md](../WARP.md) - MVD development workflows
