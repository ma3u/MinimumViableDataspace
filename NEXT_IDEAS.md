
# Create a static Github page from this Demo

Create this app as static page and push this to Github pages to have a live documentation of the project.
Use the Status: Backend offline badge to indicate that the backend is not running. 

# Deploy this to Azure as Live Demo (Azure Container Apps)

# Linkedin Article
- Start with a Mock Implementation (frontend + backend)
- Amazing featback froom the health community
- Spec Driven Development to integrate EDC features step by step
- Based on Dataspace Protocol 2025-01
- H7 FHIR R4 for health data representation
- DCAT-AP for Health for metadata interoperability
- ODRL Policies for consent management
- Verifiable Credentials for identity and consent representation
- Confidential Compute for data visiting scenarios
- EHDS Art. 51 compliance for health data access rights
- Using EDC as core dataspace technology and Minim Viable dataspace as reference implementation
- Github Copilot and amazing Antropihic Opus 4.5 to accelerate development
- Test Driven Development with Vitest and Playwright
- Hashicorp Vault for secret management in EDC
- PostgreSQL as persistent storage for EDC
- Dockerized deployment for easy setup and testing

## Title: Building a Minimum Viable Dataspace for Health Data: From Mock to EHDS Compliance based on the Dataspace Protocol

LinkedIn Post with the link to the arcticle:
My journey in building a Minimum Viable Dataspace for Health Data with AI Spec Driven Devlopment  🚀

In this article, I share my experience in developing a Minimum Viable Dataspace (MVD) for health data, focusing on compliance with the European Health Data Space (EHDS) regulation and leveraging the Dataspace Protocol.

Read the full article here: [link to the article]

# Other Ideas for the Health demospace project:

## Dataspace Insider View panel in the frontend 

- to show the interaction between data provider and data consumer based on the dataspace protocol. Use a centralied logging system to capture all interactions.
- if the backend is online show live interactions
- The panel is hidden
the panel is shown when a button is clicked on the right side of the screen
- The panel shows a timeline of interactions between data provider and data consumer
- Each interaction is represented as a card with details such as timestamp, action type, and status from the central logging system
- The panel is scrollable to view more interactions
- the panel show the steps of the dataspace protocol as a progress indicator at the top
- The panel can be closed by clicking a close button or outside the panel area

Show the inital dataspace initialization events thats seeding manually in the insider panel. 

On the first page before the use case starts teh user should see the dataspace initatialization / onboarding steps in the insider panel.

- each seeding type should trigger an event for the panel
- the seeding happen outside the EDC backend to show the events later in the panel
- show the new number of events in the panel button
- show a loading indicator while the seeding is in progress
- show success or error message when seeding is complete
- show the events for:

1.  Seeding assets in the catalog
2.  Seeding data offerings  
3.  Seeding Identities in IdentityHub

In general show the DID credential verification events. Each positive and negative verification should trigger an event

http://localhost:4000/api/events
http://localhost:4000/api/events


## Implementing Guideline for Confidential Compute in Health Dataspaces: A Practical Guide using EDC's data visiting
- Market Analytics for Data Clean Rooms in Health Dataspaces: Opportunities and Challenges

## Health specific articles:
- Building a FHIR R4 Compliant Health Dataspace: Best Practices and Lessons
- DCAT HEalth AP Editor 2: Creating and Managing Metadata for Health Dataspaces
- FHIR R4 Data Generator for Health Dataspaces: A Tool for Testing and Development

## EDC specific articles:

- Deep Dive into ODRL Policies for Consent Management in Health Dataspaces with a Focus on EHDS Compliance
- End-to-End Testing Strategies for Health Dataspaces: Ensuring Reliability and Compliance (Pact, Vitest, Playwright)
- Leveraging Verifiable Credentials for Secure Identity Management in Health Dataspaces: A Step-by-Step Implementation Guide



Create a comprehensive Dashboards in Grafana for Monitoring the Health Dataspace 

- Show Dataspace Health (uptime, response time, error rates)
- Show Data Transfer Metrics (volume, speed, success rates)
- Show Consent Management Metrics (number of consents, types of consents, consent expirations
- Show User Activity Metrics (active users, user sessions, user actions)
- Show System Resource Metrics (CPU usage, memory usage, disk usage, network usage)
- Show Alerting Metrics (number of alerts, types of alerts, alert resolutions)
- Show Compliance Metrics (EHDS compliance status, data access logs, consent logs)
- Show Data Visiting Metrics (number of data visits, data visit duration, data visit success rates)
- Show Confidential Compute Metrics (number of confidential compute instances, instance uptime, instance resource usage)
- Show EDC Specific Metrics (number of assets, number of data offerings, number of identities)
- Integrate with Prometheus to collect metrics from EDC and other components of the health dataspace
- Use Grafana's alerting features to notify when certain thresholds are met (e.g., high error rates, low data transfer speeds)
- Create custom dashboards for different stakeholders (e.g., data providers, data consumers, system administrators)
- Use Grafana's templating features to create dynamic dashboards that can be filtered by different dimensions (e.g., time range, data provider, data consumer)
- Document the dashboards and their metrics for easy understanding and usage by stakeholders
- Share the dashboards with stakeholders via Grafana's sharing features (e.g., public links, snapshots)
