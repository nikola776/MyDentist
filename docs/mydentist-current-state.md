# mydentist — Current State

**The estate as client material describes it, consolidated and current as of 2 October 2026.**

| | |
|---|---|
| Purpose | One place for what we know about mydentist's systems, scale and in-flight change — the baseline our proposal is designed against |
| Scope | The whole estate as it bears on voice call handling and the knowledge assistant. Not a proposed design |
| Status | **Synthesis of client material. No system has been accessed and nothing here is validated against running systems.** |
| Sourcing | Every claim carries a tag. See §0 |
| Companion documents | `docs/mydentist-r4-current-state.md` — verbatim transcription of the Dec 2024 data-warehouse diagram, the source for §6 here. `discovery/Integrations/r4-integration-feasibility.md` — assesses our proposal against this baseline |

---

## 0. Sources

| Tag | Source | Date | Nature |
|---|---|---|---|
| `[BRIEF §n]` | `docs/client documentation/mydentist AI Delivery Partner Brief v1.2.docx`, section n | 2 Jul 2026 | **The RFP brief.** Client's own statement of estate, constraints and requirements |
| `[CAD:n]` | `docs/client documentation/Architecture_Design_CRM_HubSpot_and_MYD.md`, line n | DRAFT v0.1, decisions to 25 Jun 2026 | CRM Candidate Architecture Design. Conditionally TDA-approved `[CAD:1298]` |
| `[WPA §n]` | `docs/client documentation/WebPractice.Api-Usage-Guide.docx`, section n | Oct 2026 | Developer guide to the practice-data API |
| `[DW §n]` | `docs/mydentist-r4-current-state.md`, section n | source diagram v1.0, Dec 2024 | Our transcription of the on-prem data-warehouse architecture |
| `[D-POC]` `[D-ONPREM]` `[D-CDC]` `[D-MI]` | The four client diagrams in `docs/client documentation/` | — | Reporting and migration diagrams |
| `[OURS]` | **No external source.** Our inference or observation | — | Unverified |
| `[ABSENCE]` | Something not present across the material | — | Only as strong as our reading |

**Where sources disagree, both figures are given.** The brief and the CAD were written three months apart by different functions, and the data-warehouse transcription is eighteen months older than either.

**One source our own proposal cites is not in this repository.** `docs/Architecture.md` cites a *"Fabric Brief §6"* at `[ARCH:105]` and `[ARCH:243]` for the claim that key R4 tables lack primary keys. That document is not among the client material we hold `[ABSENCE]`, and the claim is load-bearing — see `discovery/Integrations/r4-integration-feasibility.md`.

---

## 1. The organisation, and why this is happening now

| | |
|---|---|
| What it is | One of the largest dental care providers in the UK, NHS and private, national practice network plus a central support centre `[BRIEF §3]` |
| Practices | **Around 530** `[BRIEF §9]`; `[D-POC]` states "500+ practice estate". The practice-ID space runs 0001–0999 and is sparse `[DW §6]` |
| Customers | **4.1 million**, targeted to 6.4 million over three years `[BRIEF §3]`. The CRM business case says "approximately 4m active customers" `[CAD:66-68]` |
| Internal users | Around 10,800 across the estate `[BRIEF §4]` `[BRIEF Appendix B]` |
| Three-year targets | Grow customers 4.1m → 6.4m; expand by ~130 practices; **double EBITDA** `[BRIEF §3]` |
| Retention target | 73.7% → 77% active patient retention over three years `[CAD:66-68]` |
| Conversion today | Enquiry→PMS conversion **7.4% new / 21.9% existing** `[CAD:66-68]`. High-value treatment conversion **0.8%**, target 1.6% `[BRIEF §4]` |
| Programmes | Practice 2.0 and Support Centre 2.0; agentic call handling is a named priority in both `[BRIEF §3]` |

**The stated reason for urgency** `[BRIEF §3]`: frontline processes cannot scale with the additional workload, and the company wants to solve it "with technology first, rather than default to a centralised offshore call centre."

**AI is already in the estate.** Anthropic's Claude is rolled out to knowledge workers and to HR, employee relations, Finance, Legal, IT, Property and Facilities, Marketing and Lead Generation `[BRIEF §3]`. Strict generative-AI guardrails already exist in production — the public review-response guardrails cap length, ban emotive and American phrasing, forbid clinical explanation or admission of liability, and route safeguarding, harm, discrimination, legal action and media to a human `[BRIEF §12]`.

---

## 2. The call problem

