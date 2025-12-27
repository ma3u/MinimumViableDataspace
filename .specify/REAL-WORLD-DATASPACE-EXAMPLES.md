# Real-World Dataspace Examples

Reference implementations and operational dataspaces across different domains.

## Overview

Beyond Catena-X (automotive/manufacturing), multiple operational dataspaces demonstrate the MVD template's applicability across domains. This document provides real-world examples to guide domain-specific implementations.

## Energy Sector Dataspaces

### 1. Energy-Data-X (Germany)
**Website**: https://www.energydata-x.eu  
**Status**: Operational (2023+)  
**Consortium**: 17 partners including TenneT, Amprion, Fraunhofer IEE/IOSB, Atos, Microsoft, Ostrom

**Purpose**: Cross-sector data ecosystem for energy transition and climate neutrality

**Key Features**:
- **Gaia-X compliant** infrastructure
- **Real-time data** from smart meter gateways
- **Use Cases**:
  1. Cross-sectoral flexibility development
  2. Balancing group management quality optimization
  3. Grid operator coordination (TSO/DSO data exchange)

**Technical Stack**:
- International Data Spaces (IDS) architecture
- IDSA Data Space Protocol
- Smart meter gateway integration
- Real-time grid monitoring

**Regulatory Framework**:
- Gaia-X trust framework
- GDPR compliance for household data
- EU Network Codes compliance
- German Energy Industry Act (EnWG)

**MVD Application**:
```bash
# Create Energy-Data-X branch
git checkout -b energy/energydata-x-demo

# Customize for energy domain
.specify/spec.md         → Real-time grid balancing, flexibility markets
.specify/policies/       → IEC 61850 compliance policies, grid operator access
.specify/data-models/    → Smart meter data, balancing group schemas
extensions/              → Smart meter gateway connector, time-series aggregation
```

### 2. OMEGA-X (European Energy Data Space)
**Website**: https://omega-x.eu  
**Status**: EU-funded project (30 partners, 11 countries)  
**Lead**: Atos with EDF, ENGIE, EDP, Elia, Energy Web

**Purpose**: Multi-vector energy data space (electricity, gas, heat)

**Key Features**:
- **Federated infrastructure** and data marketplace
- **Four use case families**:
  1. Renewables: RES operation and maintenance optimization
  2. Grid integration: TSO/DSO coordination
  3. Energy communities: Prosumer flexibility
  4. Cross-sector coupling: Mobility + heating integration

**Standards**:
- Gaia-X compliant
- IDSA Dataspace Protocol
- IDS Reference Architecture Model (IDS-RAM)
- Eclipse Dataspace Components (EDC)

**Architecture**:
- Data Space Business Alliance (DSBA) recommendations
- Federated catalog for asset discovery
- Consent management for personal energy data
- Multi-party contract framework

### 3. SYNERGIES (Energy Data Space Implementation)
**Website**: https://energydataspaces.eu  
**Focus**: Data-driven intelligence ecosystem for energy operators

**Key Innovations**:
- Prosumer inclusiveness in market transactions
- Knowledge sharing across energy value chain
- Heterogeneous energy systems integration

## Mobility & Tourism Dataspaces

### EONA-X (Mobility, Transport & Tourism)
**Website**: https://eona-x.eu  
**Founded**: 2022 (non-profit association)  
**Members**: Amadeus, Renault, Air France-KLM, Groupe ADP, Aéroport Marseille-Provence, Accor, SNCF

**Purpose**: Data sharing for mobility, transport, and tourism sectors

**Key Features**:
- **Gaia-X lighthouse project**
- **Real-time mobility data** for multimodal travel
- **Open-source solution** for data exchange
- **Paris 2024 Olympics** - Digital twin for delegation welcome (flagship use case)

**Technical Stack**:
- Eclipse Dataspace Components (EDC)
- EDC MVD (Federated Catalog, Identity Hub, Registration Service)
- Amadeus as technical platform provider
- X.509 certificate authentication (DAPS)
- OAuth2 access tokens

