# MVD Grafana Dashboards

This directory contains pre-configured Grafana dashboard JSON files for monitoring MVD (Minimum Viable Dataspace) deployments.

## Available Dashboards

### 01 - System Overview (`01-system-overview.json`)
**Purpose**: Monitor overall system health and JVM performance

**Panels**:
- Active Runtimes (count)
- Overall Health (gauge)
- JVM Heap Memory Usage (by runtime)
- JVM Threads (by runtime)
- GC Pause Time Rate
- HTTP Request Rate (by endpoint)

**Use Cases**:
- Quick health check of all EDC runtimes
- Identify memory leaks or excessive GC
- Monitor thread pool utilization
- Troubleshoot performance issues

### 02 - DSP Protocol (`02-dsp-protocol.json`)
**Purpose**: Monitor Dataspace Protocol operations (catalog, negotiation, transfer)

**Panels**:
- Catalog Request Rate
- Negotiation Request Rate
- Transfer Request Rate
- DSP Error Rate
- Catalog Requests by Participant
- Contract Negotiations (timeline)
- DSP Request Latency (P50/P95/P99)
- DSP Response Status Codes
- Custom DSP Metrics Guide (placeholder)

**Use Cases**:
- Monitor catalog discovery patterns
- Track contract negotiation success/failure
- Identify slow DSP endpoints
- Debug data transfer issues
- Analyze participant interaction patterns

**Metrics Used**:
- HTTP metrics filtered by URI patterns (`/catalog`, `/contractnegotiations`, `/transferprocesses`, `/dsp`)
- Status code distribution
- Latency histograms

### 03 - DCP Credentials (`03-dcp-credentials.json`)
**Purpose**: Monitor Decentralized Claims Protocol operations (credentials, DID resolution)

**Panels**:
- Credential Requests
- DID Resolution Requests
- STS Token Requests
- IdentityHub Operations
- Issuer Service Operations
- Credential Operation Latency (P50/P95/P99)
- DID Resolution Latency (P50/P95/P99)
- DCP Response Status Codes
- Custom DCP Metrics Guide (placeholder)

**Use Cases**:
- Monitor credential verification activity
- Track DID resolution performance
- Identify STS token bottlenecks
- Debug IdentityHub/Issuer Service issues
- Analyze credential issuance patterns

**Metrics Used**:
- HTTP metrics filtered by URI patterns (`/credentials`, `/presentations`, `/did`, `/sts`)
- IdentityHub and Issuer Service job filters
- Latency histograms

## Dashboard Auto-Loading

Dashboards are automatically loaded into Grafana via provisioning:

1. **Dashboard Provider**: `dashboard-provider.yml` configures auto-import
2. **On Startup**: Grafana scans this directory and imports all `.json` files
3. **Updates**: Changes to JSON files are detected and re-imported (if `allowUiUpdates: true`)

## Accessing Dashboards

1. **Start Observability Stack**:
   ```bash
   docker compose -f deployment/observability/docker-compose.yml up -d
   ```

2. **Open Grafana**: http://localhost:3000
   - Username: `admin`
   - Password: `admin`

3. **Navigate to Dashboards**:
   - Left menu → Dashboards → MVD folder
   - Or search: "MVD" in the search bar

4. **Start EDC Runtimes** to see live data

## Customizing Dashboards

### Option 1: Edit in Grafana UI
1. Open dashboard in Grafana
2. Click **Dashboard settings** (gear icon) → Edit
3. Modify panels, queries, visualization
4. Click **Save dashboard**
5. Export JSON: **Dashboard settings** → **JSON Model** → Copy
6. Save to this directory: `<number>-<name>.json`

### Option 2: Edit JSON Directly
1. Open `.json` file in text editor
2. Modify queries, layout, or configuration
3. Save file
4. Restart Grafana to reload: `docker restart mvd-grafana`

## Adding Custom Metrics

The dashboards include **Custom Metrics Guide** panels with instructions for adding domain-specific metrics.

### DSP Custom Metrics Example
```java
// In your EDC extension
@Inject
private MeterRegistry meterRegistry;

public void initialize(ServiceExtensionContext context) {
    // Counter: Track catalog requests
    Counter catalogRequests = meterRegistry.counter("edc.dsp.catalog.requests",
        "participant", context.getParticipantId());
    
    // Timer: Track negotiation duration
    Timer negotiationTimer = meterRegistry.timer("edc.dsp.negotiation.duration");
    
    // Gauge: Track active transfers
    meterRegistry.gauge("edc.dsp.transfer.active", transferQueue, Queue::size);
}
```