| Measure | Figure | Source |
|---|---|---|
| Calls into practices per year | **~7 million** | `[BRIEF §4]` |
| Answered | ~4 million | `[BRIEF §4]` |
| Missed in working hours | ~2 million | `[BRIEF §4]` |
| Out of hours, no capability at all | ~1 million | `[BRIEF §4]` |
| **Total missed** | **~3 million** | `[BRIEF §4]` |
| Typical support-centre call | ~7 minutes | `[BRIEF §4]` |

**Visibility is poor.** Limited call analytics and limited call recording, so there is poor visibility of why patients call and where they are lost `[BRIEF §4]`. Getting data out of Redbox for analysis "is difficult today" `[BRIEF §9]`.

**There is an overflow route** from practices to a patient support desk. It is "not a full call centre, and it does not close the gap" `[BRIEF §4]`.

**The prize is stated concretely** `[BRIEF §4]`: lifting high-value treatment conversion from 0.8% to 1.6% — around 5,600 more implants, aligners and whitening cases a year, and roughly 80,000 additional treatments.

Why patients call is catalogued in `[BRIEF Appendix A]` across five groups: access and existing-patient enquiries, new enquiries, advice or guidance, scenario-specific (merges, relocations, closures, campaigns), and feedback and non-patient (complaints, police, media, subject access requests, NHS 111, CQC, GDC).

---

## 3. Patient management systems

**Three PMSs, not one.** This matters for any design that assumes "the patient is in R4."

| PMS | Where | Hosting | Notes |
|---|---|---|---|
| **R4** (Carestream) | ~98% of practices `[BRIEF Appendix C]`; general dentistry `[CAD:80]` | **On-premise, one instance per practice** `[CAD:86]` `[DW §1]` | Legacy, "known stability issues and limited extensibility", "a barrier to digital workflows and omni-channel today" `[BRIEF §10]` |
| **Orthobridge** | Orthodontic practices `[CAD:90]` | Cloud `[BRIEF Appendix C]` | Data is in Fabric and reported on, but **not de-duplicated in CDP** `[CAD:94]` |
| **Dentally** (Henry Schein) | Isolated instances, residential/care-home settings `[CAD:98]` | Cloud `[BRIEF Appendix C]` | Not marketed to; deliberately excluded from CRM Phase 1 `[CAD:98]`. May be reviewed if acquisitions bring in general-dentistry practices on Dentally `[CAD:100]` |

### R4 specifics

- **Two databases per practice**, `R4_Main` and `R4_Reporting`, on individual on-prem practice servers `[DW §1]` `[DW §3.2]`
- **Client-server application**: client on in-practice PCs using "a mixture of VB6 and .NET components"; server is SQL Server on Windows Server in the practice `[CAD:1231]`
- **Owned and developed by Carestream**, a US dentistry supply company "not just a software company" `[CAD:84]`
- **The exec decided in 2025 to keep R4** rather than move PMS — acknowledged as creating IT challenges, but a PMS migration "wasn't expected to pay back within the 5 year plan" `[CAD:88]`
- **No single customer view, even within R4.** Data sits in a SQL Server instance per practice, so a patient who moves practice **must** get a new record. Patients also acquire duplicate records *within* a practice — including because they "booked online via PatientComms but did not type every field exactly the same [as] their existing record (e.g: used abbreviated first name or changed mobile number)" `[CAD:235]`
- **No availability table.** R4 stores appointments; availability is derived `[ARCH:133]` `[OURS]` — no client document states this, and it is our proposal's reading

### R4 integration posture

- **No confirmed first-class REST API for real-time write access** `[BRIEF §10]`
- Historically integrated "through local database access or third party middleware, for example MyCare Adaptor (Dataphiles)" `[BRIEF §10]`
- **Carestream has launched Sensei Cloud**, "but the back end still relies on local database-level writes, which may not reliably support real-time reads during a live call. Sensei is also unproven in the UK and EU market" `[BRIEF §10]`
- A **first-party API into R4 is being built as CRM Phase 3** `[BRIEF §10]` `[CAD:815]`
- **A read/write path exists today:** PatientComms "has access to read and write R4 data through the MyCare adaptor" `[CAD:114]`
- Carestream is "sensitive about extraction frequency" `[ARCH:185]`, and R4 performance under programmatic access is a live client concern — the chosen Phase 3 route was picked partly because Dataphiles' connectivity "doesn't cause R4 performance problems" `[CAD:1253]`

---

## 4. Patient communications and booking — Dataphiles

**Dataphiles** is a small UK company, **50% owned by Carestream** `[CAD:112]`, supplying two products:

**PatientComms (V3)** `[CAD:110-118]`
- Reads and writes R4 data through the **MyCare adaptor** `[CAD:114]`
- Sends appointment reminders and recall prompts by SMS and email `[CAD:114]`
- **Takes online bookings** from customers on a `patientcomms.co.uk` URL; the booking "is then sent on to R4, **within a maximum of 15 minutes**" `[CAD:116]`
- **Central Booking** gives colleagues the same capability through a different UI on the same platform `[CAD:116]`
- Used for R4 practices only — not Orthobridge or Dentally `[CAD:118]`
- Also handles payment `[CAD:260 diagram]` and FFT, dental history, events and medical referrals via V2 `[CAD:260 diagram]`