**Use Cases**:
1. **Multimodal trip tracking** - Real-time mobility data exchange
2. **MaaS applications** - Employee daily commute optimization
3. **Tourism coordination** - Airport + hotel + transport integration
4. **Event management** - Olympics delegation logistics

**Governance**:
- EU trust framework compliance
- GAIA-X specifications
- Identity verification and digital certificates
- Smart contract negotiation

**MVD Application**:
```bash
# Create EONA-X style mobility branch
git checkout -b mobility/transport-tourism-demo

# Customize for mobility domain
.specify/spec.md         → Multimodal transport, tourism data exchange
.specify/spec.yaml       → Mobility API, transport scheduling, booking systems
.specify/policies/       → GDPR travel data, operator-specific access policies
.specify/data-models/    → Trip data, booking schemas, real-time location
extensions/              → Transport mode integrators (rail, air, road, maritime)
frontend/                → Trip planner UI, mobility-as-a-service dashboard
```

**Regulatory Compliance**:
- GDPR for traveler personal data
- EU transport regulations (rail, aviation, maritime)
- Tourism data protection standards

## Education & Skills Dataspace

### Prometheus-X (Education & Skills)
**Website**: https://prometheus-x.org  
**Status**: Operational Gaia-X initiative  
**Focus**: Data Space of Education and Skills (DASES)

**Purpose**: Human-centric, sustainable data space for education sector

**Key Features**:
- **Personal Data Intermediary (PDI)** for learner data sovereignty
- **Consent management** for educational data
- **Multi-party contract framework**
- **Service Chain Protocol** - Automated workflows for data processing
- **Decentralized AI training** preserving privacy

**Technical Stack**:
- **Prometheus-X Dataspace Connector (PDC)** - IDS compliant
- IDSA Data Space Protocol (DSP) implementation
- MongoDB persistence
- AWS deployment (ECS, Lambda, S3, Glue)
- Personal data intermediary services

**Building Blocks**:
1. **Catalog Service** - Asset registration and discovery
2. **Contract Manager** - Negotiation and agreement
3. **Consent Agent** - Automated consent management
4. **Data Value Chain Tracker** - Provenance tracking
5. **DAAV** - Data Alignment, Aggregation, Vectorization
6. **Distributed Learning Analytics**

**Use Cases**:
1. **Skills matching** - Intercontinental job matching (EU-Korea example)
2. **Personalized learning** - AI-driven education paths
3. **Credential verification** - Digital diploma sharing
4. **EdTech data monetization** - Provider/consumer marketplace

**Regulatory Framework**:
- GDPR for learner data
- EU Digital Education Action Plan
- Personal data sovereignty (individual as data initiator)

**MVD Application**:
```bash
# Create Prometheus-X style education branch
git checkout -b education/skills-dataspace-demo

# Customize for education domain
.specify/spec.md         → Learner profiles, credential verification, skills assessment
.specify/spec.yaml       → Education API, credential issuance, learning analytics
.specify/policies/       → Learner consent policies, FERPA/GDPR compliance
.specify/constitution.md → Education data ethics, learner rights
.specify/data-models/    → Learner records, credentials (OpenBadges, VC), course metadata
extensions/              → Credential verification, consent management, LRS integration
frontend/                → Learner dashboard, credential wallet, skills matcher
```

**Standards**:
- xAPI (Experience API) for learning analytics
- IMS Global standards (LTI, OneRoster)
- W3C Verifiable Credentials for digital credentials
- ODRL for usage policies

## Cross-Domain Patterns

### Common Technical Components

