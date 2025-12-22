/**
 * Docker Name Exporter for macOS
 * 
 * This sidecar service solves the cAdvisor container name resolution issue
 * on Docker Desktop for macOS by querying the Docker API directly and
 * exporting container metrics with proper name labels.
 * 
 * Why this is needed:
 * - cAdvisor on Docker Desktop macOS cannot resolve container names
 * - Docker socket inside cAdvisor's container points to an inaccessible path
 * - This service runs on the host network and can access the Docker API
 * 
 * Metrics exported:
 * - docker_container_info: Gauge with labels {id, name, image, state}
 * - docker_container_id_mapping: Maps cAdvisor IDs to container names for Grafana joins
 * - docker_container_running: Container running state (1 = running, 0 = stopped)
 * 
 * Note: CPU/Memory/Network metrics are collected in background to avoid slow scrapes.
 */

const Docker = require('dockerode');
const express = require('express');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 9417;

// Connect to Docker - works on macOS via the default socket
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Create a custom registry
const register = new client.Registry();

// Add default metrics
client.collectDefaultMetrics({ register, prefix: 'docker_exporter_' });

// Container info gauge - provides the ID to name mapping
const containerInfoGauge = new client.Gauge({
  name: 'docker_container_info',
  help: 'Container information with ID and name labels (value is always 1)',
  labelNames: ['id', 'short_id', 'name', 'image', 'state', 'compose_project', 'compose_service'],
  registers: [register]
});

// Container state gauge (1 = running, 0 = stopped)
const containerStateGauge = new client.Gauge({
  name: 'docker_container_running',
  help: 'Container running state (1 = running, 0 = stopped)',
  labelNames: ['id', 'short_id', 'name'],
  registers: [register]
});

// ID to Name mapping for Grafana label_join
const containerIdMappingGauge = new client.Gauge({
  name: 'docker_container_id_mapping',
  help: 'Maps cAdvisor container IDs (/docker/<id>) to container names for Grafana joins',
  labelNames: ['cadvisor_id', 'short_id', 'name'],
  registers: [register]
});

// CPU usage gauge (collected in background)
const cpuUsageGauge = new client.Gauge({
  name: 'docker_container_cpu_usage_percent',
  help: 'Container CPU usage percentage',
  labelNames: ['id', 'short_id', 'name'],
  registers: [register]
});

// Memory usage gauge (collected in background)
const memoryUsageGauge = new client.Gauge({
  name: 'docker_container_memory_usage_bytes',
  help: 'Container memory usage in bytes',
  labelNames: ['id', 'short_id', 'name'],
  registers: [register]
});

// Memory limit gauge
const memoryLimitGauge = new client.Gauge({
  name: 'docker_container_memory_limit_bytes',
  help: 'Container memory limit in bytes',
  labelNames: ['id', 'short_id', 'name'],
  registers: [register]
});

// Network RX gauge
const networkRxGauge = new client.Gauge({
  name: 'docker_container_network_rx_bytes',
  help: 'Container network received bytes',
  labelNames: ['id', 'short_id', 'name'],
  registers: [register]
});

// Network TX gauge
const networkTxGauge = new client.Gauge({
  name: 'docker_container_network_tx_bytes',
  help: 'Container network transmitted bytes',
  labelNames: ['id', 'short_id', 'name'],
  registers: [register]
});

/**
 * Collect basic container info (fast - just lists containers)
 */