**LMT (V2)** `[CAD:120-124]`
- Dataphiles-built, mydentist-specific lead management tool, distinct from PatientComms itself
- **Manages almost all leads today.** Website enquiries create leads here; leads are worked in the LMT UI
- Hosted in a **mydentist-dedicated Azure subscription** that mydentist has access to `[CAD:124]`
- **Not being replaced** — "it is not in scope for HubSpot to replace all Leads management for the time being" `[CAD:122]`
- Reachable through a mydentist-owned API: `POST https://apinew.mydentist.co.uk/SitefinityForms.Api/v1/sitefinity/webforms` `[CAD:848]`, hosted in IoMart `[CAD:850]`, which "sorts out some of the data mappings, looks up postcode where necessary and emails the practice that there is a new lead in LMT" `[CAD:885]`

**The 15-minute figure deserves attention** `[OURS]`: it means R4 is authoritative but can be stale by up to a quarter of an hour with respect to bookings already confirmed to a patient online. Note that `[DW §3.3]` independently gives practice→subscriber *replication* as 15 minutes — a different direction and mechanism with the same number, which may be coincidence or may be a conflation upstream of us.

---

## 5. CRM — HubSpot, live now

**HubSpot Phase 1 goes live October 2026** `[BRIEF §3]` `[BRIEF Appendix C]` — i.e. **this month**. Partner selection for the AI workstreams is "aligned to HubSpot phase one, from October 2026" `[BRIEF §17]`.

Selected via RFP, with **Huble** as system integrator `[CAD:76]`. Hosted in **AWS Germany** `[CAD:1125]` — within the brief's UK/EEA residency requirement `[BRIEF §12]` `[OURS]`.

### Phasing `[CAD:152-171]`

| Phase | Contents |
|---|---|
| **1** | Marketing via HubSpot (replacing dotDigital); Leads Management replacing Salesforce; AI chatbot on website for teeth straightening and whitening |
| **2** | Website event capture; treatment enquiries into HubSpot; HubSpot website personalisation; **LMT 2-way integration** |
| **3** | **HubSpot→R4 integration**; HubSpot→Orthobridge; pilot and roll out to TCO practices |

The CAD covers Phase 1 only and must return to TDA for Phases 2 and 3 `[CAD:171]`. **No date is given anywhere for Phase 3** `[ABSENCE]`.

### Out of CRM scope — and relevant to us `[CAD:175-179]`

- A patient portal and a patient app, with customer-facing auth — "a future aspiration"
- Replacing LMT
- Patient record matching into a single customer view — "to be delivered by data team, not CRM project, but is a key dependency"
- **"Voice AI for incoming calls. Although HubSpot has some capability in this area we are looking at this capability as part of another project."** That other project is ours `[OURS]`

### The duplicate-email constraint — a hard platform limit

**HubSpot uses contact email address as the primary key for Contacts, and this is not changeable** `[CAD:941]`. It natively merges all records sharing an email address `[CAD:1049]`. mydentist has many such cases `[CAD:1045-1049]`: couples sharing an address, children recorded against a parent's email, and care homes holding contact details on residents' behalf.

**Critically:** "This is true even if we attempt to use the CDP Master ID as a de-dupe key. **It doesn't stop the default behaviour**" `[CAD:1049]`.

The Phase 1 workaround `[CAD:951]` `[CAD:1057-1059]`:
- CDP classifies each duplicate-email case (household, child, care home) and passes the classification to HubSpot as custom properties via Boomi
- **The email address is suppressed for all, or all-but-one, of the records** so HubSpot never sees a duplicate
- Forms write to a **holding object** rather than using native Contact-based forms, so Contacts are not automatically overwritten

Accepted for Phase 1 because outbound contact is marketing only `[CAD:1063]`, but the CAD states it "*must* be addressed differently as we move more processes to HubSpot" and will be "a significant hindrance" for service messaging `[CAD:1063]`.

**This is contested internally.** At TDA on 16 Jun 2026 the data team "is not comfortable with the current solution proposal for duplicate emails from Huble and wants to push back", and the Clinical Systems Architect asked whether it invalidates the solution as a whole `[CAD:1297]`.

### Marketing consent `[CAD:988-1039]`

HubSpot becomes **master for marketing consent**, seeded by an initial CSV load built from historic sources (PatientComms, LMT, Spitfire opt-ins; dotDigital and Spitfire opt-outs) rolled into `CRM_vw_Fact_Consent` and resolved by CDP mappings, latest timestamp winning `[CAD:992-1015]`.