| Component | Catena-X | Energy-Data-X | EONA-X | Prometheus-X |
|-----------|----------|---------------|---------|--------------|
| **Connector** | EDC | IDS/EDC | EDC MVD | PDC (IDS-compliant) |
| **Identity** | did:web, BPN | Gaia-X Identity | X.509 DAPS | Personal Data Intermediary |
| **Catalog** | Federated Catalog | IDSA Metadata Broker | Federated Catalog | Prometheus-X Catalog |
| **Policies** | ODRL (CX-0152) | Gaia-X policies | Gaia-X + ODRL | ODRL + Consent |
| **Standards** | DSP, DCP | IDSA, Gaia-X | DSP, IDSA | DSP, IDS |

### Common Use Case Patterns

1. **B2B Data Exchange** (Catena-X, Energy-Data-X)
   - Business Partner authentication (BPN, Operator ID)
   - Purpose-based access (Traceability, PCF, Balancing)
   - Industry-specific credentials

2. **B2C/Personal Data** (EONA-X, Prometheus-X)
   - User consent management (GDPR Art. 6/7)
   - Personal Data Intermediary (PDI)
   - Individual as data controller

3. **Real-Time Data Streams** (Energy-Data-X, EONA-X)
   - Time-series data (smart meters, GPS tracking)
   - Event-driven architecture
   - Streaming connectors (Kafka, MQTT)

4. **Multi-Party Contracts** (Prometheus-X, EONA-X)
   - Service chains with multiple processors
   - Automated contract negotiation
   - Complex data value chains

## Implementation Decision Matrix

| Your Domain | Similar Dataspace | Key Patterns to Adopt |
|-------------|-------------------|----------------------|
| **Energy/Utilities** | Energy-Data-X | Smart meter integration, TSO/DSO coordination, IEC 61850 |
| **Transportation/Logistics** | EONA-X | Multimodal data, real-time tracking, booking systems |
| **Education/HR** | Prometheus-X | Consent management, credentials, personal data intermediary |
| **Manufacturing/Automotive** | Catena-X | BPN authentication, traceability, part instance digital twins |
| **Health/Research** | MVD-health | FHIR, consent (Art. 89), research data secondary use |

## Getting Started with Domain Branches

### 1. Energy Dataspace (Energy-Data-X Pattern)
```bash
git checkout -b energy/smart-grid-demo
# Follow docs/cloud-deployment-options.md for Energy use case
# Reference: .specify/DOMAIN-BRANCHING-GUIDE.md
```

### 2. Mobility Dataspace (EONA-X Pattern)
```bash
git checkout -b mobility/maas-demo
# Implement multimodal transport integration
# Reference: EONA-X open-source components
```

### 3. Education Dataspace (Prometheus-X Pattern)
```bash
git checkout -b education/learning-analytics-demo
# Implement PDI and consent management
# Reference: Prometheus-X PDC on GitHub
```

## References

### Official Websites
- [Energy-Data-X](https://www.energydata-x.eu)
- [OMEGA-X](https://omega-x.eu)
- [SYNERGIES Energy Data Space](https://energydataspaces.eu)
- [EONA-X](https://eona-x.eu)
- [Prometheus-X](https://prometheus-x.org)
- [Gaia-X](https://gaia-x.eu)
- [IDSA (International Data Spaces)](https://internationaldataspaces.org)

### Technical Documentation
- [Eclipse Dataspace Components](https://eclipse-edc.github.io)
- [IDSA Dataspace Protocol](https://docs.internationaldataspaces.org)
- [Prometheus-X GitHub](https://github.com/Prometheus-X-association)
- [Catena-X Standards](https://catenax-ev.github.io/docs/next/standards/overview)

### EU Data Strategy
- [European Data Strategy](https://digital-strategy.ec.europa.eu/en/policies/strategy-data)
- [Data Spaces Support Centre (DSSC)](https://dssc.eu)
- [Data Spaces Business Alliance (DSBA)](https://data-spaces-business-alliance.eu)

## Next Steps

1. **Choose your domain** from the examples above
2. **Create a branch** using the appropriate naming convention
3. **Customize `.specify/` templates** with domain-specific patterns
4. **Reference the similar operational dataspace** for technical decisions
5. **Follow BLUEPRINT Phases 2→6** for complete implementation
