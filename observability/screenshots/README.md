# Observability Screenshots

This folder contains screenshots of the observability tools for documentation purposes.

## Required Screenshots

Capture the following screenshots after starting the observability stack:

```bash
docker-compose -f docker-compose.health.yml -f docker-compose.observability.yml up -d
# Wait for services to initialize, then generate some traffic
./seed-dataspace.sh --mode=docker
```

### 1. Grafana Overview (`grafana-overview.png`)
- **URL**: http://localhost:3003
- **Login**: admin / dataspace
- **Navigate to**: Dashboards → Health Dataspace Overview
- **Capture**: Full dashboard showing request rates, latencies, and system health

### 2. Prometheus Metrics (`prometheus-metrics.png`)
- **URL**: http://localhost:9090
- **Navigate to**: Graph tab
- **Query**: `sum(rate(http_requests_total[5m])) by (job)`
- **Capture**: Graph showing request rates across services

### 3. Jaeger Traces (`jaeger-traces.png`)
- **URL**: http://localhost:16686
- **Navigate to**: Search → Select service "backend-edc"
- **Capture**: Trace view showing a complete negotiation request

### 4. Loki Logs (`loki-logs.png`)
- **URL**: http://localhost:3003/explore
- **Data source**: Loki
- **Query**: `{job="backend-edc"} |= "negotiation"`
- **Capture**: Log panel with correlated logs from multiple services

## Screenshot Guidelines

1. Use a browser width of ~1400px for consistency
2. Capture in light mode for better print readability
3. Ensure sample data is visible (run seeding first)
4. Blur or redact any sensitive information
5. Save as PNG format

## Updating Screenshots

After making changes to dashboards or configurations:
1. Delete the old screenshot
2. Capture a new one following the guidelines above
3. Use the exact filename referenced in the documentation