Thereafter: any enquiry or consultation booking is treated as a **soft opt-in**, acknowledged by an email carrying a link to a HubSpot-hosted Preference Centre `[CAD:1021-1031]`. Enquiries never opt a customer *out*; only the preference centre can `[CAD:1035]`. A business process for in-practice or Patient Services opt-out requests is **not yet defined** `[CAD:1037]`.

### The AI chatbot precedent `[CAD:915-933]`

Phase 1 includes a HubSpot-hosted chatbot, **teeth straightening only**, configured entirely within HubSpot. The constraints are explicit and are a precedent for any AI we add `[OURS]`:

> "The Chatbot is strictly limited in what it knows and what it is allowed to talk about by design… It will not have access to ANY customer or patient data (for Phase 1 at least and changing that will be a significant change that requires new approvals…). It will also be forbidden from giving medical advice or discussing any other treatments or NHS availability." `[CAD:931]`

Every data source is to be individually documented, and it is subject to strict suitability testing under a named reviewer `[CAD:927-931]`.

---

## 6. Data platform

### Current reporting chain `[DW §3]`

```
R4 practice estate (530 practices, R4_Main + R4_Reporting, on-prem)
        │  SQL Server transactional replication (Log Reader / Distribution Agents)
        ▼
BI-DISTSVR01  (distributor)
        │  every 15 minutes
        ▼
MYD-DW1 : Site0001 … Site0999  (one database per practice)
        │  clean, standardise, consolidate
        ▼
MYD-DW1 : DW
        │  IDH-SITEREPL process — 10+ hours per build
        ▼
IDH-SITEREPL : EDW  (modelling and transformation)
        │
        ▼
SSRS · Power BI · CSV/Excel extracts · SFTP feeds · internal and external APIs · legacy and ad-hoc
```

- A full DW→EDW build takes **10+ hours**, and some downstream dependencies are "not fully documented" `[DW §1]` `[DW §4]`
- 530 publishers through a **single distributor to a single subscriber**, with no HA/DR shown `[DW §6]`
- **End-to-end freshness is next-day:** R4 data "is currently not available until around **mid-day the following day** to the data it covers" `[CAD:617]`, which the CRM design treats as a fixed constraint for Phase 1 while expecting improvement later

### Target — Microsoft Fabric

The warehouse is **migrating to Microsoft Fabric** `[BRIEF §9]`, and Fabric will replace the on-prem warehouse over time `[CAD:217-241]`. The in-flight migration platform states read-only principles: *"Read-only to source databases via CDC"* and *"No business rows are changed"* `[D-CDC]`.

The CRM design's view of the chain `[CAD:617-689]`: EDW stored procedures detect per-practice deltas → Fabric Lakehouse including **CDP** → notebooks merge source deltas with CDP data to key against **CDP master IDs rather than R4 IDs** → daily export tables flagged CREATE / UPDATE / DELETE → Boomi reads them over JDBC with a managed identity → Azure SQL as store-and-forward → HubSpot APIs at 100 records per request, retried on exponential backoff for 429 and 5xx `[CAD:619-625]`.

Eighteen source tables map to HubSpot objects `[CAD:629-667]`, including `Dim_Patient`→Contact, `Fact_Enquiry`→Lead, `Fact_Treatment_Courses`→Opportunity, `Fact_Appointment`→Appointment, `Dim_Practice`→Company.

A **reverse path** exists: new HubSpot leads POST into APIM→Boomi→a Fabric import table, merged into CDP by notebook `[CAD:807-842]`.

---

## 7. Identity — the CDP

**"We have developed a system Customer Data Platform (CDP) which master[s] the unique customer identifier"** `[BRIEF §10]`.

- CDP lives **inside the Fabric subscription** `[CAD:741-772 diagram]` and holds the record-matching tables that resolve fragmented patient records to one master customer ID `[CAD:362]`
- It is what lets HubSpot "receive a unified view of customer, not fragmented" `[CAD:364-365]`
- CDP mints a new master customer identifier for genuinely new customers, and links later R4 records to the same identifier when it determines they are the same person `[CAD:815]`
- **A synchronous lookup API is being built for Phase 1** `[CAD:737-772]`: HubSpot → Cloudflare/WAF → APIM → Boomi → stored procedure over JDBC, matching submitted contact details against CDP and returning the CDP master ID
- On no match, the proc **allocates and writes a new CDP master ID** to a temporary table before returning it. Because this is race-sensitive, the proc takes a lock; contended calls are returned a code telling Boomi to **retry on exponential back-off** `[CAD:772]`

