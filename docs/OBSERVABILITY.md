# MVD Observability Guide

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Metrics (Prometheus)](#metrics-prometheus)
- [Distributed Tracing (Jaeger)](#distributed-tracing-jaeger)
- [Logging](#logging)
- [Dashboards (Grafana)](#dashboards-grafana)
- [Health Checks](#health-checks)
- [Deployment Modes](#deployment-modes)
- [Custom Instrumentation](#custom-instrumentation)
- [Troubleshooting](#troubleshooting)
- [Performance Tuning](#performance-tuning)

## Architecture Overview

MVD includes a comprehensive observability stack based on industry-standard open-source tools:

```
┌─────────────────────────────────────────────────────┐
│              Visualization Layer                     │
│  Grafana Dashboards (metrics, traces, logs)         │
│  - System Overview                                   │
│  - DSP Protocol Monitoring                           │
│  - DCP Credential Verification                       │
│  - Policy Evaluation                                 │
│  - Data Transfer Performance                         │
└─────────────────────────────────────────────────────┘
                         ↓ Queries
┌─────────────────────────────────────────────────────┐
│                  Storage Layer                       │
│  Prometheus (metrics) | Jaeger (traces)              │
│  - Time-series metrics storage                       │
│  - Distributed trace storage                         │
│  - 7-day retention (configurable)                    │
└─────────────────────────────────────────────────────┘
                         ↑ Ingest
┌─────────────────────────────────────────────────────┐
│              EDC Runtimes (Instrumented)             │
│  - Micrometer metrics export                         │
│  - OpenTelemetry tracing (optional)                  │
│  - Health check endpoints                            │
│  - Consumer (controlplane + dataplane + identityhub) │
│  - Provider (2x controlplane + dataplane + shared)   │
│  - Issuer Service                                    │
└─────────────────────────────────────────────────────┘
```

### Components

| Component | Purpose | Technology | Port |
|-----------|---------|------------|------|
| **Metrics Collection** | Scrape & store metrics | Prometheus | 9090 |
| **Trace Collection** | Collect distributed traces | Jaeger All-in-One | 16686 (UI), 4317 (OTLP gRPC), 4318 (OTLP HTTP) |
| **Visualization** | Dashboards & queries | Grafana | 3000 |
| **Log Aggregation** | Kubernetes logs (optional) | Loki + Promtail | N/A (K8s only) |

### EDC Observability Support

Eclipse EDC includes the `edc-api-observability` module, which provides:

- **Health Checks**: `/api/check/health`, `/api/check/liveness`, `/api/check/readiness`, `/api/check/startup`
- **Metrics Export**: `/api/observability/metrics` (Prometheus format via Micrometer)
- **JVM Metrics**: Heap, threads, GC, classloading
- **HTTP Metrics**: Request rate, latency, status codes per endpoint
- **Database Metrics**: Connection pool size, active connections, query times

## Quick Start

### IntelliJ/Local Development

1. **Start MVD runtimes** (see [WARP.md](../WARP.md)):
   ```bash
   # Run .run/dataspace compound configuration in IntelliJ
   # OR start via Gradle:
   ./gradlew :launchers:consumer:run
   # (repeat for all runtimes)
   ```

2. **Start observability stack**:
   ```bash
   docker compose -f deployment/observability/docker-compose.yml up -d
   ```

3. **Access dashboards**:
   - Grafana: http://localhost:3000 (admin/admin)
   - Prometheus: http://localhost:9090
   - Jaeger: http://localhost:16686

4. **Verify metrics collection**:
   ```bash
   # Check consumer controlplane metrics
   curl http://localhost:8086/api/observability/metrics
   
   # Check Prometheus targets
   open http://localhost:9090/targets
   ```

### Docker Compose Deployment

When using `deployment/docker-compose.yml` for EDC runtimes, extend it with observability services:

```bash
# Start EDC runtimes + observability stack
docker compose -f deployment/docker-compose.yml \
               -f deployment/observability/docker-compose.yml \
               up -d
```

**Note**: Update Prometheus config to use container hostnames instead of `localhost`.

### Kubernetes Deployment

Observability stack for Kubernetes is deployed via Terraform/Helm (see [Kubernetes section](#kubernetes-k8s)).

## Metrics (Prometheus)

### Available Metrics

EDC runtimes expose the following metric categories:

#### JVM Metrics
- `jvm_memory_used_bytes` - JVM heap/non-heap memory usage
- `jvm_gc_pause_seconds` - GC pause duration (histogram)
- `jvm_threads_live` - Active thread count
- `jvm_classes_loaded` - Loaded class count

#### HTTP Metrics
- `http_server_requests_seconds` - HTTP request duration (histogram)
- `http_server_requests_active` - Active HTTP requests (gauge)
- Labels: `method`, `uri`, `status`, `outcome`

#### Database Metrics (when using PostgreSQL)
- `hikaricp_connections_active` - Active database connections
- `hikaricp_connections_idle` - Idle connections
- `hikaricp_connections_pending` - Pending connection requests

#### Custom EDC Metrics
*Note: Custom metrics require extension development (see [Custom Instrumentation](#custom-instrumentation))*

Recommended custom metrics for domain-specific implementations:
- `edc_dsp_catalog_requests_total` - Catalog requests counter
- `edc_dsp_negotiation_duration_seconds` - Negotiation duration histogram
- `edc_dsp_transfer_bytes_total` - Transferred data bytes counter
- `edc_dcp_credential_verifications_total` - Credential verification counter
- `edc_policy_evaluations_total` - Policy evaluation counter

### Observability Endpoints

Each EDC runtime exposes metrics on its observability port:

| Runtime | Observability Port | Metrics URL |
|---------|-------------------|-------------|
| Consumer Controlplane | 8086 | http://localhost:8086/api/observability/metrics |
| Consumer Dataplane | 8087 | http://localhost:8087/api/observability/metrics |
| Consumer IdentityHub | 7084 | http://localhost:7084/api/observability/metrics |
| Provider QnA Controlplane | 8196 | http://localhost:8196/api/observability/metrics |
| Provider QnA Dataplane | 8197 | http://localhost:8197/api/observability/metrics |
| Provider Mfg Controlplane | 8296 | http://localhost:8296/api/observability/metrics |
| Provider Mfg Dataplane | 8297 | http://localhost:8297/api/observability/metrics |
| Provider Catalog Server | 8096 | http://localhost:8096/api/observability/metrics |
| Provider IdentityHub | 7094 | http://localhost:7094/api/observability/metrics |
| Issuer Service | 10086 | http://localhost:10086/api/observability/metrics |

### Prometheus Configuration

Prometheus scrapes metrics every 15 seconds from all runtimes. Configuration: `deployment/observability/prometheus/prometheus.yml`

Example scrape config:
```yaml
scrape_configs:
  - job_name: 'consumer-controlplane'
    metrics_path: '/api/observability/metrics'
    static_configs:
      - targets: ['localhost:8086']
        labels:
          participant: 'consumer'
          component: 'controlplane'
```

### Querying Metrics

Access Prometheus UI at http://localhost:9090 and run PromQL queries:

**Example queries:**
```promql
# JVM heap usage per runtime
jvm_memory_used_bytes{area="heap"}

# HTTP request rate per endpoint
rate(http_server_requests_seconds_count[5m])

# P95 HTTP latency
histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))

# Active database connections
hikaricp_connections_active
```

## Distributed Tracing (Jaeger)

### Overview

Distributed tracing allows you to follow a single request across multiple EDC components (e.g., Consumer Controlplane → Provider Controlplane → Dataplane → Backend).

**Status**: Infrastructure ready, OpenTelemetry Java agent integration pending.

### Architecture

```
Client Request
      ↓
Consumer Controlplane (Span: catalog-request)
      ↓ DSP HTTP
Provider Catalog Server (Span: catalog-query)
      ↓
Return Catalog
```

### Enabling Tracing (Future Enhancement)

To enable distributed tracing, add OpenTelemetry Java agent to EDC runtimes:

1. **Download OpenTelemetry Java agent**:
   ```bash
   mkdir -p deployment/agents
   curl -L https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar \
        -o deployment/agents/opentelemetry-javaagent.jar
   ```

2. **Update IntelliJ run configurations** (`.run/*.run.xml`):
   Add VM options:
   ```
   -javaagent:deployment/agents/opentelemetry-javaagent.jar
   -Dotel.service.name=consumer-controlplane
   -Dotel.traces.exporter=otlp
   -Dotel.exporter.otlp.endpoint=http://localhost:4318
   -Dotel.exporter.otlp.protocol=http/protobuf
   ```

3. **Restart runtimes** and observe traces in Jaeger UI: http://localhost:16686

### Trace Context Propagation

OpenTelemetry automatically injects W3C Trace Context headers into HTTP requests:
- `traceparent: 00-<trace-id>-<span-id>-01`
- `tracestate: ...`

EDC components propagate these headers across DSP protocol exchanges, enabling end-to-end trace visualization.

### Jaeger UI

Access Jaeger at http://localhost:16686:

1. **Service dropdown**: Select `consumer-controlplane`
2. **Operation**: Select specific endpoint (e.g., `/api/management/v3/catalog/request`)
3. **Find Traces**: Query traces by duration, tags, time range
4. **Trace Detail**: Click trace to see span hierarchy and timing

## Logging

### Current State

EDC uses SLF4J + Logback for logging. Logs are written to:
- **IntelliJ**: IDE console (run window)
- **Docker Compose**: `docker logs <container-name>`
- **Kubernetes**: `kubectl logs -n mvd <pod-name>`

### Log Levels

Configure log levels via environment variables or `logging.properties`:

```properties
# Default: INFO level
.level=INFO

# Debug specific packages
org.eclipse.edc.connector.controlplane.level=DEBUG
org.eclipse.edc.spi.iam.level=DEBUG
```

**IntelliJ**: Set log level in `.env` files or JVM args:
```
-Dlogging.level.org.eclipse.edc=DEBUG
```

### Structured Logging (Future Enhancement)

For production deployments, consider structured JSON logs:

1. **Add logback-json dependency** to `build.gradle.kts`
2. **Configure logback.xml**:
   ```xml
   <appender name="json" class="ch.qos.logback.core.ConsoleAppender">
     <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>
   </appender>
   ```

### Log Aggregation (Kubernetes Only)

Loki + Promtail configuration for Kubernetes (future enhancement):

```bash
# Deploy Loki stack
kubectl apply -f deployment/observability/k8s/loki.yaml

# Query logs in Grafana
{namespace="mvd", app="consumer-controlplane"} |= "error"
```

## Dashboards (Grafana)

### Accessing Grafana

URL: http://localhost:3000  
Username: `admin`  
Password: `admin` (change on first login)

### Pre-configured Datasources

Grafana is provisioned with:
- **Prometheus**: Default datasource for metrics
- **Jaeger**: Trace queries

### Creating Dashboards

**Future dashboards** (templates to be created in Phase 5 completion):

1. **System Overview**
   - JVM heap usage per runtime (area chart)
   - HTTP request rate (line chart)
   - Database connections (gauge)
   - Runtime status (status panel)

2. **DSP Protocol**
   - Catalog request rate/latency
   - Contract negotiation state distribution (pie chart)
   - Transfer process state distribution (pie chart)
   - Error rate per DSP message type

3. **DCP Credential Verification** (requires custom metrics)
   - Verification success rate (stat panel)
   - Verification latency P50/P95/P99 (histogram)
   - Credential type distribution (bar chart)

4. **Policy Evaluation** (requires custom metrics)
   - Policy evaluation rate (line chart)
   - Evaluation duration (heatmap)
   - Denial rate per policy type (table)

5. **Data Transfer** (requires custom metrics)
   - Transfer throughput (bytes/sec)
   - Active transfers (gauge)
   - Transfer completion time distribution

### Exporting Dashboards

To create dashboard templates:
1. Build dashboard in Grafana UI
2. Click **Dashboard settings** (gear icon) → **JSON Model**
3. Copy JSON and save to `deployment/observability/grafana/dashboards/<name>.json`
4. Restart Grafana to auto-import

## Health Checks

### Health Check Endpoints

All EDC runtimes expose health check endpoints via `edc-api-observability`:

| Endpoint | Purpose | Use Case |
|----------|---------|----------|
| `/api/check/health` | Overall health status | Monitoring dashboards, alerting |
| `/api/check/liveness` | Process is alive | Kubernetes liveness probe |
| `/api/check/readiness` | Ready to serve traffic | Kubernetes readiness probe, load balancer |
| `/api/check/startup` | Initialization complete | Kubernetes startup probe |

### Example Health Check

```bash
# Consumer controlplane health
curl http://localhost:8086/api/check/health

# Response (healthy):
{
  "componentResults": [
    {
      "component": "org.eclipse.edc.connector.controlplane.ControlPlaneExtension",
      "isHealthy": true
    }
  ]
}
```

### Kubernetes Probes

Update Kubernetes deployment manifests with probes:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: consumer-controlplane
spec:
  template:
    spec:
      containers:
      - name: controlplane
        livenessProbe:
          httpGet:
            path: /api/check/liveness
            port: 8086
          initialDelaySeconds: 30
          periodSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /api/check/readiness
            port: 8086
          initialDelaySeconds: 10
          periodSeconds: 5
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /api/check/startup
            port: 8086
          initialDelaySeconds: 5
          periodSeconds: 5
          failureThreshold: 12
```

**Probe configuration:**
- **liveness**: Restart unhealthy pods
- **readiness**: Remove from service load balancer if not ready
- **startup**: Allow slow startup without liveness/readiness interference

## Deployment Modes

### IntelliJ/Local Development

**Recommended setup:**
- EDC runtimes: IntelliJ run configurations (in-memory, fast iteration)
- Observability stack: Docker Compose (persistent, lightweight)

**Steps:**
1. Start observability stack:
   ```bash
   docker compose -f deployment/observability/docker-compose.yml up -d
   ```
2. Run `.run/dataspace` compound configuration in IntelliJ
3. Access Grafana: http://localhost:3000

**Pros:**
- Fast runtime restarts (no Docker rebuild)
- IDE debugging support
- Logs in IDE console

**Cons:**
- Observability stack requires Docker
- No persistent EDC state (in-memory vaults/databases)

### Docker Compose

**Full deployment** (EDC + observability in Docker Compose):

```bash
docker compose -f deployment/docker-compose.yml \
               -f deployment/observability/docker-compose.yml \
               up -d
```

**Update Prometheus targets** to use container hostnames (e.g., `consumer-controlplane:8086` instead of `localhost:8086`).

### Kubernetes (K8s)

**Observability stack deployment** (future Terraform module):

```bash
cd deployment
terraform apply -target=module.observability
```

**Components:**
- Prometheus: Deployed via Helm chart (prometheus-community/kube-prometheus-stack)
- Jaeger: Deployed as Jaeger Operator CRD
- Grafana: Included in kube-prometheus-stack
- Loki + Promtail: Optional log aggregation

**Service discovery:**
Prometheus automatically discovers EDC pods via Kubernetes service monitors.

**Ingress:**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: observability
  namespace: mvd
spec:
  rules:
  - host: grafana.mvd.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: grafana
            port:
              number: 3000
```

Access Grafana: http://grafana.mvd.local (requires DNS/hosts entry).

## Custom Instrumentation

### Adding Custom Metrics

To add domain-specific metrics to EDC runtimes:

1. **Add Micrometer dependency** (if not already present):
   ```kotlin
   // build.gradle.kts
   implementation("io.micrometer:micrometer-core:1.14.2")
   ```

2. **Inject MeterRegistry** in your extension:
   ```java
   @Inject
   private MeterRegistry meterRegistry;
   
   public void initialize(ServiceExtensionContext context) {
       Counter catalogRequests = meterRegistry.counter("edc.dsp.catalog.requests", 
           "participant", "consumer");
       
       // Increment counter
       catalogRequests.increment();
   }
   ```

3. **Create custom metrics**:
   ```java
   // Counter: Monotonically increasing value
   Counter verifications = meterRegistry.counter("edc.dcp.verifications.total",
       "status", "success");
   
   // Gauge: Current value (e.g., active transfers)
   meterRegistry.gauge("edc.transfer.active", activeTransfersQueue, Queue::size);
   
   // Timer: Duration distribution
   Timer.Sample sample = Timer.start(meterRegistry);
   // ... perform operation ...
   sample.stop(meterRegistry.timer("edc.policy.evaluation.duration"));
   
   // Histogram: Value distribution
   DistributionSummary.builder("edc.transfer.bytes")
       .baseUnit("bytes")
       .register(meterRegistry)
       .record(transferSize);
   ```

### Adding Custom Spans

To add custom tracing spans (requires OpenTelemetry agent):

```java
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.api.trace.Span;

@Inject
private Tracer tracer;

public Result<Void> evaluatePolicy(Policy policy) {
    Span span = tracer.spanBuilder("policy.evaluation")
        .setAttribute("policy.id", policy.getId())
        .setAttribute("policy.type", policy.getType())
        .startSpan();
    
    try {
        // ... policy evaluation logic ...
        span.setStatus(StatusCode.OK);
        return Result.success();
    } catch (Exception e) {
        span.recordException(e);
        span.setStatus(StatusCode.ERROR);
        return Result.failure(e.getMessage());
    } finally {
        span.end();
    }
}
```

## Troubleshooting

### Metrics Not Appearing in Prometheus

**Symptom**: Prometheus targets show as "DOWN" or metrics are missing.

**Checks:**
1. Verify runtime is running:
   ```bash
   curl http://localhost:8086/api/check/health
   ```
2. Verify observability endpoint responds:
   ```bash
   curl http://localhost:8086/api/observability/metrics
   ```
3. Check Prometheus targets: http://localhost:9090/targets
   - Red = DOWN (connection failed)
   - Green = UP (scraping successfully)
4. Check Prometheus logs:
   ```bash
   docker logs mvd-prometheus
   ```

**Common causes:**
- Runtime not started
- Observability port not configured in `.env` file
- Firewall blocking port
- Prometheus config incorrect (check `prometheus.yml` paths)

### Traces Not Appearing in Jaeger

**Symptom**: No traces visible in Jaeger UI.

**Checks:**
1. OpenTelemetry agent configured? (See [Enabling Tracing](#enabling-tracing-future-enhancement))
2. OTLP endpoint reachable?
   ```bash
   curl http://localhost:4318/v1/traces -X POST -H "Content-Type: application/json" -d '{}'
   # Should return 400 (invalid data) not connection error
   ```
3. Check Jaeger logs:
   ```bash
   docker logs mvd-jaeger
   ```

**Common causes:**
- OpenTelemetry agent not attached to JVM
- OTLP exporter misconfigured
- Sampling rate set to 0 (no traces collected)

### Grafana Shows "No Data"

**Symptom**: Grafana dashboards display "No data" despite Prometheus having data.

**Checks:**
1. Verify datasource connection:
   - Grafana → Configuration → Data Sources → Prometheus
   - Click "Save & Test" (should show green checkmark)
2. Check query syntax:
   - Prometheus queries are case-sensitive
   - Metric names must match exactly (e.g., `jvm_memory_used_bytes`)
3. Check time range:
   - Grafana time picker (top-right) may be too narrow
   - Try "Last 15 minutes" or "Last 1 hour"

### High Memory Usage (Prometheus/Jaeger)

**Symptom**: Prometheus or Jaeger consuming excessive memory.

**Solutions:**
1. **Reduce retention time** (`prometheus.yml`):
   ```yaml
   command:
     - '--storage.tsdb.retention.time=3d'  # Default: 7d
   ```
2. **Increase sampling rate** (collect fewer traces):
   ```bash
   -Dotel.traces.sampler=parentbased_traceidratio
   -Dotel.traces.sampler.arg=0.1  # Sample 10% of traces
   ```
3. **Limit scrape targets**: Comment out unused jobs in `prometheus.yml`

## Performance Tuning

### Prometheus Optimization

**Scrape interval:** Default 15s. Increase for lower overhead:
```yaml
global:
  scrape_interval: 30s  # Reduced frequency
```

**Storage optimization:**
- Retention: `--storage.tsdb.retention.time=7d` (adjust based on disk space)
- Compaction: Prometheus auto-compacts old blocks (no tuning needed)

### Jaeger Optimization

**Sampling strategies:**
- **Always on**: `otel.traces.sampler=always_on` (development only)
- **Ratio-based**: `otel.traces.sampler=traceidratio` + `otel.traces.sampler.arg=0.1` (10% sampling)
- **Adaptive**: Configure via Jaeger sampling service (production)

**Storage backend:**
- Development: In-memory (included in `jaegertracing/all-in-one`)
- Production: Cassandra, Elasticsearch, or Kafka (see [Jaeger docs](https://www.jaegertracing.io/docs/latest/deployment/))

### Runtime Optimization

**JVM tuning for metrics:**
- Micrometer has minimal overhead (<1% CPU)
- OpenTelemetry agent: ~2-5% overhead (auto-instrumentation)
- Manual instrumentation: Negligible overhead

**Disable observability** (not recommended):
Remove `edc-api-observability` from `build.gradle.kts` to completely disable metrics export.

## References

- [Eclipse EDC Observability Module](https://github.com/eclipse-edc/Connector/tree/main/extensions/common/api/api-observability)
- [Micrometer Documentation](https://micrometer.io/docs)
- [OpenTelemetry Java](https://opentelemetry.io/docs/languages/java/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [Jaeger Deployment](https://www.jaegertracing.io/docs/latest/deployment/)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)

## Next Steps

After setting up observability for core MVD:

1. **Create domain-specific dashboards** in your domain branch (e.g., `health-demo`)
2. **Add custom metrics** for domain-specific operations (FHIR access, DPP queries, etc.)
3. **Implement alerting** for critical events (high error rate, slow responses, credential failures)
4. **Production deployment**: Deploy observability stack to Kubernetes with persistent storage and ingress

---

**Feedback**: Found an issue or have suggestions? Open an issue at https://github.com/ma3u/MinimumViableDataspace/issues
