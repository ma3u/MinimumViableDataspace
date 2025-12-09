# Copilot Instructions for MVD Health Demo

This repository contains the **Minimum Viable Dataspace (MVD) Health Demo**, a comprehensive demonstration of secure, interoperable, and consent-managed access to health data (EHR2EDC) using Eclipse Dataspace Components (EDC).

## 🏗 Architecture & Structure

The project is a multi-module Gradle project with a React frontend and Docker orchestration.

- **Core Components** (EDC-based):
  - `launchers/`: Entry points for EDC services (Control Plane, Data Plane, Identity Hub, Catalog Server, Issuer Service).
  - `extensions/`: Custom EDC extensions (e.g., `dcp-impl`, `catalog-node-resolver`).
  - `system-tests/`: End-to-end tests.
- **Frontend**: `frontend/` (React, Vite, Tailwind CSS).
- **Backend Mock**: `backend-mock/` (Node.js, Express) simulates EHR systems.
- **Infrastructure**:
  - `docker-compose.health.yml`: Main orchestration file for the health demo.
  - `deployment/`: Terraform configurations (unused in local Docker flow).
- **Configuration**: `config/` contains environment variables and settings for services.

### Technology Stack
- **Java**: Temurin 17+ (EDC runtimes are Java-based)
- **Node.js**: 18+ or 20+ (Frontend & backend)
- **Build System**: Gradle (Kotlin DSL) for Java components, npm for Node.js components
- **Deployment**: Docker Compose

## 🛠 Critical Workflows

### 1. Build & Run (Local)

#### Docker Compose (Recommended)
- **Start the Demo**:
  ```bash
  docker-compose -f docker-compose.health.yml up --build
  ```
  *Note: This builds and starts all services, including the frontend and backend mock.*

- **Seed Data**:
  After services are up, run the seeding script to populate participants, assets, and policies:
  ```bash
  ./seed-health.sh
  ```
  *Important: This script interacts with the running services via their management APIs.*

### 2. Common Development Commands

- **Build Java Components**:
  ```bash
  ./gradlew build
  ./gradlew build dockerize  # Build with Docker images
  ./gradlew -Ppersistence=true build # Build with persistence enabled
  ```
- **Run Tests**:
  ```bash
  ./gradlew :tests:end2end:test
  ```
- **Frontend**:
  ```bash
  cd frontend
  npm run lint
  npm run build
  ```

## 🧩 Key Patterns & Conventions

- **EDC Extensions**: Custom logic is implemented as EDC extensions in `extensions/`. Use the `spi` module for interfaces and `src/main/java` for implementation.
- **Gradle Kotlin DSL**: All build scripts use `.kts`. Dependencies are managed in `gradle/libs.versions.toml`.
- **Docker Networking**: Services communicate via the Docker network defined in `docker-compose.health.yml`. Use service names (e.g., `provider-controlplane`) for inter-service communication.
- **Data Seeding**: The `seed-health.sh` script uses `curl` to interact with the Management APIs of the EDC connectors. Use this as a reference for API usage.

## 🔌 Integration Points

- **Management APIs**:
  - Provider Control Plane: `http://localhost:8191/api/management/v3`
  - Consumer Control Plane: `http://localhost:8081/api/management/v3`
- **Identity Hub**: Manages Verifiable Credentials (VCs).
- **Backend Mock**: Simulates the EHR system, accessible at `http://localhost:3001` (or `http://backend-mock:3001` inside Docker).

## ⚠️ Gotchas

- **Wait for Startup**: Ensure all services are healthy before running `seed-health.sh`.
- **Ports**: Be aware of port mappings in `docker-compose.health.yml`.
- **Clean State**: If you encounter issues, try `docker-compose -f docker-compose.health.yml down -v` to clean volumes.