**Three limits on CDP, all material** `[OURS]`:
1. **Orthobridge data is not de-duplicated in CDP** `[CAD:94]`, so orthodontic patients cannot be resolved through it
2. The CDP merge from the import table runs **periodically via notebooks** `[CAD:815]`, so it is not necessarily current for a very recently created record
3. CDP's view of a person is entangled with marketing-suppression logic for shared email addresses (§5), because the same platform carries the household/child/care-home classification `[CAD:1057-1059]`

**Identity matching is a stated dependency, not a solved problem:** the brief says "Identity resolution for registration deduplication needs a defined approach, for example matching on NHS number, or date of birth plus name plus phone" `[BRIEF §10]`, and the CAD lists single-customer-view matching as out of CRM scope but "a key dependency" `[CAD:178]`.

**The human benchmark exists and is documented.** The Patient Services process "shows the exact steps a human agent follows in R4 for searching patients, **three-form identity checks**, booking and amending appointments, changing details, and taking card-not-present payments through a secure service. Any automation must match this control level or improve on it" `[BRIEF §10]`.

---

## 8. Website and practice master data

**Website** `[CAD:102-108]` `[CAD:1190-1227]`
- `mydentist.co.uk` is built on **Sitefinity CMS**, hosted by Sitefinity as PaaS; form-submission processing is hosted in the **IoMart** datacentre
- Fronted by **Cloudflare WAF**
- Hands off to: PatientComms for online booking into R4 practices, Orthobridge for ortho booking, **LMT for enquiries**, Calendly for teeth straightening/whitening consultations, and Boomi→Workday for prospects
- Finds nearest practices by calling the **Practice Directory API, hosted in IoMart** `[CAD:108]`
- Not changing for the CRM project `[CAD:1192]`

**Practice Directory** — the master data source, and a known weak point:

> "Practice Directory is the primary source: addresses, opening hours, treatment types, clinicians. **Built for low-volume website updates. No event architecture, no caching. Needs enhancing for real-time agent queries.**" `[BRIEF §9]`

The brief adds that the agent "will need practice directory data (operational data store) embedded and refreshed", with SSO, RBAC, and NFRs for refresh frequency and resilience `[BRIEF §9]`.

**`WebPractice.Api` appears to be this API** `[OURS]` — a JSON REST API of **24 endpoints across 7 groups**, authenticated by an `APIKey` header on every request `[WPA §1-2]`. It exposes practice search by postcode/coordinates with radius and `distanceInMiles` `[WPA §4]`, practice detail, opening hours, treatments, people by role type, testimonials, active campaigns, custom and dental attributes, legal entities and socials `[WPA §4]`. Paging is `page`/`pageSize`, default 1/50, inside a `_MetaData` + `records` envelope `[WPA §3]`.

Caveats the guide itself records `[WPA §4]`: the swagger has no endpoint summaries, several endpoints are untyped in swagger, `deepSearchMode`'s enum values are unnamed, and the `returnedPractices` parameter format needs confirming. Case studies carry `consentForTeethPhoto` / `consentForFacePhoto` / `consentForTestimonial` flags that must be checked before publication `[WPA §6]`.

**One trap recorded in the CAD** `[CAD:774-805]`: the CRM programme **deliberately did not reuse the existing postcode→practice lookup**, because it misses a check against a table of practices due to close whose leads must be redirected elsewhere, and a Practice Directory check for whether a treatment is actually offered at that practice. A **new orchestrating endpoint** was created alongside the existing check `[CAD:776]`, built into the on-prem stack because the functionality is Practice Directory related; a separate project will relocate Practice Directory to the cloud **in 2027** `[CAD:805]`.

---

## 9. Telephony

| Component | Role | Source |
|---|---|---|
| **Maintel** | Telephony platform | `[BRIEF §9]` `[BRIEF Appendix C]` |
| **MiCollab** | Outbound dialling | `[BRIEF §9]` |
| **Ignite** | Inbound | `[BRIEF §9]` |
| **Redbox** | Call recording — "getting data out of Redbox for analysis is difficult today" | `[BRIEF §9]` |
| **CCM** | Reporting, support centre | `[BRIEF §9]` |

**Practice telephony is explicitly "tbc"** `[BRIEF §9]`. The brief notes discussions have just started with the telco support provider and details will follow. What is known operationally: in the PoC "the PBX diverts to a unique Hello Patient number per practice when a call goes unanswered after about five rings, or out of hours" `[BRIEF §8.1]`.

The CAD describes the support-centre side from the CRM angle `[CAD:138-148]`: Lead Gen and other teams use **Mitel** platforms labelled MiCollab and Ignite; **not integrated with Salesforce** — a colleague copies the number from Salesforce and pastes it into MiCollab, adding a leading zero because Salesforce renders `+44 7…` which MiCollab rejects. Ignite shows presence and routes inbound to the longest-idle available agent, with stats and recordings for team leaders.

