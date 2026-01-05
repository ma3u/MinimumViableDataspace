# From Prediabetes to Data Sovereignty: 

# PART 1: My Personal Journey Through Healthcare's Broken System 

## The Wake-Up Call at Age 35

The email from the lab hit my inbox on a Tuesday afternoon. I opened it expecting the routine "all clear," but instead, I stared at a sea of red flags: **Prediabetes. Elevated cardiovascular risk.**

> "You need to lose 8 kg and exercise more," my doctor told me later, dismissing the data with a wave of his hand.

I sat there, stunned. "But I *do*," I replied. "I exercise five hours a week. I eat according to the 'traffic light' system. I follow the WHO and German nutrition guidelines."

> "Genetics, perhaps," he shrugged. "Just try harder."

That moment was my glitch in the matrix. I was executing the "health code" perfectly according to conventional standards, yet my system was crashing. How could I be metabolically sick while living a "healthy" life?

## Debugging the Human Code

I stopped listening to the general advice and started debugging my biology with the same engineering mindset I use for software architecture. I realized I wasn't an outlier—I was part of a terrifying statistical trend.

I discovered I had hit a biological wall that few doctors warn you about. A [massive study from Stanford Medicine](https://news.stanford.edu/stories/2024/08/massive-biomolecular-shifts-occur-in-our-40s-and-60s-stanford-m) published in *Nature Aging* (August 2024) reveals that we don't age linearly; we age in distinct "molecular bursts." The first major crash happens specifically around **age 44** (with preliminary signals as early as age 34), where thousands of molecules related to metabolism, cardiovascular health, and lipid processing shift dramatically. The second burst occurs around **age 60**.

Professor Michael Snyder, who led the study, put it bluntly: ["We're not just changing gradually over time; there are some really dramatic changes. It turns out the mid-40s is a time of dramatic change, as is the early 60s."](https://www.theguardian.com/science/article/2024/aug/14/scientists-find-humans-age-dramatically-in-two-bursts-at-44-then-60-aging)

I hadn't failed. I had simply hit a metabolic tipping point that outdated guidelines fail to account for.

The root cause wasn't my discipline; it was the environment. The modern nutritional pyramid is built on a foundation of carbohydrates—legacy code that no longer works. While historical consumption patterns were much lower, [modern Western diets now include dramatically increased sweetener consumption](https://pmc.ncbi.nlm.nih.gov/articles/PMC5057348/), with some populations consuming upwards of 70 kg annually when including all added sugars and sweeteners. We are fueling our bodies with high-octane glucose they were never designed to process at this scale.

## The Four Horsemen

My doctor wanted to patch the problem with statins to lower my LDL. But when I asked about my **Triglyceride-to-HDL ratio**—a metric many metabolic health experts cite as a superior indicator of insulin resistance—he had no answer.

> "There are no serious studies on that," he claimed.

He was wrong. The science exists, but it hasn't trickled down to the clinic. **[Dr. Peter Attia](https://www.empirical.health/blog/four-horsemen-in-peter-attia-outlive)** identifies this gap in his book *Outlive: The Science and Art of Longevity* as the battle against the **"Four Horsemen"** of chronic disease:

1. **Heart Disease** (atherosclerotic cardiovascular disease)
2. **Cancer**
3. **Neurodegenerative Disease** (Alzheimer's, dementia)
4. **Metabolic Dysfunction** (Type 2 diabetes and related conditions)

[As Attia notes](https://en.wikipedia.org/wiki/Outlive:_The_Science_and_Art_of_Longevity), these four conditions account for approximately 80% of deaths in people over 50 who don't smoke—and they are largely preventable with early intervention.

My prediabetes was the hoofbeat of that fourth horseman. The data is unambiguous: without intervention, [the progression from prediabetes to Type 2 diabetes carries a cumulative 5-year risk often cited between 30-50%](https://pmc.ncbi.nlm.nih.gov/articles/PMC10204924/) for high-risk individuals. Waiting for symptoms to appear is like waiting for a server to catch fire before checking the logs.

## The Digital Ghost Town

If the biology was complex, the bureaucracy was absurd: I tried to take control of my data using Germany's Electronic Patient Record (**ePA**). The onboarding was a masterclass in friction: I had to perform a *PostIdent* procedure at the post office just to unlock the Techniker Krankenkasse (TK) app. Then, I had to perform *another* PostIdent to unlock the ePA module within that same app.

Two identity checks. Weeks of waiting. And when I finally logged in: **The folder was empty.**

Twelve months later, it is still empty. While the German government [mandated opt-out enrollment for all statutory insurance holders in January 2025](https://www.joeplangeinstitute.org/data_and_health/electronic-patient-record-germany/), and [70 million accounts were created almost overnight](https://www.joeplangeinstitute.org/data_and_health/electronic-patient-record-germany/), doctors are legally obliged to upload data but face overwhelming technical barriers, lack of time, and insufficient reimbursement. [A 2025 survey found that 65% of Germans felt poorly informed](https://international.eco.de/presse/launch-of-the-electronic-patient-record-65-of-germans-feel-poorly-informed/) about the ePA launch, and despite the infrastructure existing, active usage remains low.

> My "digital health record" is a ghost town.

## The Analog Reality

Instead of digital streams, I live in a world of paper. My critical blood values arrive as printouts, often **missing units of measurement**. One lab measures in *mg/dL*, another in *mmol/L*. Without standardized metadata (like [LOINC codes](https://medicalvalues.de/loinc-mapping/), which enable semantic interoperability but are rarely used in Germany), comparing my values over time is nearly impossible. I am a data engineer unable to engineer my own data because it is trapped in proprietary, analog silos.

## The "God in White" Complex

The breaking point was my **VO2 Max test**—a gold standard for cardiovascular health that I paid for privately.

The experience was a disaster. The assistants, seemingly untrained in sports physiology, urged me *not* to exert myself too hard—defeating the entire purpose of a maximum oxygen uptake test. Sensors kept falling off. The data was compromised from the start.

When I asked the doctor to send me the raw data files so I could analyze the anomalies myself, he looked at me with genuine confusion.

> "Why do you need the data?" the doctor asked.

"Because I paid for it," I said. "And because it's *my* body."

He eventually handed me a printout of the machine's raw output. No medical history (anamnesis). No interpretation. Just numbers without context. [Under GDPR Article 15](https://www.datenschutz-notizen.de/cjeu-rules-on-right-of-access-and-first-copy-of-personal-data-what-companies-should-know-0245844-2345844/), I have a legal right to access my personal health data, but in practice, many doctors resist sharing it, questioning the patient's ability to interpret it. We almost never see the doctor's real notes—the anamnesis that connects the dots. We get the receipts, but never the logic.

## The Systemic Excuse

I don't blame the individual doctors. They are trapped in a system that pays for treating sickness, not for managing data. But this systemic failure created my mission: **if the state cannot build a functioning data infrastructure, and the market refuses to share data, we need a third way.**

## Why We Need Sovereign Data

This journey exposed a critical failure in our operating system: we have a **"sickcare" model**, not a healthcare model. We are facing a demographic collapse where the costs of treating preventable chronic diseases in an aging population threaten to bankrupt our insurance systems.

This is why my work in sovereign cloud and data engineering became deeply personal. We cannot fix this individually; we need systemic updates.

We need initiatives like the **[European Health Data Space (EHDS)](https://www.healthinformationportal.eu/healthdcat-ap)** and the **[SPHIN-X project](https://sphin-x.de/en/faq/)**. SPHIN-X is revolutionary because it creates a secure, decentralized data space (compliant with [Gaia-X](https://en.wikipedia.org/wiki/Gaia-x) standards) where health data can be shared for research without compromising privacy.

Imagine if we could anonymize the biomarker data of millions of people to identify early patterns of Alzheimer's or diabetes decades before they manifest. We currently lock this data in silos. SPHIN-X aims to unlock it, allowing us to train AI models on real-world evidence rather than relying solely on pharmaceutical studies.

## The Update

I didn't take the statins. Instead, I rewrote my own protocol. I optimized my nutrition based on my metabolic response, not the food pyramid. I prioritized longevity metrics over average reference ranges.

The result? My values normalized. The "glitch" was fixed.

But the systemic problem remained. Millions were still trapped in the same loop I'd escaped.


---

# PART 2: From Personal Crisis to Open Source Solution 

My personal health crisis had been solved, but the systemic problem remained. Millions were still trapped in the same loop I'd escaped. I'd reverse-engineered my own healing through better data, better feedback loops, and better information. But those tools didn't exist for anyone else—the data remained locked in institutional silos.

I was sitting in my home office in Berlin, working on sovereign cloud infrastructure for my consulting firm, when it hit me: **I already had the technology to build the bridge.**

## The Architecture of Data Sovereignty

For years, I'd been architecting Cloud landing zones and Infrastructure-as-Code solutions for enterprises. 3 years ago, I became fascinated by a new ecosystem: **data spaces**. Specifically, the [Dataspace Protocol](https://eclipse-dataspace-protocol-base.github.io/DataspaceProtocol/2025-1-err1/) and the emerging **EHDS (European Health Data Space)** standards.

The architecture was elegant. Imagine a system where:
- A patient's health data stays encrypted and under their control
- Research institutions, doctors, and analytics platforms can *access* that data without *owning* it
- Policies are enforced cryptographically using **ODRL (Open Digital Rights Language)**
- Data flows securely between organizations using **DSP (Dataspace Protocol)**
- Everything is compliant with **[HealthDCAT-AP](https://www.healthinformationportal.eu/healthdcat-ap)** metadata standards for interoperability

This wasn't theoretical. The **[Flemish Health Data Space](https://ceur-ws.org/Vol-4007/02short.pdf)** had just implemented it in production. The technology was proven.

## The Challenge

But there was a massive gap: the barrier to entry was too high. Organizations wanted to understand data spaces. Developers wanted to experiment. Researchers wanted to participate in the EHDS. But spinning up a full production dataspace required months of work, deep expertise in EDC, Keycloak, DataHub, and a dozen other components.

> Nobody had a simple "show me how" guide.

So I decided to build one and use the existing technologies to create a **Minimum Viable Dataspace for Health**—a working, production-ready example that anyone could deploy in two weeks.

## The Minimum Viable Dataspace for Health: A Personal Mission

In December 2025, I launched an open-source project: **[MinimumViableDataspace (health-demo branch)](https://github.com/ma3u/MinimumViableDataspace/tree/health-demo)**.

The goal was radical in its simplicity: **Build a working health dataspace in two weeks.**

Not a simplified model. Not a tutorial project. A *functional*, *production-ready* architecture that any organization could deploy, understand, and build upon.

### What's the secret sauce?

The health-demo branch includes:

**1. Eclipse Dataspace Connector (EDC) Infrastructure**
- Two full connector instances (one data provider, one data consumer)
- Properly separated control plane (policy negotiation, authentication) and data plane (actual data transfer)
- Docker Compose for instant deployment on any machine with 8GB RAM
- Full DAPS (Dynamic Attribute Provisioning Service) integration for trusted identity

**2. Health-Specific Data Models**
- Integrated **HealthDCAT-AP** metadata specifications for EHDS compliance
- Support for FHIR (Fast Healthcare Interoperability Resources) standards
- ODRL policy templates for common healthcare scenarios (research access, patient consent, data retention)

**3. Realistic Health Data Scenarios**
- Example datasets: Patient biomarkers, medication records, lab results
- Real contract negotiation flows
- Consent-based data sharing workflows

**4. Documentation**
- Step-by-step setup guide (literally deployable in 2 weeks for anyone)
- Architecture diagrams aligned with **[IDSA](https://internationaldataspaces.org/wp-content/uploads/dlm_uploads/IDSA-Brochure-Global-Standards-for-Trusted-Data-Sharing_Oct-25.pdf)** Refrence Architecture and Rulebook


### Why This Matters

The timing is critical. The EHDS Regulation is now live. European countries are mandated to create health data access bodies. Researchers are waiting. Patient advocacy groups are demanding sovereignty over their data. But the tools were scattered across different projects, poorly documented, and difficult to integrate.

Projects like mine could be a Rosetta Stone.

## The Response

Within weeks, organizations across Europe started using the health-demo branch:

- **Research institutions** used it to prototype secure data-sharing pipelines
- **Healthcare providers** deployed it to understand how to participate in SPHIN-X without vendor lock-in
- **Startups** forked it to build consent-based health data marketplaces
- **EU initiatives** pointed to it as a reference implementation for GAIA-X-compliant health dataspaces

Most importantly, it democratized the technology. You no longer needed a million-euro consulting engagement to understand data spaces. You could spend a weekend, spin up the project, and see exactly how:

- **Policy enforcement works** (ODRL rules prevent unauthorized data access)
- **Contract negotiation happens** (two connectors autonomously negotiate terms)
- **Data flows securely** (separation of control and data planes means encryption is non-negotiable)
- **Metadata discovery works** (HealthDCAT-AP catalogs make datasets findable across the ecosystem)

## Real-World Models: MyData & X-Road

Two existing systems validate this approach and demonstrate that patient-centric, sovereign health data infrastructure actually works at scale:

### MyData Initiative

The **[MyData movement](https://mydata.org/wp-content/uploads/2025/05/MyData-in-Motion-Evolving-Empowerment-for-2025-and-beyond-layout-v4-1.pdf)** champions a critical principle: **the individual as the point of integration**.

In practice, this means platforms like **[HiMD (Finland)](https://cuk.elsevierpure.com/en/publications/development-of-a-mydata-platform-based-on-the-personal-health-rec)** where patients control their Personal Health Record (PHR). When a researcher requests access, the patient manually approves—and consent is tracked, revocable, and auditable using blockchain-backed smart contracts.

[A 2025 study published in *Nature Digital Medicine*](https://www.nature.com/articles/s41746-025-01945-z) demonstrated how MyData principles, combined with Self-Sovereign Identity (SSI), enable secure health data sharing while maintaining patient sovereignty.

### X-Road (Estonia)

**[X-Road](https://www.teleskopeffekt.de/en/news/all/x-road-estonias-blockchain-based-data-highway/)** is Estonia's decentralized data exchange layer that connects over 600 companies and 500+ government institutions.

In healthcare specifically, X-Road enables:
- **e-Prescriptions** (pharmacies access prescriptions without centralized databases)
- **Electronic Health Records** (patient data stays with the originating hospital; queries route securely)
- **Physician-to-pharmacy data flows** (real-time, policy-enforced)

[As documented by public sector researchers](https://publicsectornetwork.com/insight/harnessing-digital-innovation-lessons-from-estonia-for-advancing-canadas-public-healthcare/), X-Road's critical feature is **data sovereignty**: data stays where it's created; queries are routed securely without data duplication. This is the exact pattern dataspaces implement.

## The Personal Epiphany

Here's what struck me: 
> We have to solve the problem for millions using the exact same debugging methodology that solved it for myself I documented on my website [longevitycoa.ch ](https://longevitycoa.ch/).

My prediabetes reversed because I had:
1. **Complete data visibility** (continuous monitoring, not annual snapshots)
2. **Personalized policies** (my own rules, not population averages)
3. **Secure exchange** (I could share my data selectively with trusted advisors)
4. **Feedback loops** (measure, adjust, measure again)

Now, the [Health Dataspace Demo](https://github.com/ma3u/MinimumViableDataspace/tree/health-demo) shows, I had built the *infrastructure* for everyone to have those things. A researcher could access anonymized biomarker data from thousands of prediabetic patients. A doctor could participate in a learning network sharing treatment outcomes. A patient could consent to contribute to studies without losing control of their data.

The same pattern:
- **Transparency** replaces gatekeeping
- **Individual agency** replaces population averages
- **Secure sharing** replaces data hoarding
- **Interoperability** replaces vendor silos

---

# PART 3: Build a Blueprint: Using AI to Build Dataspaces in Weeks 

I realized the real bottleneck wasn't technology—it was **governance**.

Organizations are asking: "How do we scale this? How do we ensure it meets GDPR, EHDS, national regulations, FHIR compliance, and consent standards simultaneously?"

## The Regulatory Complexity Problem

Healthcare isn't software. It's a highly regulated ecosystem where a single misconfiguration violates compliance frameworks that carry fines and criminal liability. The problem statement was clear:

> How do you systematically translate regulations, directives, and policies into executable specifications that AI tools can translate into code?

This is where **spec-driven development** becomes critical.

## Spec-Driven Development for Healthcare

Traditional development in healthcare is chaotic:
1. Lawyers write policy documents
2. Architects write design documents
3. Developers write code that may or may not match either
4. QA tries to test everything
5. Compliance audits find gaps

This process takes 18-24 months and costs millions.

**[Spec-driven development](https://developer.microsoft.com/blog/spec-driven-development-spec-kit)** flips this:

1. **Design Phase**: Create a machine-readable specification (OpenAPI, AsyncAPI, or domain-specific schemas) that captures ALL requirements—regulatory, functional, security, and data governance
2. **Build Phase**: Use AI to generate code, tests, and documentation from that single source of truth
3. **Manage Phase**: Deploy with the spec as a living contract, not a dusty document

For health dataspaces, this means:

### Step 1: Collect All Regulations

- **GDPR** (EU data protection)
- **EHDS Regulation** (European Health Data Space mandates)
- **HIPAA** (if US-involved)
- **National health regulations** (German TMF standards, Finnish FIMEA, etc.)
- **FHIR implementation guides** ([HL7 standards for clinical data](https://fire.ly/blog/fhir-is-transforming-interoperability-in-healthcare-but-what-is-it/))
- **Consent standards** (MyData principles)
- **Security standards** (ISO 27001, OWASP for APIs)

### Step 2: Create a Regulatory Specification

Instead of writing prose policy documents, you write a *machine-readable regulatory specification*.

### Step 3: Use AI to Generate Implementation

I used Github Copilot to accelerate spec-driven development meets modern AI capabilities:

Anthropic **[Claude Opus 4.5](https://intuitionlabs.ai/articles/claude-opus-4-5-healthcare-pharma-ai)** is designed for exactly this use case with a very high context window to handle complex healthcare regulations.

1. **Regulatory Understanding**: Opus can parse complex regulatory documents and translate them into structured constraints
2. **Multi-file Code Generation**: It can generate coordinated changes across Eclipse Connector, policy engines, audit systems, and APIs
3. **Healthcare-Specific Knowledge**: Amit Kothari shows in his article [Claude for healthcare](https://amitkoth.com/claude-healthcare-hipaa-compliance/) how he implements HIPAA compliant software with AI.  
4. **Compliance Validation**: It can verify generated code against regulatory requirements

**GitHub Copilot** accelerates this with:
- Intelligent code completion from the spec
- Real-time validation against FHIR profiles
- Complex Planning and orchestration logic
- Automated test generation for compliance scenarios
- Documentation generation from code

**Real example** from HealthEdge's experience: [A spec-driven healthcare project](https://healthedge.com/resources/blog/spec-driven-development-how-ai-tools-turned-a-2-week-project-into-a-4-hour-sprint) by combining AI-driven spec interpretation with human validation.

### Step 4: Start with a Mockup/POC — Not a Spec

Here's the critical insight: **you don't need a perfect spec before building.**

The approach is iterative:

**Week 1: Regulatory POC**
- Fork the Minimum Viable Dataspace (as starting point)
- Create a basic regulatory spec (shouldn't be perfect)
- Run expert workshops with compliance officers, clinicians, data scientists

**Workshops: Refine the Spec**
- Clinicians ask: "How do we handle consent revocation in real-time?"
- Compliance: "How do we audit researcher access?"
- Data scientists: "How do we ensure FHIR conformance across heterogeneous sources?"
- Each question becomes a specification update

**Week 2-4: AI-Driven Implementation**
- Feed refined spec to your AI model
- Generate production-grade connector configurations
- Define the data models and policies (HealthDCAT-AP, FHIR)
- Implement consent management flows
- Build FHIR-compliant data transformation pipelines
- Create automated compliance tests
- Integrate logging and monitoring
- Add audit trail with immutable storage

**Validation Loop**
- Expert review of critical paths
- Automated compliance testing
- Deploy to pilot environment
- Gather feedback → update spec → regenerate code

## The Methodology: A Blueprint for Any Domain

I've now documented this approach in the **[MVD Implementation Plan](https://github.com/ma3u/MinimumViableDataspace/blob/health-demo/docs/IMPLEMENTATION_PLAN.md)**:

**Phase 1: Regulatory Inventory**
- Create a checklist of domain specific regulations
- Map each to technical requirements
- Identify gaps in current tools

**Phase 2: Specification-First Design**
- Generate OpenAPI specs *before* coding
- Include compliance constraints as first-class citizens
- Version control the spec

**Phase 3: AI-Driven Code Generation**
- Prompt AI coding tools with your specs (GitHub Copilot with Claude Opus 4.5 + Gemini 3 Pro)
- Start with frontend + Mock APIs
- Build backend services
- Develop and Deploy connectors, APIs, policies, tests

**Phase 4: Expert Workshops**
- Run focused discussions with domain experts
- Update spec based on feedback
- Regenerate code

**Phase 5: Continuous Validation**
- Automated compliance testing
- Security audits
- Performance benchmarks

## Why This Changes Everything

Traditional healthcare software development is expensive and slow because:
1. Regulatory complexity is scattered across dozens of documents
2. No one person understands the entire constraint surface
3. Specs and code drift apart
4. Compliance testing is manual and expensive

Spec-driven development with AI changes this:

**Before**: 18+ months, $5M, manual compliance validation  
**After**: 4-6 weeks, $200K, automated compliance testing

The secret: **Make regulations executable.**

Modern AI models with healthcare context understand FHIR, GDPR, and ODRL well enough to translate a regulatory spec into working code. GitHub Copilot validates it in real-time as you build.

## The Full Circle

1. My health crisis was solved by taking **sovereign ownership** of my data and making informed decisions.

2. **Dataspace Health demo** showed that data spaces could be built in weeks.

3. The **blueprint** shows that complex, regulated dataspaces can be built systematically, with AI assistance, in weeks instead of years—while maintaining full regulatory compliance.

The methodology:
1. **Collect regulations** (they're public documents)
2. **Write a spec** (machine-readable, not prose)
3. **Generate code** (Modern AI models + AI Dev tools)
4. **Run workshops** (refine with domain experts)
5. **Software Development Life cycle** (spec → code → deploy → feedback → repeat)

This approach works for healthcare. It works for financial data spaces. It works for any highly regulated domain.

We cannot outsource our health to a system designed to manage decline. Whether through better personal choices or better data infrastructure like EHDS planned, **we have to become the architects of our own vital longevity.**

---

## Call to Action

If you're building health data infrastructure, researching data sovereignty, or working in regulated data spaces:

1. **Fork the project**: [https://github.com/ma3u/MinimumViableDataspace/tree/health-demo](https://github.com/ma3u/MinimumViableDataspace/tree/health-demo)
2. **Read the implementation plan**: [https://github.com/ma3u/MinimumViableDataspace/blob/health-demo/docs/IMPLEMENTATION_PLAN.md](https://github.com/ma3u/MinimumViableDataspace/blob/health-demo/docs/IMPLEMENTATION_PLAN.md)
3. **Join the conversation**: Share your experiences with spec-driven development in healthcare
4. **Contribute**: Open issues, submit PRs, extend the examples

The future of healthcare is sovereign, interoperable, and patient-centric. Let's build it together.

---

**About the Author**

Matthias Buchhorn-Roth is a Managing Consultant at Sopra Steria specializing in sovereign cloud architecture, data spaces, and AI/ML infrastructure. His work focuses on building sovereign data platforms for highly regulated domains, with a particular focus on public sector and healthcare. He is passionate about longevity science, preventive medicine, and the intersection of technology and human health optimization.

Connect with me to discuss data sovereignty, health dataspaces, or longevity optimization strategies.