async function collectContainerInfo() {
  try {
    const containers = await docker.listContainers({ all: true });
    
    // Reset all gauges to handle removed containers
    containerInfoGauge.reset();
    containerStateGauge.reset();
    containerIdMappingGauge.reset();
    
    for (const containerInfo of containers) {
      const id = containerInfo.Id;
      const shortId = id.substring(0, 12);
      const name = containerInfo.Names[0].replace(/^\//, ''); // Remove leading slash
      const image = containerInfo.Image;
      const state = containerInfo.State;
      const isRunning = state === 'running' ? 1 : 0;
      
      // Extract Docker Compose labels if available
      const composeProject = containerInfo.Labels['com.docker.compose.project'] || '';
      const composeService = containerInfo.Labels['com.docker.compose.service'] || '';
      
      // Set container info gauge
      containerInfoGauge.set({
        id,
        short_id: shortId,
        name,
        image,
        state,
        compose_project: composeProject,
        compose_service: composeService
      }, 1);
      
      // Set container state
      containerStateGauge.set({ id, short_id: shortId, name }, isRunning);
      
      // Set ID mapping for cAdvisor join (format: /docker/<full_id>)
      containerIdMappingGauge.set({
        cadvisor_id: `/docker/${id}`,
        short_id: shortId,
        name
      }, 1);
    }
    
    console.log(`[${new Date().toISOString()}] Collected info for ${containers.length} containers`);
    return containers;
  } catch (error) {
    console.error('Failed to collect container info:', error.message);
    return [];
  }
}

/**
 * Collect detailed stats (slow - queries each container)
 * Run in background, not during scrapes
 */
async function collectDetailedStats() {
  try {
    const containers = await docker.listContainers({ all: false }); // Only running
    
    // Reset stats gauges
    cpuUsageGauge.reset();
    memoryUsageGauge.reset();
    memoryLimitGauge.reset();
    networkRxGauge.reset();
    networkTxGauge.reset();
    
    // Process containers in parallel with concurrency limit
    const batchSize = 5;
    for (let i = 0; i < containers.length; i += batchSize) {
      const batch = containers.slice(i, i + batchSize);
      await Promise.all(batch.map(async (containerInfo) => {
        const id = containerInfo.Id;
        const shortId = id.substring(0, 12);
        const name = containerInfo.Names[0].replace(/^\//, '');
        
        try {
          const container = docker.getContainer(id);
          const stats = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Stats timeout')), 3000);
            container.stats({ stream: false }, (err, stats) => {
              clearTimeout(timeout);
              if (err) reject(err);
              else resolve(stats);
            });
          });
          
          // Calculate CPU percentage
          const cpuDelta = stats.cpu_stats.cpu_usage.total_usage - 
                          stats.precpu_stats.cpu_usage.total_usage;
          const systemDelta = stats.cpu_stats.system_cpu_usage - 
                             stats.precpu_stats.system_cpu_usage;
          const cpuPercent = systemDelta > 0 
            ? (cpuDelta / systemDelta) * stats.cpu_stats.online_cpus * 100 
            : 0;
          
          cpuUsageGauge.set({ id, short_id: shortId, name }, cpuPercent);
          
          // Memory usage
          const memoryUsage = stats.memory_stats.usage || 0;
          const memoryLimit = stats.memory_stats.limit || 0;
          memoryUsageGauge.set({ id, short_id: shortId, name }, memoryUsage);
          memoryLimitGauge.set({ id, short_id: shortId, name }, memoryLimit);
          
          // Network stats (aggregate all interfaces)
          let rxBytes = 0;
          let txBytes = 0;
          if (stats.networks) {
            for (const [, netStats] of Object.entries(stats.networks)) {
              rxBytes += netStats.rx_bytes || 0;
              txBytes += netStats.tx_bytes || 0;
            }
          }
          networkRxGauge.set({ id, short_id: shortId, name }, rxBytes);
          networkTxGauge.set({ id, short_id: shortId, name }, txBytes);
          
        } catch (statsError) {
          // Ignore individual container errors
        }
      }));
    }
    
    console.log(`[${new Date().toISOString()}] Collected detailed stats for ${containers.length} running containers`);
  } catch (error) {
    console.error('Failed to collect detailed stats:', error.message);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Prometheus metrics endpoint - fast, only collects basic info
app.get('/metrics', async (req, res) => {
  await collectContainerInfo();
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Container list endpoint (for debugging)
app.get('/containers', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const simplified = containers.map(c => ({
      id: c.Id.substring(0, 12),
      name: c.Names[0].replace(/^\//, ''),
      image: c.Image,
      state: c.State,
      cadvisor_id: `/docker/${c.Id}`
    }));
    res.json(simplified);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Docker Name Exporter for macOS                                ║
╠════════════════════════════════════════════════════════════════╣
║  Solves cAdvisor container name resolution on Docker Desktop   ║
╠════════════════════════════════════════════════════════════════╣
║  Endpoints:                                                    ║
║    GET /metrics     - Prometheus metrics with container names  ║
║    GET /health      - Health check                             ║
║    GET /containers  - List containers (debug)                  ║
╠════════════════════════════════════════════════════════════════╣
║  Listening on port ${port}                                         ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

// Collect detailed stats every 30 seconds in background
setInterval(collectDetailedStats, 30000);

// Initial collection
collectContainerInfo();
collectDetailedStats();