**An overlapping integration decision is in flight** `[CAD:190]`: Phase 1 uses HubSpot Calling for outbound and existing Mitel for inbound, transitioning to Mitel integrated with HubSpot shortly after Phase 1 via native connectors plus professional services. Mitel–HubSpot integration has been demonstrated. Telephony for the rest of the support centre (Patient Services, Facilities, IT helpdesk) stays on Mitel regardless `[CAD:146]`.

*Maintel is a UK Mitel partner, which reconciles the two namings* `[OURS]` — but no client document states that relationship, and practice-level telephony remains unconfirmed `[ABSENCE]`.

---

## 10. Integration layer

**"We have our own integration layer which uses APIM and Boomi MyCare Adaptor (R4 to data platform)"** `[BRIEF §9]`, with the instruction: **"Reuse existing integration assets where you can, rather than build new."**

Restated in the constraints section: "We already run a proprietary connector, MyCare Adaptor, from R4 to our data platform, and Azure API Management as a gateway. Tell us whether these help, or whether you need more direct access." `[BRIEF §10]`

**Note the direction.** The brief describes mydentist's own use of MyCare as **R4 → data platform**, i.e. extraction `[BRIEF §9]` `[BRIEF §10]`. The read/write capability is described in Dataphiles' use of it for PatientComms `[CAD:114]`. Whether mydentist can invoke the write direction is not stated by either source `[ABSENCE]` `[OURS]`.

### The mandated pattern `[CAD:1127-1188]`

```
User devices / external callers
        │
   Internet → Cloudflare (and WAF)
        │
┌── (my)dentist tenant ─────────────────────────────────────┐
│  Integrations Subscription                                │
│  ┌── Integrations VNET ────────────────────────────────┐  │
│  │  Edge Subnet (NSG)        : APIM                    │  │
│  │  Compute Subnet (NSG)     : Boomi, Function Apps    │  │
│  │  Connectivity Subnet(NSG) : Private Endpoints       │  │
│  └─────────────────────────────────────────────────────┘  │
│  ┌── Egress VNET ──────────────────────────────────────┐  │
│  │  Egress Subnet (NSG)      : Azure Firewall (NAT)    │  │
│  └─────────────────────────────────────────────────────┘  │
│  KeyVault · Redis · Azure SQL                             │
│  ── APIM passes through to APIs in other subscriptions    │
└───────────────────────────────────────────────────────────┘
        │
  Azure Firewall → external services · on-prem / IoMart services
```

- Governed by a published **Integration standard** `[CAD:1125]`
- **Prod is a completely separate subscription** from test `[CAD:1121]`
- APIM inbound uses **TLS 1.3** `[CAD:961]`
- Secrets split by direction: Azure Key Vault for mydentist→HubSpot, **AWS Secrets Manager** for HubSpot→mydentist `[CAD:965-968]`
- Two named standards govern compliance — *Authentication Methods for Technical Service Connectivity* and *Connected Systems Standard (API Gateway & Integration)* — both self-assessed **tbc** in the CAD `[CAD:1286-1289]`

---

## 11. Knowledge estate and enterprise IT

| Domain | Systems | Source |
|---|---|---|
| Knowledge | Microsoft 365 OneDrive; **Wisdom** SharePoint intranet; **ManageEngine** (SQL Server) extracted into Dataverse | `[BRIEF §9]` `[BRIEF §7.1]` |
| Identity | **Entra ID**. Preference stated for **Entra Agent IDs**. No customer identity — "We do not yet have customer identity via Entra External ID" | `[BRIEF §9]` `[BRIEF §12]` |
| Controls | Entra ID, Microsoft Purview, Microsoft Sentinel, **Zscaler**, **Cloudflare** | `[BRIEF §12]` |
| Agent runtime (WS2 draft) | Microsoft Copilot Studio, curated Azure AI Search index, Doc Intelligence + GPT-4o vision ingestion, MCP retrieval server | `[BRIEF §7.2]` |
| ITSM | ManageEngine | `[BRIEF Appendix C]` |

**Entra→SaaS federation is already practised:** all colleague access to production HubSpot is federated SSO over **SAML 2.0** to Entra ID, authorised by AD group membership (RBAC), with **shared logins prohibited** `[CAD:970-978]`.

**Two PoC findings shaped the WS2 design** `[BRIEF §8]` `[BRIEF §7.2]`: connecting the whole SharePoint tenant overran context and produced irrelevant retrievals, and **about a third of knowledge articles hide key procedural steps inside screenshots** that retrieval cannot read.

---

## 12. Current proofs of concept