### DCP Custom Metrics Example
```java
// Track credential verification
Counter verifications = meterRegistry.counter("edc.dcp.verification.total",
    "status", "success", "credential_type", "MembershipCredential");

// Track verification latency
Timer.Sample sample = Timer.start(meterRegistry);
// ... perform verification ...
sample.stop(meterRegistry.timer("edc.dcp.verification.duration"));
```

See [docs/OBSERVABILITY.md](../../../../docs/OBSERVABILITY.md) for complete custom instrumentation guide.

## Dashboard Query Patterns

### Common PromQL Patterns

**Request Rate (5-minute window)**:
```promql
rate(http_server_requests_seconds_count{uri=~".*pattern.*"}[5m])
```

**Latency Percentiles**:
```promql
histogram_quantile(0.95, 
  sum(rate(http_server_requests_seconds_bucket{uri=~".*pattern.*"}[5m])) 
  by (le, job))
```

**Error Rate**:
```promql
sum(rate(http_server_requests_seconds_count{status=~"4..|5.."}[5m])) 
/ 
sum(rate(http_server_requests_seconds_count[5m]))
```

**Aggregation by Label**:
```promql
sum by(participant, component) (rate(http_server_requests_seconds_count[5m]))
```

## Troubleshooting

### Dashboard Shows "No Data"

**Check Prometheus targets**:
```bash
open http://localhost:9090/targets
```
All targets should be **UP** (green).

**Verify metrics endpoint**:
```bash
curl http://localhost:8086/api/observability/metrics | grep http_server_requests
```
Should return metrics data.

**Check Grafana datasource**:
- Grafana → Configuration → Data Sources → Prometheus
- Click **Save & Test** (should show green checkmark)

### Queries Return Errors

**Check metric names**:
- EDC uses `http_server_requests_seconds_count` (not `http_requests_total`)
- JVM metrics: `jvm_memory_used_bytes`, `jvm_threads_live`

**Check label filters**:
- Jobs: `job=~".*controlplane|.*dataplane|.*identityhub"`
- URIs: `uri=~".*/dsp.*"` (note the `.*/` prefix)

### Dashboards Not Auto-Loading

**Restart Grafana**:
```bash
docker restart mvd-grafana
```

**Check provisioning logs**:
```bash
docker logs mvd-grafana | grep -i "provision"
```

**Verify file location**:
```bash
ls -la deployment/observability/grafana/dashboards/*.json
```

## Dashboard Maintenance

### Version Control
- **Always commit dashboard JSON** to version control
- Include descriptive commit messages: `dashboards: Add catalog latency panel to DSP dashboard`

### Dashboard Naming Convention
- Prefix with number for ordering: `01-`, `02-`, `03-`
- Use lowercase with hyphens: `system-overview`, `dsp-protocol`
- Descriptive names: Avoid abbreviations

### Panel Guidelines
- **Titles**: Clear and concise (e.g., "DSP Request Latency" not "Latency")
- **Legends**: Use table format for multi-series with calcs (last, mean, max)
- **Units**: Always specify (reqps, s, bytes, percent unit)
- **Colors**: Consistent (green=good, yellow=warning, red=error)
- **Refresh**: 10s default (adjust for high-frequency environments)

## References

- [Grafana Provisioning Documentation](https://grafana.com/docs/grafana/latest/administration/provisioning/)
- [PromQL Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [MVD Observability Guide](../../../../docs/OBSERVABILITY.md)
- [Micrometer Metrics](https://micrometer.io/docs)

## Contributing

When adding new dashboards:

1. Create JSON file in this directory with numbered prefix
2. Follow existing dashboard structure (annotations, tags, refresh rate)
3. Add description field to dashboard metadata
4. Include custom metrics guide panel if applicable
5. Update this README with dashboard description
6. Test dashboard with live MVD deployment
7. Submit PR with dashboard JSON + updated README

---

**Questions or Issues?** Open an issue at https://github.com/ma3u/MinimumViableDataspace/issues
