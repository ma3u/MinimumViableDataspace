# Docker Name Exporter for macOS

A Prometheus exporter that solves cAdvisor's container name resolution issue on Docker Desktop for macOS.

## Problem

cAdvisor on Docker Desktop for macOS cannot resolve container names due to:
- Docker socket inside cAdvisor's container pointing to an inaccessible macOS path
- VM architecture differences between Docker Desktop and native Linux
- Cgroup structure mismatches

This results in metrics showing container IDs instead of names:
```
container_memory_usage_bytes{id="/docker/abc123..."} 1234567
```

## Solution

This exporter queries the Docker API directly from a container with proper socket access and exports:

1. **`docker_container_id_mapping`** - Maps cAdvisor IDs to container names for Grafana `label_join`
2. **`docker_container_info`** - Container metadata (name, image, state, compose labels)
3. **`docker_container_running`** - Container state (1 = running, 0 = stopped)
4. **`docker_container_cpu_usage_percent`** - CPU usage (background collection)
5. **`docker_container_memory_usage_bytes`** - Memory usage (background collection)
6. **`docker_container_network_*_bytes`** - Network I/O (background collection)

## Quick Start

The exporter is included in the observability stack:

```bash
docker-compose -f docker-compose.observability.yml up -d docker-name-exporter
```

Verify it's running:
```bash
curl http://localhost:9417/health
curl http://localhost:9417/containers | jq '.[0:5]'
```

## Prometheus Integration

The exporter is automatically scraped by Prometheus (job: `docker-name-exporter`).

Check scraping status:
```bash
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.labels.job == "docker-name-exporter")'
```

## Grafana Usage

### Option 1: Use Exporter Metrics Directly

Query metrics with container names:
```promql
docker_container_memory_usage_bytes{name="ehr-backend"}
```

### Option 2: Join with cAdvisor Metrics

Use `label_join` to add names to cAdvisor metrics:
```promql
container_memory_usage_bytes{id=~"/docker/.+"}
  * on(id) group_left(name)
  docker_container_id_mapping
```

Or in Grafana dashboard JSON:
```json
{
  "expr": "container_memory_usage_bytes{id=~\"/docker/.+\"} * on(id) group_left(name) docker_container_id_mapping",
  "legendFormat": "{{name}}"
}
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /metrics` | Prometheus metrics |
| `GET /containers` | List containers (debug) |

## Metrics Reference

### docker_container_id_mapping
Maps cAdvisor container IDs to names for Grafana joins.

Labels:
- `cadvisor_id`: The ID format used by cAdvisor (`/docker/<full_id>`)
- `short_id`: First 12 characters of container ID
- `name`: Container name

### docker_container_info
Container metadata gauge (value is always 1).

Labels:
- `id`: Full container ID
- `short_id`: First 12 characters
- `name`: Container name
- `image`: Image name
- `state`: running, exited, etc.
- `compose_project`: Docker Compose project name
- `compose_service`: Docker Compose service name

### docker_container_running
Container state gauge (1 = running, 0 = stopped).

Labels: `id`, `short_id`, `name`

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Docker Desktop │     │ docker-name-     │     │  Prometheus │
│                 │────▶│ exporter         │────▶│             │
│  /var/run/      │     │ :9417            │     │  :9090      │
│  docker.sock    │     │                  │     │             │
└─────────────────┘     └──────────────────┘     └─────────────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │   Grafana   │
                                                 │   :3003     │
                                                 └─────────────┘
```

## Configuration

Environment variables:
- `PORT`: Metrics server port (default: 9417)

## Limitations

- Detailed stats (CPU/memory/network) are collected in background every 30 seconds
- Only running containers have CPU/memory/network metrics
- Requires Docker socket access (runs as root)

## Related

- [cAdvisor GitHub Issue #3194](https://github.com/google/cadvisor/issues/3194)
- [GitHub Issue #10](https://github.com/ma3u/MinimumViableDataspace/issues/10) - Docker Desktop macOS limitation