**Voice — Hello Patient** `[BRIEF §8]` `[BRIEF §8.1]`
- US voice AI vendor, running in **AWS**, **10 practices**, out-of-hours first then information-only during hours
- Calls arrive over a **SIP trunk**; a **unique number per practice** identifies the practice; PBX diverts after ~5 rings or out of hours
- Agent always identifies itself as AI using an agreed preamble
- **No diary write.** Appointment requests are handled by texting or WhatsApping a booking link
- Knowledge is a small approved base loaded once — practice and basic dentistry information only
- Transfers back to the practice where possible; **emergencies signposted to 111 or A&E**; complex needs captured for human call-back
- Has been through the client's technical design authority

**Deliberately excluded from the PoC** `[BRIEF §8.2]`: no HubSpot integration, no appointment booking by API, **no patient data uploaded to Hello Patient**. The brief states "these three gaps are exactly what production must close", and that Hello Patient "is not a done deal".

**Knowledge — Microsoft Copilot Studio** `[BRIEF §8]`, with the two findings above.

---

## 13. Non-functional benchmarks the client states

From the drafted knowledge-assistant design; the brief says voice may need different targets and asks us to propose and flag differences `[BRIEF §13]`.

| Requirement | Benchmark | Note |
|---|---|---|
| Availability | **99.5% monthly** | "We are testing whether 99.9% is justified given cost and upstream/downstream dependencies i.e. R4" |
| Q&A latency | p95 **under 4 s** | "Voice turn latency will need its own target" |
| Retrieval latency | p95 **under 800 ms** | Knowledge retrieval calls |
| Recovery time (runtime) | **5 minutes** | Automatic failover for the user-facing path |
| Recovery point | index 24 h; content store 15 min | Nightly index resync |
| Grounding quality | **under 0.1% uncited claims** | "Every answer cited or the agent declines" |
| Master data refresh | To be defined | "Practice Directory needs near real-time query support" |

