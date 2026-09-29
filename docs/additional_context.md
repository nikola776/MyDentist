# Discovery Phase — Supplier Scope (4 Weeks)

In the 4-week Discovery Phase, the supplier will provide the following core
technical, architectural, and strategic services.

> Internal annotations (ownership / sequencing) are preserved verbatim from the
> original in the `NOTE:` lines below each item.


## 1. Voice AI Platform Evaluation & Benchmarking

NOTE: DS DEO, PROSLEDJUJEM STEFANU FRAMEWORK ZA EVALUACIJU

The supplier conducts an objective, evidence-based evaluation of 3 to 5 top
voice AI platforms (including ElevenLabs). This service includes live simulated
call testing with background noise and complex inputs (e.g., distinguishing
"19" vs. "90") to measure:

  - turn latency
  - voice realism
  - operational accuracy


## 2. Legacy System Integration Feasibility (R4 Spike)

NOTE: NAJBITNIJI DEO ZA NASTAVAK

The supplier performs a technical feasibility spike on {my}dentist's legacy R4
system to:

  - establish safe real-time or asynchronous write-back mechanisms
  - analyze local vs. central database structures
  - map out operational fallback protocols


## 3. Target Architecture Blueprinting

NOTE: NAKON STO DOBIJEMO PRISTUPE I ODRADIMO RESEARCH

They design a single, vendor-agnostic target architecture in which a
deterministic orchestration layer, accessed exclusively through the Client's
existing Azure API Management gateway, validates every transaction before it
reaches a system of record.

A shared MCP (Model Context Protocol) retrieval server with segregated,
identity-scoped indexes will serve both the voice agent and the knowledge
assistant. This ensures that:

  - transaction validation, retrieval and guardrails are built once and reused
    across both workstreams
  - the conversation runtime remains replaceable without redoing any
    integration


## 4. Knowledge Assistant & Data Ingestion Setup

NOTE: DS DEO

The supplier validates data sources (such as SharePoint Wisdom, ITSM
ManageEngine, and Teams) and implements an image/OCR trust gate to extract
operational steps trapped inside document screenshots.


## 5. Governance, Compliance & Clinical Safety Modeling

NOTE: NIJE BRIGA TRENUTNO

They map platform controls against:

  - strict UK/EEA data residency standards
  - DTAC
  - DCB0129 clinical safety
  - UK-GDPR Article 9

and define the scope for the Data Protection Impact Assessment (DPIA).


## 6. Telephony & Schema Standardisation

NOTE: NIJE BRIGA TRENUTNO

The supplier coordinates with existing telephony providers (Maintel/PBX) to
test codec compatibility and trunk capacity, and standardise OpenAPI tool
contracts and index schemas.


## 7. Commercial Modeling & Delivery Roadmap Optimization

NOTE: NA KRAJU FORMULISEMO

The supplier develops a 3-year Total Cost of Ownership (TCO) model and
evaluates unit economics at projected volumes, using Client-provided
operational inputs and assumptions required for the estimate, including:

  - average call duration
  - annual call volumes
  - expected call distribution
  - other relevant variables

Based on this analysis, the supplier identifies and sequences early quick-win
capabilities, such as cancellation and rescheduling, to support earlier value
realization, and defines an indicative pilot delivery plan.