**The CRM programme states different figures for itself** `[CAD:204-215]`: 99.9% availability (capped by HubSpot's own SLA — 43 min/month), RTO and RPO both **< 1 hour**, with store-and-forward in Boomi "wherever possible… to minimise data loss when the system is down". Browser support is Edge v148+ on Windows 11 and Safari on iOS for colleagues; a wider matrix for customers.

---

## 14. Governance, data protection and clinical safety

**Stated requirements** `[BRIEF §12]`:
- Patient data minimisation — "the agent working with the least data it needs"
- Consent and lawful processing for recording and transcription by default, with clear patient messaging
- SSO and RBAC for practice directory and knowledge; **domain agents keep data segregated**
- **Identity propagation via Entra Agent IDs preferred**; access follows the user's own identity, not a shared service account
- Clinical governance: clinical safety, **no diagnosis or treatment advice**, defined escalation for high-risk contacts
- **Data residency: patient and clinical data processed and stored in the UK or EEA.** The current voice PoC vendor runs in US AWS and has offered UK hosting in London
- Vendor assurance: **DTAC, DCB0129 and/or ISO 27001 and 9001**, SRTP and TLS in transit, encryption at rest, per-customer segregation. "We do not operate outside the UK"
- Prompt-injection defences and human review for high-risk cases

**CRM-side security posture** `[CAD:957-984]`: HubSpot uses TLS 1.2/1.3 and AES-256 at rest with an extra AES-256 layer under customer-specific keys for PII; Azure SQL uses TDE; Fabric relies on ADLSv2 encryption on write.

**A DPIA is already in progress** under a named owner `[CAD:1109-1113]` — it is an existing workstream to align with, not one to start `[OURS]`. Non-production environments will hold anonymised data `[CAD:1107]`.

---

## 15. What is changing, and when

| Change | Timing | Source |
|---|---|---|
| **HubSpot Phase 1 live** | **October 2026 — now** | `[BRIEF §3]` `[BRIEF Appendix C]` |
| Salesforce retired | Phase 1 | `[CAD:134-136]` `[CAD:364-365]` |
| dotDigital retired | Phase 1 | `[CAD:364-365]` |
| AI delivery partner selected | From October 2026, aligned to HubSpot Phase 1 | `[BRIEF §17]` |
| Mitel↔HubSpot telephony integration | "Shortly after Phase 1" | `[CAD:190]` |
| HubSpot Phase 2 (LMT 2-way, web events) | Undated | `[CAD:158-163]` |
| **R4 first-party API (Phase 3)** | **Undated** | `[BRIEF §10]` `[CAD:815]` `[ABSENCE]` |
| Practice Directory relocated to cloud | 2027, separate project | `[CAD:805]` |
| Warehouse → Fabric migration | In flight, EDW replaced "over time" | `[BRIEF §9]` `[CAD:231]` |
| Estate growth | ~130 practices over three years | `[BRIEF §3]` |

**The Phase 3 decision, logged and dated** `[CAD:1245-1257]`: four options were considered for getting R4 interactions into HubSpot — Carestream Partner/Sensei API; Dataphiles MyCare adaptor; Data Warehouse via Fabric; or a hybrid of Carestream API with Dataphiles handling the R4 connection. **Option 3 chosen for now, moving to option 4 in Phase 3**, decided 25 Jun 2026 by Michelle Howchin with the Carestream and Dataphiles senior teams.

---

## 16. Observations

Our reading, not client statements. `[OURS]`

1. **The estate has no single operational view of a patient, by construction.** Per-practice R4 instances with no cross-practice linkage `[CAD:235]`, three different PMSs `[BRIEF §9]`, and a CDP that resolves identity only in the analytics plane and only for some sources `[CAD:94]`. Any design that needs "the patient" as a single live entity has to build or borrow that resolution.

2. **The only proven programmatic write into R4 belongs to a third party and is asynchronous.** Dataphiles via MyCare, up to 15 minutes `[CAD:114]` `[CAD:116]`. mydentist's own use of MyCare is extraction `[BRIEF §9]`.

3. **Two timelines govern what is possible.** HubSpot Phase 1 is live now; the R4 write API is Phase 3 and undated. Anything requiring an R4 write has to either reuse an existing path or wait for a date nobody has published.

4. **Practice master data is a stated weak point and a dependency for every call.** Low-volume design, no caching, no events, on-prem, with a cloud migration in 2027 `[BRIEF §9]` `[CAD:805]`.

5. **The duplicate-email problem is unresolved and contested.** It is the one part of the CRM design the data team pushed back on at TDA `[CAD:1297]`, and it constrains anything that writes contact-keyed records to HubSpot `[CAD:1049]`.

6. **There is an existing precedent for tightly-scoped AI in production**, with a documented data-source inventory, a named safety reviewer, and an explicit rule that widening data access requires fresh approval `[CAD:915-933]`. That is the bar a voice agent will be held to.

7. **The client has asked for reuse, not greenfield** `[BRIEF §9]`. APIM, Boomi, MyCare, Cloudflare, Entra, Purview, Sentinel and the published integration standard all already exist, and the CRM programme is actively building a synchronous CDP lookup API `[CAD:737-772]` and a postcode→practice orchestration `[CAD:776]` that overlap what a voice agent needs.

8. **Replication load is already concentrated.** 530 publishers through one distributor to one subscriber with no HA/DR shown `[DW §6]`, on top of a system Carestream is sensitive about being read frequently `[ARCH:185]`.

---

## 17. Open questions

Carried where the material does not answer them. `[OURS]`

**R4 and the write path** — held in full in `discovery/Integrations/r4-integration-feasibility.md`.

**Identity**
- Can the CDP lookup API `[CAD:737-772]` be called in a *verify-only* mode that does **not** mint a new master ID on no-match?
- What is its latency, and what happens to a live call when the stored procedure's lock forces an exponential back-off `[CAD:772]`?
- How are Orthobridge patients identified, given they are absent from CDP de-duplication `[CAD:94]`?
- How does the household/child/care-home email classification `[CAD:1057]` interact with "exactly one confident match"?

**Practice data**
- Is `WebPractice.Api` the Practice Directory API, and is it the same surface the CAD's new orchestrating endpoint fronts `[CAD:776]`?
- What are its current throughput, latency and availability, given it was "built for low-volume website updates" `[BRIEF §9]`?
- Which endpoint should a voice agent use to resolve a caller to a practice, so that the closing-practice redirect and treatment-offered checks are honoured `[CAD:776]`?

**Telephony**
- What is the practice-level platform, given `[BRIEF §9]` marks it tbc?
- How does a voice agent's transfer and screen-pop coexist with the Mitel↔HubSpot integration due shortly after Phase 1 `[CAD:190]`?
- Can Redbox recordings and Maintel CDRs be extracted daily, given the stated difficulty `[BRIEF §9]`?

**Governance**
- What is the scope of the in-flight DPIA `[CAD:1109]`, and does it extend to voice?
- Does the consent flow `[CAD:1021-1031]` treat a voice-captured enquiry as a soft opt-in, and who sends the acknowledgement?
- What is the undefined business process for opt-out requests taken in practice or by Patient Services `[CAD:1037]`?

**Data**
- Which R4 databases are replicated, and how do they map to `Site####` `[DW §7]`?
- What runs the DW consolidation and the IDH-SITEREPL process `[DW §7]`?
- Is there an inventory of the undocumented SFTP, API and legacy consumers `[DW §7]`?
