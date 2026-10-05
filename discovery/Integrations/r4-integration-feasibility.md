# R4 Integration Feasibility, and our proposal tested against it

**Two questions. Can a voice agent's call result in a write to R4 — and does the architecture we proposed through the RFP survive contact with what the client's own documents say?**

| | |
|---|---|
| Subject | `docs/Architecture.md` — **our proposal**, submitted in response to the AI Delivery Partner Brief |
| Question 1 | Can a call handled by a voice AI vendor result in a write to R4? |
| Question 2 | Where does the client material confirm, contradict, or expose a gap in what we proposed? |
| Finding | **A read/write interface to R4 exists and is in production.** The proposal's principles are directly responsive to the client's own; **nine elements need amendment, two are contradicted, and six scope gaps are open.** §3, §4 |
| Status | Desk analysis. **No system has been accessed. No write has been attempted. No client conversation has taken place.** |
| Sourcing | Every substantive claim carries a tag. See §1. Untagged prose is connective tissue, not assertion |
| Baseline | `docs/mydentist-current-state.md` — the estate this proposal is designed against |

---

## 1. Sources, and how to read the tags

| Tag | Source | Nature |
|---|---|---|
| `[ARCH:n]` | `docs/Architecture.md`, line n | **Our proposal.** The subject under test, not evidence |
| `[BRIEF §n]` | `docs/client documentation/mydentist AI Delivery Partner Brief v1.2.docx`, §n | **The RFP brief**, 2 Jul 2026. The client's own statement of estate, constraints and requirements |
| `[CAD:n]` | `docs/client documentation/Architecture_Design_CRM_HubSpot_and_MYD.md`, line n | CRM Candidate Architecture Design, DRAFT v0.1 |
| `[WPA §n]` | `docs/client documentation/WebPractice.Api-Usage-Guide.docx`, §n | Practice-data API developer guide, Oct 2026 |
| `[AC:n]` | `docs/additional_context.md`, line n | Agreed discovery scope for the four weeks |
| `[CS §n]` | `docs/mydentist-r4-current-state.md`, §n | Our transcription of the Dec 2024 data-warehouse diagram |
| `[D-POC]` `[D-ONPREM]` `[D-CDC]` `[D-MI]` | The four client diagrams | Reporting and migration diagrams |
| `[OURS]` | **No external source.** Our analysis or judgment | Unverified |
| `[ABSENCE]` | Something not present across the material | Only as strong as our reading |

**Four cautions.**

**`[ARCH]` is the thing being assessed.** It is our own document and never corroborates itself. In places it is commentary on our own solution diagram, which is why several `[ARCH]` citations are quoted diagram labels rather than client statements.

**One source `[ARCH]` relies on is not in this repository.** `[ARCH:105]` and `[ARCH:243]` cite a *"Fabric Brief §6"* for the claim that key R4 tables lack primary keys. We do not hold that document `[ABSENCE]`. The claim is load-bearing twice over — it is reason 2 of 3 for running identity off the CDP rather than R4 `[ARCH:105]`, and the basis for assuming R4 offers no idempotency `[ARCH:243]`. **It needs either the source produced or the claim re-evidenced.** `[OURS]`

**`[CAD]` is a conditionally-approved draft.** DRAFT v0.1, TDA-reviewed 16 Jun 2026 with caveats that must return to TDA `[CAD:1298]`, latest logged decision 25 Jun 2026, and TODOs awaiting inputs due *w/c 8 June 2026* `[CAD:434]`. Roughly three months stale with overdue dependencies. It carries two internal contradictions bearing on this question — §5.4.

**`[BRIEF]` is the authoritative statement of what we are being judged on.** Integration credibility carries the single heaviest evaluation weight at **25%**, with governance and security at 20% `[BRIEF §16]`, and the brief asks for "your honest read on it, not reassurance" `[BRIEF §10]`.

Verbatim quotes are in **Appendix A** with locations, so every paraphrase can be checked.

---

## 2. Where the proposal is answering the brief directly

Before the problems: **all six of the client's stated architectural principles `[BRIEF §11]` have a corresponding mechanism in the proposal.** This is the part that should not be re-litigated.

| `[BRIEF §11]` principle | Proposal mechanism |
|---|---|
| "The LLM never calls write APIs directly" | Model has no credentials, no network path to any system of record, and no ability to write `[ARCH:10]`; nothing in either agent toolkit writes `[ARCH:46]` |
| "A deterministic layer, not an LLM, validates every action against live system state and business rules before any write commits" | Deterministic Validation service — business rules plus confirm-time re-read `[ARCH:165-175]` |
| "Separation of concerns: the agent reasons and extracts, the orchestrator executes and protects system-of-record integrity" | The three-plane split `[ARCH:2-8]` |
| "One idempotency key per call session on every write" | Idempotency root minted before the agent speaks, derived per action `[ARCH:251-259]` |
| "A full audit trail: transcript, action, validation outcome and result held as one linked, immutable record" | Immutable audit trail on one `call_session_id` `[ARCH:193-207]` |
| "Scoped write credentials for the agent, narrower than staff access" | Entra service and agent identities with scoped write credentials `[ARCH:§9 table]` |

**Further corroborations, where the brief or CAD independently supports a design choice:**

| Proposal element | Client evidence |
|---|---|
| Three-form identity check `[ARCH:100]` | The documented Patient Services process "shows the exact steps a human agent follows in R4 for… **three-form identity checks**… Any automation must match this control level or improve on it" `[BRIEF §10]` |
| CDP, not R4, as identity arbiter `[ARCH:102-105]` | "We have developed a system Customer Data Platform (CDP) which master[s] the unique customer identifier" `[BRIEF §10]`; and a synchronous CDP lookup API is already being built `[CAD:737-772]` |
| Per-practice DDI establishes practice identity `[ARCH:22]` | "the PBX diverts to a unique Hello Patient number per practice… The unique number identifies the practice" `[BRIEF §8.1]` |
| PBX divert after ~5 rings or out of hours `[ARCH:20]` | "when a call goes unanswered after about five rings, or out of hours" `[BRIEF §8.1]` |
| Emergency escalation `[ARCH:§8.1 Tier 3]` | PoC already signposts emergencies to 111 or A&E `[BRIEF §8.1]` |
| Availability never derived from replication `[ARCH:148-150]` | 15-minute subscriber lag `[CS §3.3]`; full chain not current until "mid-day the following day" `[CAD:617]` |
| Patients are unauthenticated, so fixed index scope `[ARCH:§6.3]` | "We do not yet have customer identity via Entra External ID" `[BRIEF §12]`; patient portal and customer auth are out of CRM scope `[CAD:175]` |
| APIM as the gateway `[ARCH:548]` | "We already run… Azure API Management as a gateway" `[BRIEF §10]`; APIM is the mandated edge in the integration standard `[CAD:1127-1188]` |
| One MCP retrieval boundary, reused `[ARCH:§6.1]` | The client's own drafted design already specifies "An MCP retrieval server fronts the index, so future agents reuse the same integration rather than rebuilding it" `[BRIEF §7.2]` |
| OCR + vision dual-read behind a trust gate `[ARCH:§7.2]` | "roughly a third of articles hold key steps trapped inside images that retrieval cannot read" `[BRIEF §7.2]` — the client identified this problem first |
| Reuse over greenfield `[ARCH:394]` | "Reuse existing integration assets where you can, rather than build new" `[BRIEF §9]` |

**On the knowledge runtime, we deliberately diverge and the brief invites it.** The client's draft uses Microsoft Copilot Studio `[BRIEF §7.2]`; we propose Azure AI Foundry Agent Service for code-first prompt and eval version control `[ARCH:§7.1]`. The brief explicitly asks: "do you align with our Copilot Studio and MCP design, or challenge it?" `[BRIEF §15]` and says it "welcome[s] feedback and/or reasons to challenge it" `[BRIEF §7.2]`. The divergence is a required answer, not a mismatch. `[OURS]`

---

## 3. The write path

**A read/write interface to R4 exists and is in production use.** `[CAD:114]`

| Statement | Source |
|---|---|
| PatientComms "has access to **read and write R4 data** through the MyCare adaptor" | `[CAD:114]` — Appendix A.1 |
| Online bookings taken on a `patientcomms.co.uk` URL are "sent on to R4, **within a maximum of 15 minutes**", with the same capability for colleagues via Central Booking | `[CAD:116]` — Appendix A.2 |
| In CRM Phase 3, "HubSpot will be able to **create appointments itself in R4** via our Integrations into the MyCare layer" | `[CAD:815]` — Appendix A.3 |
| "We already run a proprietary connector, **MyCare Adaptor**, from R4 to our data platform, and Azure API Management as a gateway" | `[BRIEF §10]` — Appendix A.4 |
| R4 has been "integrated through local database access or third party middleware, for example MyCare Adaptor (Dataphiles)" | `[BRIEF §10]` |

**So `[ARCH:389]`'s position — MyCare as the expected pilot path, "already in the estate, already licensed" — is correct and sourced.** `[BRIEF §9]` and `[BRIEF §10]` both state the connector is already running in the estate. That part of the proposal needs no defence.

**But the direction matters, and this is the finding.** `[OURS]`

- The brief describes **mydentist's own** use of MyCare as **"R4 to our data platform"** `[BRIEF §9]` `[BRIEF §10]` — extraction.
- The **read/write** capability is described in **Dataphiles'** use of it for PatientComms `[CAD:114]`.
- Whether mydentist can invoke the write direction is stated by neither source `[ABSENCE]`.
- And mydentist has no integration to it: they "do not have the timescales to develop and deploy new APIs to connect HubSpot to… Dataphiles' MyCare Adaptor" `[CAD:1253]`.

**The question is therefore access, terms, timing and latency — not existence** `[OURS]`:

1. **Access is commercial.** MyCare is Dataphiles' `[CAD:112]`, a company **50% owned by Carestream** `[CAD:112]`. Carestream appears to have ruled out direct use of the Dataphiles adaptor on strategy and contractual grounds `[CAD:1253]` — though which option that refers to is ambiguous, §5.4b.
2. **Timing is the dominant risk.** A first-party R4 API is **CRM Phase 3** `[BRIEF §10]` `[CAD:815]`, behind Phases 1 and 2 `[CAD:152-171]`, and **no date for Phase 3 appears in any source** `[ABSENCE]`.
3. **Real-time confirmation is unreachable on the known path.** The only visible production write commits within a maximum of 15 minutes `[CAD:116]`. The client reaches the same conclusion independently: Sensei's "back end still relies on local database-level writes, which may not reliably support real-time reads during a live call" `[BRIEF §10]`.
4. **The same latency opens a gap the proposal does not model** — §6.

**The client's own framing matches ours.** `[BRIEF §10]` states there is "no confirmed first-class REST API for real-time write access", asks us to "confirm the actual write mechanism available", and says plainly: "This determines whether real-time slot confirmation and write-back during a live call is feasible, or whether R4 writes must be asynchronous with a confirmation follow-up."

---

## 4. The proposal, audited

### 4.1 Nine elements needing amendment

| # | Proposal | Evidence | Amendment |
|---|---|---|---|
| **A1** | `[ARCH:389]` MyCare "already in the estate, already licensed" — presented without qualification | In the estate for **extraction** `[BRIEF §9]`; read/write described only for **Dataphiles'** use `[CAD:114]`; mydentist has no integration to it `[CAD:1253]` | Keep the claim, add the direction. State that the write direction is third-party-operated and that our access to it is an open commercial question |
| **A2** | `[ARCH:571]` race R2 (AI vs Dataphiles online booking) mitigated by "confirm-time re-verification" | A Dataphiles booking reaches R4 in up to 15 minutes `[CAD:116]` | **The mitigation is insufficient.** See §6. Needs either a pending-booking read, an accepted-collision flow, or slot withholding |
| **A3** | `[ARCH:403]` Dataphiles receives "Online booking; **SMS/WhatsApp** confirmations" | PatientComms sends "comms out to patients via **SMS / email**" `[CAD:114]`. WhatsApp appears in the estate as a Hello Patient PoC behaviour `[BRIEF §8.1]` and as a new **HubSpot** channel `[BRIEF §3]` — not as a Dataphiles capability `[ABSENCE]` | Change to SMS/email for Dataphiles; attribute WhatsApp to HubSpot, or drop it |
| **A4** | `[ARCH:548]` "Azure APIM (existing gateway) — **the only door**; HMAC + timestamp + **IP allowlist**" | **Cloudflare and a WAF sit in front of APIM** in the mandated pattern `[CAD:1127-1188]`, and Cloudflare is a listed existing control `[BRIEF §12]` | APIM is the only *application* door, not the network edge. The IP allowlist must be Cloudflare egress, and HMAC must survive the proxy. State both |
| **A5** | `[ARCH:§5.4]` "MS Fabric — fed by extract only, **never in the live call path**" | **The CDP sits inside the Fabric subscription** `[CAD:741-772]`, and `[ARCH:§2.3]` puts CDP in the identity path — which runs on every transactional call | **Internal inconsistency in our own document.** Distinguish the CDP synchronous lookup surface (in the call path) from the lakehouse analytics surface (never in it) |
| **A6** | `[ARCH:391]` Carestream toolkit / Sensei as "vendor-sanctioned fallback" | The client's own assessment: Sensei's "back end still relies on local database-level writes, which may not reliably support real-time reads during a live call. Sensei is also **unproven in the UK and EU market**" `[BRIEF §10]` | Downgrade from fallback to last resort, and cite the client's reservation rather than presenting it neutrally |
| **A7** | `[ARCH:20]` asserts the **Maintel PBX** diverts practice calls | Maintel/MiCollab/Ignite/Redbox/CCM are named **for the Support Centre**; **"Practices tbc"** `[BRIEF §9]`. The CAD describes Mitel only in the Support Centre `[CAD:138-148]` | Mark practice telephony as unconfirmed. The divert behaviour `[BRIEF §8.1]` is evidenced; the platform at practice level is not |
| **A8** | No availability target stated in `[ARCH]` | Client benchmark is **99.5% monthly**, "testing whether 99.9% is justified given cost and upstream/downstream dependencies i.e. R4" `[BRIEF §13]`; the CRM programme separately claims 99.9% with RTO/RPO < 1 hr `[CAD:204-215]` | State a position, and distinguish our layer's availability from R4's. The brief asks us to "propose what you can commit to, and flag where you would differ" `[BRIEF §13]` |
| **A9** | Estate described as "500+ practices" `[CS §1]` `[D-POC]`, R4 implicitly universal | "**around 530**" practices `[BRIEF §9]`, R4 "about **98%** of practices" `[BRIEF Appendix C]`, with Orthobridge and Dentally for the rest `[BRIEF §9]` | Correct the figure and stop treating R4 as the whole estate — see gap G2 |

### 4.2 Two elements contradicted

**C1 — HubSpot cannot be relied on to deduplicate, even on our own key.**

`[ARCH:245]` states that HubSpot "genuinely provides useful primitives — custom properties, upsert on unique identifiers," and `[ARCH:247]` that "HubSpot's native capabilities reduce the *consequences* of a duplicate."

The CAD contradicts this for mydentist's instance. HubSpot uses contact email as the primary key and **this is not changeable** `[CAD:941]`; it merges all records sharing an email `[CAD:1049]`; and explicitly:

> "This is true even if we attempt to use the CDP Master ID as a de-dupe key. **It doesn't stop the default behaviour.**" `[CAD:1049]` — Appendix A.5

So in this estate HubSpot does not merely fail to prevent duplicates — **it actively merges distinct people** who share an email: couples, children on a parent's address, care-home residents `[CAD:1045]`. The Phase 1 workaround suppresses the email for all-but-one record and routes form submissions through a **holding object** instead of native Contact forms `[CAD:951]` `[CAD:1057-1059]`.

**Consequence for the proposal** `[OURS]`: `[ARCH:403]` sends call outcomes and callback tasks to HubSpot, and `[ARCH:§1.4]` pushes warm-transfer context there for screen-pop. Both are contact-keyed. Under the Phase 1 behaviour a call outcome could attach to the wrong household member. Our decision to build idempotency entirely in our own layer `[ARCH:241]` is **vindicated and the HubSpot leg is worse than we assumed** — but `[ARCH:245-247]` must be rewritten, and the write target needs to be the holding object or an explicitly non-Contact object.

**Note this is contested client-side**, not settled: the data team "is not comfortable with the current solution proposal for duplicate emails from Huble and wants to push back", and the Clinical Systems Architect asked whether it invalidates the solution as a whole `[CAD:1297]`.

**C2 — The CDP lookup API as designed creates identities; our identity check must not.**

`[ARCH:§2.3]` specifies fail-closed behaviour: no match → one retry, then treated as an enquiry, "**Never granted record access**"; ambiguous → transfer to a human.

The CDP API being built for Phase 1 behaves differently. If the stored procedure determines the contact details are a **new** customer, it allocates the next CDP master ID and **writes it to a temporary table** before returning it `[CAD:772]` — Appendix A.6. Because that is race-sensitive it takes a lock, and a contended call is returned a code telling Boomi to **retry on exponential back-off** `[CAD:772]`.

Two problems `[OURS]`:
- **Verification must not mint identities.** A failed voice identity check would create a CDP master ID for a caller we could not verify. We need a verify-only mode, or a different endpoint.
- **Exponential back-off is not viable in a live call.** `[ARCH:§2.1]` budgets under 500ms for pre-call personalisation and identity runs on every transactional call; the client's own retrieval benchmark is p95 under 800ms `[BRIEF §13]`. A lock-and-back-off pattern in the identity path is a latency risk that needs quantifying.

### 4.3 Six scope gaps

| # | Gap | Evidence | Why it matters |
|---|---|---|---|
| **G1** | **Consent and lawful basis are absent from the proposal** | `[BRIEF §12]` requires "Consent and lawful processing: recording and transcription by default, with a lawful basis and clear patient messaging". Separately, HubSpot becomes **master for marketing consent**, and an enquiry is treated as a **soft opt-in** triggering an acknowledgement email with a Preference Centre link `[CAD:1021-1031]` | A voice-captured enquiry is an expression of interest and lands inside that consent machinery. Nothing in `[ARCH]` addresses either recording consent or marketing consent. Governance is 20% of the evaluation `[BRIEF §16]` |
| **G2** | **Orthobridge and Dentally are out of the proposal entirely** | R4 is ~98% of practices `[BRIEF Appendix C]`; Orthobridge serves orthodontics and Dentally care homes `[BRIEF §9]`. **Orthobridge data is not de-duplicated in CDP** `[CAD:94]` | Orthodontic patients cannot be identity-resolved through the CDP path `[ARCH:104]`. Needs an explicit in-scope/out-of-scope statement rather than silence |
| **G3** | **No NFRs for the Practice Directory ODS** | `[ARCH:§9]` names "Practice Directory ODS — read cache feeding the Personalisation service" but sets no targets. The client asks for "NFRs covering refresh frequency and resilience" `[BRIEF §9]` and lists master data refresh as "To be defined with partner" `[BRIEF §13]` | The source is "built for low-volume website updates. No event architecture, no caching. **Needs enhancing for real-time agent queries**" `[BRIEF §9]`, and relocates to cloud in 2027 `[CAD:805]`. This feeds every call |
| **G4** | **Availability derivation omits two practice-level checks** | `[ARCH:133]` filters by clinician capability. The CRM programme added a check against a table of **practices due to close** whose leads redirect elsewhere, plus a Practice Directory check for **whether a treatment is offered at that practice** `[CAD:776]` | A voice agent offering a slot at a closing practice, or for a treatment not offered there, reproduces the exact defect the client just engineered around |
| **G5** | **Workstream 1b — support-centre voice — is not addressed** | `[BRIEF §5]` and `[BRIEF §6.2]` scope AI voice on internal helpdesks (IT, Patient Support, Training Academy, People, Procurement, H&S, Data Protection), measured on deflection then task automation | `[ARCH]` covers practice voice and WS2 knowledge. WS1b has no section. The brief asks for an architecture "for both workstreams" `[BRIEF §14]` |
| **G6** | **Vendor assurance criteria missing from the benchmark** | `[BRIEF §12]` wants DTAC, DCB0129 and/or ISO 27001 + 9001, SRTP and TLS in transit, encryption at rest, per-customer segregation, and **UK/EEA data residency** — noting the PoC vendor "runs in US AWS and has offered UK hosting in London" | `[ARCH:§6]`'s vendor capability table is functional only. Residency and certification are pass/fail gates and belong in the evaluation instrument `[AC:14-22]` |

---

## 5. The mechanisms

**The ladder is ours** `[ARCH:385-396]`, with positions stated against the evidence.

| | Mechanism | Writes? | Live read? | Position |
|---|---|---|---|---|
| **A** | **MyCare Adaptor** (Dataphiles) | **Yes** `[CAD:114]` | **Yes** `[CAD:114]` | In the estate `[BRIEF §9]`, in production `[CAD:116]`, named as the Phase 3 write path `[CAD:815]`. Owned by Dataphiles `[CAD:112]`; mydentist's own use is extraction `[BRIEF §9]`; no mydentist integration exists `[CAD:1253]` |
| **B** | **Native R4 API** (Carestream) | Intended | Unknown `[ABSENCE]` | "No confirmed first-class REST API for real-time write access" `[BRIEF §10]`. Being built as CRM Phase 3 `[BRIEF §10]` `[CAD:815]`; chosen option is a hybrid — Carestream delivers the API, Dataphiles the R4 connectivity `[CAD:1253]`. **Undated** `[ABSENCE]`. Contradicted by `[CAD:184]` — §5.4a |
| **C** | **Carestream Sensei Cloud / toolkit** | Doubtful | Doubtful | Client's own assessment: back end "still relies on local database-level writes, which may not reliably support real-time reads during a live call", and "unproven in the UK and EU market" `[BRIEF §10]`. Listed and not chosen in the CRM decision `[CAD:1251]` |
| **D** | **Direct database access** | — | — | Excluded by `[ARCH:392]` absent written Carestream support. The client records that R4 "has historically been integrated through local database access" `[BRIEF §10]`, so it is technically possible — but R4 performance under programmatic access is a live concern `[CAD:1253]` and the analytics platform holds a read-only posture `[D-CDC]`. **Keep excluded** `[OURS]` |

### 5.1 The Dataphiles path

`[CAD:116]` establishes that something derives availability and writes bookings into R4 in production, for customers and colleagues, without a receptionist — and `[CAD:114]` supplies the mechanism. This corroborates `[ARCH:403]`, which lists Dataphiles as receiving online bookings, and `[ARCH:571]`, which assumes it commits to the same diary.

**The first question for the spike** `[OURS]`: not whether Dataphiles can write to R4, but **what MyCare exposes, at what latency, and whether mydentist can invoke its write direction before Phase 3.** That is a commercial question for Carestream and Dataphiles, not a technical one for the data team — and `[CS §4]` records that nobody in the data-platform material owns R4 at all.

### 5.2 Mode and mechanism remain independent

`[ARCH:355-379]` makes confirmation mode a configuration choice over the same six steps: "Both modes run the same six steps" `[ARCH:361]`, and Mode A is Mode B with the confirmation sentence moved three steps later — "Same build either way" `[ARCH:379]`. **That judgment holds and is the proposal's most valuable hedge** `[OURS]`, because the evidence now points firmly at Mode B.

| Mode | Needs an R4 write? | Needs it fast? | Status |
|---|---|---|---|
| **A — real time** `[ARCH:357]` | Yes | **Yes** — in-call | **Unreachable on the known path.** 15-minute commit `[CAD:116]`; client's own doubt about real-time reads `[BRIEF §10]` |
| **B — deferred confirm** `[ARCH:358]` | Yes | No | **The operative default,** and already the estate's shape `[CAD:116]`. Confirmation via Dataphiles SMS/email is an existing capability `[CAD:114]` |
| **C — capture and hand off** `[ARCH:359]` | **No** | n/a | **Deliverable now,** with an existing API target — §5.3 |

The brief anticipates exactly this fork: "whether real-time slot confirmation and write-back during a live call is feasible, or whether R4 writes must be asynchronous with a confirmation follow-up" `[BRIEF §10]`.

### 5.3 Mode C has a concrete target

`[ARCH:359]` describes Mode C as a structured task handed to HubSpot. An existing production API accepts this shape of payload:

`POST https://apinew.mydentist.co.uk/SitefinityForms.Api/v1/sitefinity/webforms` `[CAD:848]`

mydentist-owned, hosted in IoMart `[CAD:850]`, and it "sorts out some of the data mappings, looks up postcode where necessary and emails the practice that there is a new lead in LMT" `[CAD:885]`. The CRM programme is wrapping it behind APIM and Boomi for HubSpot to call for the same purpose `[CAD:846]`, with API-key auth `[CAD:879]`.

**Caveats** `[OURS]`: it creates a *lead*, not an appointment — so it satisfies capture-and-handoff but none of W1–W3 (§7). Suitability for a voice-captured enquiry is unverified, and API-key auth `[CAD:879]` needs reconciling with our gateway posture `[ARCH:548]`. **And it is a lead path, which means it lands inside the consent machinery** `[CAD:1021-1031]` — see gap G1.

### 5.4 Two contradictions inside the CAD

Recorded, not resolved. Resolving them by inference is the error this analysis exists to avoid. `[OURS]`

**(a) The Partner API.** `[CAD:184]` — Appendix A.7 — states mydentist "will **not** be licensing Carestream's Partner API… due to prohibitive costs quoted and our lack of confidence in Carestream's ability to deliver in time." But the chosen Phase 3 option `[CAD:1251]` is "Use Carestream API but with Dataphiles adaptor handling connection to R4," decided 25 Jun 2026 `[CAD:1257]`. Most likely the decision supersedes a stale Phase-1 constraint `[OURS]` — but `[CAD:184]` sits in Assumptions and Constraints, where a reader takes it as current.

**(b) An option-numbering error that changes the history.** `[CAD:1253]` says: "although we initially preferred **option 3** due to lower quoted cost and greater confidence in **DP** to deliver… this option was ruled out by **CS** as it is against their strategy and the contractual agreements they have with DP." Option 3 is *Data Warehouse (via Fabric)* `[CAD:1251]` — which involves neither Dataphiles nor anything Carestream could veto. The sentence only coheres as **option 2**, *Dataphiles Adaptor (MyCare)*.

If that reading is right, the real history is that **mydentist wanted to use MyCare directly and Carestream blocked it** on strategy and contract `[OURS]`. That governs whether we can use MyCare for voice, which is why it is a question at §8 rather than an assumption here.

---

## 6. The fifteen-minute blind window

`[CAD:116]` states a Dataphiles online booking reaches R4 **within a maximum of 15 minutes**. Taken at face value, R4 is authoritative but can be stale by that much with respect to bookings already confirmed to a patient online. `[OURS]`

`[ARCH:571]` mitigates race R2 with confirm-time re-verification. **A re-read of R4 cannot see a booking that has not yet arrived in R4.** `[OURS]`

| Race | Proposal mitigation | Status |
|---|---|---|
| **R2** — AI vs Dataphiles online booking `[ARCH:571]` | Confirm-time re-verification | **Insufficient** if `[CAD:116]` means what it says — a window of up to 15 minutes in which the re-read returns a slot already taken |
| **R3** — AI vs receptionist in R4 `[ARCH:572]` | Same | **Unaffected.** A receptionist writes to R4 directly, so the re-read sees it |

`[ARCH:578]` states the honesty point that R2 and R3 cannot be solved by locking because those systems do not participate in our lock space, and that confirm-time verification is therefore the safety property. **For R3 that holds. For R2 it does not.** `[OURS]`

This also bears on `[ARCH:§4.3]`'s claim that the layering "is what lets Dataphiles and front-desk workflows stay unchanged on day one" — true for front-desk, not demonstrated for Dataphiles. `[OURS]`

Options, none evaluated `[OURS]`: read Dataphiles' pending-booking state alongside R4's; accept the window and handle collisions as an apology-and-rebook flow; or withhold from AI booking any slot recently offered through the online channel.

**Verify the premise first.** `[OURS]` The figure may be a customer-facing end-to-end SLA rather than a sync interval, in which case the window may be much smaller or absent. Note that `[CS §3.3]` gives practice→subscriber *replication* as 15 minutes — a different direction and mechanism with the same number. The brief asks the matching question directly: "Confirm how a voice booking stays consistent across Patient Comms, the R4 diary and HubSpot, without double-booking" `[BRIEF §10]`.

---

## 7. What "writing to R4" would mean

**The decomposition is ours** `[OURS]`, now mapped to the client's own priority order `[BRIEF §6.3]`.

| # | Operation | Client priority | Source | Difficulty `[OURS]` |
|---|---|---|---|---|
| **W1** | **Cancel** an appointment | **1st** `[BRIEF §6.3]` | Also named as an early quick win `[AC:101]`; distinct idempotency key `[ARCH:259]` | Lowest |
| **W2** | **Reschedule** | **2nd** `[BRIEF §6.3]` | `[AC:101]`; two writes under one root `[ARCH:287]` | Medium |
| **W3** | **Book** — including recalls and new patient enquiries | **3rd–4th** `[BRIEF §6.3]` | `[ARCH:124-160]`; client-sanctioned in principle for Phase 3 `[CAD:815]`, and done by Dataphiles today `[CAD:116]` | Highest |
| **W4** | **Update patient contact details** | Implied — "Running late, contact details, do-not-contact and preference changes" and "Change of information: address, surname, death of a patient" `[BRIEF Appendix A]` | Previously `[OURS]` only; **now evidenced as a real call reason** | Unassessed |
| **W5** | **Log the call outcome** | "Call data ingested into HubSpot for analysis" `[BRIEF §6.4]` | `[ARCH:403]` — HubSpot, not R4 | Not an R4 write, but see C1 |

**W4 is no longer our invention.** `[BRIEF Appendix A]` lists contact-detail and preference changes, and change of surname or address, among the reasons patients call. It should be scoped properly rather than carried as a prompt. Note `[CAD:235]` identifies contact-detail mismatches as a *cause* of duplicate R4 records, so writing them is not risk-free. `[OURS]`

**W1 remains the smallest action that would prove a write path end to end** `[OURS]`, and it is also the client's top priority — which makes cancellation-only a coherent pilot scope to propose. `[BRIEF §15]` already concedes phasing: "We are happy to phase which use cases are integrated with the AI voice call handling solution."

---

## 8. Open questions, mapped to the brief's own

`[BRIEF §15]` asks ten questions. Five are ours to answer here; this is where each stands.

| `[BRIEF §15]` question | Status |
|---|---|
| "How will you write to R4 during or after a live call: native API, database-level access, or a Carestream toolkit? What are the limits?" | **Answerable in outline.** MyCare exists and writes `[CAD:114]`; access, terms and timing are open — §3 |
| "Can R4 support real-time slot confirmation during a call? What is the fallback if it cannot?" | **Answerable: probably not, and the fallback is Mode B** `[ARCH:358]`, with Mode C `[ARCH:359]` beneath it — §5.2 |
| "How do you resolve identity and deduplicate registrations, and how does a pending or unverified patient or appointment flow through it?" | **Answerable, with two amendments** — the verify-only mode and the back-off latency, C2 |
| "Where does idempotency live across R4 and HubSpot, and what must be built in the orchestration layer?" | **Answerable: entirely in our layer** `[ARCH:241]`, and the HubSpot leg is worse than assumed — C1 |
| "How do you keep the LLM away from direct writes and prove it did not hallucinate an action?" | **Answerable as proposed** — `[ARCH:10]`, call grammar `[ARCH:§2.2]`, immutable audit on one correlation ID `[ARCH:193-207]` |

### Still to establish — access and timing
- **Can mydentist invoke MyCare's write direction for voice before Phase 3, and on what commercial terms?** `[CAD:114]` + `[BRIEF §9]` + `[CAD:1253]`
- **Did Carestream block direct use of the Dataphiles adaptor, and would they block it again?** §5.4b
- **What is the date for CRM Phase 3?** `[ABSENCE]`
- Is `[CAD:184]`'s "we will not be licensing Carestream's Partner API" superseded by the 25 Jun 2026 decision `[CAD:1251]`? §5.4a

### The write path
- What does MyCare expose — operations, payloads, auth — and does it cover W1–W4?
- Latency and failure rate of a single write. `[CAD:116]`'s 15 minutes is an end-to-end booking figure, not a write latency
- Is the write synchronous to the caller, or queued? Decides Mode A vs B `[ARCH:357-358]`
- Does any candidate expose idempotency or accept a client-supplied key? We assume not `[ARCH:239-247]` — and the brief asks us to confirm `[BRIEF §10]`
- **Can the "Fabric Brief §6" primary-key claim be sourced or re-evidenced?** `[ARCH:105]` `[ARCH:243]` — it underpins both the identity and idempotency decisions

### The live read and the blind window
- **Is `[CAD:116]`'s 15 minutes a sync interval or a customer-facing SLA?** Decides whether §6 is a real defect or a wording artefact
- Can Dataphiles' pending bookings be read before they land in R4?
- Is MyCare's read synchronous, and available to callers other than PatientComms? `[ABSENCE]`
- How is availability derived for online booking today — which tables, who owns the logic?
- What read load can a practice server tolerate during surgery hours? We would be the first continuous reader `[OURS]`; R4 performance is already a client concern `[CAD:1253]`

### Identity
- Can the CDP lookup API `[CAD:737-772]` run **verify-only**, without minting a master ID on no-match? C2
- What is its latency, and its behaviour under the stored procedure's lock and back-off `[CAD:772]`?
- How are Orthobridge patients identified, absent from CDP de-duplication `[CAD:94]`? G2
- How does the household/child/care-home email classification `[CAD:1057-1059]` interact with "exactly one confident match" `[ARCH:§2.3]`?

### Practice data
- Is `WebPractice.Api` `[WPA §1]` the Practice Directory API `[BRIEF §9]`, and is it what the CAD's new orchestrating endpoint fronts `[CAD:776]`?
- Which endpoint resolves a caller to a practice while honouring the closing-practice redirect and treatment-offered checks `[CAD:776]`? G4
- Current throughput, latency and availability, given it was "built for low-volume website updates" `[BRIEF §9]`? G3

### Governance and operations
- Who authorises the first programmatic write to a production practice? `[CS §4]` names no R4 owner
- What is the rollback story if a write goes wrong at a practice?
- Is there a non-production R4 practice instance to test against? `[ABSENCE]`
- Does the in-flight DPIA `[CAD:1109]` extend to voice? G1
- Is a voice-captured enquiry a soft opt-in, and who sends the acknowledgement `[CAD:1021-1031]`? G1

---

## 9. Risks

**Every likelihood and impact rating is our judgment.** `[OURS]` None derives from incident data, client statement or measurement. Ordinal opinions for discussion, to be challenged rather than inherited.

| # | Risk | Likelihood `[OURS]` | Impact `[OURS]` | Basis |
|---|---|---|---|---|
| **I1** | **The write path is not available within pilot timescales** | Medium–High | High | Phase 3 `[CAD:815]`, behind two phases `[CAD:152-171]`, undated `[ABSENCE]`. Mitigated by Mode C `[ARCH:359]` and adapter isolation `[ARCH:394]` |
| **I2** | **Carestream withholds or prices out programmatic access** | Medium–High | High | `[CAD:184]` cites prohibitive cost and lack of confidence in Carestream delivery; `[CAD:1253]` indicates Carestream ruled out the cheaper Dataphiles route on strategy and contract |
| **I3** | **A booking in flight is invisible to confirm-time re-read, so we double-book** | Medium — structural if `[CAD:116]` means what it says | High | §6. Defeats the R2 mitigation `[ARCH:571]`. **Verify the premise before redesigning** |
| **I4** | **HubSpot merges distinct patients sharing an email, corrupting call outcomes** | **High** — it is documented default behaviour | High | `[CAD:941]` `[CAD:1049]`. Not defeated by our own key. Contested internally `[CAD:1297]`. Affects `[ARCH:403]` and `[ARCH:§1.4]` — C1 |
| **I5** | **CDP lookup creates an identity for an unverified caller** | Medium | High | `[CAD:772]` mints and stores a master ID on no-match, against `[ARCH:§2.3]` fail-closed — C2 |
| **I6** | **Identity-path latency breaches a live-call budget** | Medium | Medium | Lock plus exponential back-off `[CAD:772]` against a p95 800ms retrieval benchmark `[BRIEF §13]` and a sub-500ms pre-call budget `[ARCH:§2.1]` |
| **I7** | MyCare's read is not synchronous, or not exposed to us | Medium | High | `[CAD:114]` states read and write but nothing about latency or third-party availability `[ABSENCE]`. Would remove the control `[ARCH:171]` that `[ARCH:578]` calls the safety property |
| **I8** | **Practice Directory cannot serve real-time agent queries** | Medium | Medium | Client's own words: "built for low-volume website updates. No event architecture, no caching" `[BRIEF §9]`; on-prem until a 2027 migration `[CAD:805]` — G3 |
| **I9** | Live reads impose untested load on practice servers | Medium | Medium | R4 performance under programmatic access is a live concern `[CAD:1253]`; ~530 on-prem servers `[BRIEF §9]`; one distributor, no HA/DR `[CS §6]` |
| **I10** | **The "Fabric Brief §6" primary-key claim cannot be sourced** | Medium | Medium | `[ABSENCE]` in this repository. Undermines the stated rationale for both the identity `[ARCH:105]` and idempotency `[ARCH:243]` decisions — the conclusions may still be right, but the evidence would need rebuilding |
| **I11** | Half-completed reschedule leaves a patient with no appointment | Low | High | `[ARCH:287]` already identifies this and assigns a compensating action |
| **I12** | Our integration layer diverges from the mandated standard | Medium | Medium | `[CAD:1127-1188]` documents the required pattern; `[CAD:1286-1289]` names two standards, both self-assessed **tbc**. Cheap now, expensive at review `[OURS]` |
| **I13** | No non-production R4 to test against | Medium | Medium | `[ABSENCE]` across all sources. CRM test-data provision covers HubSpot and Fabric only `[CAD:1107]` |
| **I14** | Vendor tool timeout shorter than R4 write latency | Low — Mode A already excluded | Low | Relevant only if a low-latency mechanism emerges |

---

## 10. What this means for the four weeks

`[AC:28-33]` asks the spike for three things — Appendix A.8.

| Asked for | Status |
|---|---|
| *"establish safe real-time or asynchronous write-back mechanisms"* `[AC:31]` | **Asynchronous: identified** `[CAD:114]` `[CAD:815]`. **Real-time: unavailable** on the known path `[CAD:116]` `[BRIEF §10]`. Access, terms and timing remain — §8 |
| *"analyze local vs. central database structures"* `[AC:32]` | **Answered:** local, per practice, ~530, R4 ~98%, no central operational instance `[BRIEF §9]` `[CAD:86]` `[CAD:235]` `[CS §1]` |
| *"map out operational fallback protocols"* `[AC:33]` | **Open.** Mode C `[ARCH:359]` has a real API target `[CAD:848]`; the operational protocol around it is undesigned, and the circuit-breaker behaviour `[ARCH:§2.6]` needs defining against real failure modes |

**Actions** `[OURS]`:

1. **Amend the proposal before the working session.** Nine items at §4.1, two at §4.2, six gaps at §4.3. None touches the three planes, the transaction layer, the lock or idempotency models, or the audit trail — the core survives. What changes is accuracy at the edges and scope at the boundaries.
2. **Reframe the R4 conversation around access, not existence.** Their own CAD answers existence `[CAD:114]`. Asking "can R4 be written to" now reads as not having read their material. Ask **what it takes for us to use MyCare, and when.**
3. **Take it to the named decision-makers.** `[CS §4]` records that nobody in the data-platform material owns R4. The CAD names who decides: **Michelle Howchin** with the Carestream and Dataphiles senior teams took the R4 integration decision `[CAD:1256]`, informing Pete Bailey, Simon Tucker and Neil Ritchie `[CAD:1255]` — and Neil Ritchie owns this brief `[BRIEF title page]`. Architecture side: **Haris Tanwir** (Integration Lead), **Adrian Wells** (Clinical Systems Architect), **Paddy Broderick** (Enterprise Architect), **Richard Wharram** (CAD owner) `[CAD:13]`.
4. **Verify the 15-minute premise early.** One question; it decides whether I3 is a defect needing redesign or a wording artefact.
5. **Produce or re-evidence the "Fabric Brief §6" claim** (I10) before it is relied on again in front of the client.
6. **Run the vendor benchmark in parallel** `[AC:14-22]`, adding the latency-tolerance test and the residency/certification gates from G6.
7. **Check our integration layer against the published standard** `[CAD:1127-1188]` `[CAD:1286-1289]` before blueprinting further (I12).
8. **Note the timing advantage.** HubSpot Phase 1 goes live **this month** `[BRIEF §3]`, partner selection is "aligned to HubSpot phase one, from October 2026" `[BRIEF §17]`, and the CRM programme is *right now* building a synchronous CDP lookup `[CAD:737-772]` and a postcode→practice orchestration `[CAD:776]` that overlap what a voice agent needs. Arriving with a design that reuses both is worth more than one that proposes parallel equivalents. `[OURS]`

---

## Appendix A — Verbatim quotes

Reproduced exactly, so every paraphrase above can be checked.

**A.1 — The write interface.** `[CAD:114]`, "Systems Landscape - PatientComms (V3)":

> It has access to read and write R4 data through the MyCare adaptor which it uses to send comms out to patients via SMS / email to remind them of appointments or to book a Recall.

**A.2 — The production write path and its latency.** `[CAD:116]`, same section:

> It also manages online bookings by customers and colleagues. Online bookings take the patient to a patientcomms.co.uk URL where the actual booking is taken and this is then sent on to R4, within a maximum of 15 minutes. Similar functionality is available to colleagues to book appointments for patients via the Central Booking tool, which is a different UI sat upon PatientComms.

**A.3 — Phase 3 intent.** `[CAD:815]`:

> N.B: This process will be tightened up in Phase 3 when HubSpot will be able to create appointments itself in R4 via our Integrations into the MyCare layer and using CDP data directly as part of an orchestration.

**A.4 — The client's own R4 integration position.** `[BRIEF §10]`:

> R4 is a legacy on-premise system. There is no confirmed first-class REST API for real-time write access. It has historically been integrated through local database access or third party middleware, for example MyCare Adaptor (Dataphiles). Note: we are trying to build out that first-party API into R4 as part of the CRM project (phase 3).

> We already run a proprietary connector, MyCare Adaptor, from R4 to our data platform, and Azure API Management as a gateway. Tell us whether these help, or whether you need more direct access.

> Carestream has launched an API layer, Sensei Cloud, but the back end still relies on local database-level writes, which may not reliably support real-time reads during a live call. Sensei is also unproven in the UK and EU market.

> You must confirm the actual write mechanism available: native API, ODBC or database-level access, or a Carestream-approved integration toolkit.

> This determines whether real-time slot confirmation and write-back during a live call is feasible, or whether R4 writes must be asynchronous with a confirmation follow-up.

**A.5 — HubSpot's merge behaviour.** `[CAD:1049]`:

> HubSpot natively merges all records supplied to it where the email address is the same. This would mean, for instance, that updates to parent and children data would overwrite each other leading to incorrect data being held in HubSpot and DPA breaches. This is true even if we attempt to use the CDP Master ID as a de-dupe key. It doesn't stop the default behaviour.

**A.6 — The CDP lookup's write-on-no-match.** `[CAD:772]`:

> If the Proc determines that the contact details are a new customer then it checks the existing CDP table and the temp table to determine what the next CDP Master ID is to allocate and stores it in the temp table before returning that ID back to the caller, HubSpot. Since this is sensitive to race conditions if two calls are made to the proc at the same time then locking will be implemented in the proc. If a call comes into the proc whilst the lock is in place then it will be returned with a code to tell Boomi that the proc could not be executed at this time and Boomi will retry on an exponential back-off.

**A.7 — The Partner API constraint.** `[CAD:184]`, "Assumptions and Constraints":

> We will not be licensing Carestream's Partner API to use to integrate with R4 in Phase 3 due to prohibitive costs quoted and our lack of confidence in Carestream's ability to deliver in time after issues with NHS Reform and Overjet integration.

**A.8 — Spike scope.** `[AC:28-33]`:

> The supplier performs a technical feasibility spike on {my}dentist's legacy R4 system to:
>   - establish safe real-time or asynchronous write-back mechanisms
>   - analyze local vs. central database structures
>   - map out operational fallback protocols

**A.9 — The client's architectural principles.** `[BRIEF §11]`:

> The LLM never calls write APIs directly.
> A deterministic layer, not an LLM, validates every action against live system state and business rules before any write commits.
> Separation of concerns: the agent reasons and extracts, the orchestrator executes and protects system-of-record integrity.
> One idempotency key per call session on every write.
> A full audit trail: transcript, action, validation outcome and result held as one linked, immutable record.
> Scoped write credentials for the agent, narrower than staff access.

**A.10 — Confirm-time re-read.** `[ARCH:171]` — **our document**:

> **Confirm-time re-read of live state.** Before committing, re-read R4 *live* — not the cache. Is that slot still free right now?

**A.11 — Availability must not come from replication.** `[ARCH:150]` — **our document**, quoting our own diagram:

> 15-min R4 replication = analytics, NEVER live availability.

**A.12 — The identity benchmark.** `[BRIEF §10]`:

> The Patient Services process is well documented. It shows the exact steps a human agent follows in R4 for searching patients, three-form identity checks, booking and amending appointments, changing details, and taking card-not-present payments through a secure service. Any automation must match this control level or improve on it.

**A.13 — Practice master data.** `[BRIEF §9]`:

> Practice Directory is the primary source: addresses, opening hours, treatment types, clinicians. Built for low-volume website updates. No event architecture, no caching. Needs enhancing for real-time agent queries.

---

## Appendix B — What this document does not rest on

- **No access to R4**, any practice server, MyCare, Dataphiles or Carestream documentation
- **No client conversation** on the write path has taken place
- **No measurement** of write latency, read latency, identity-lookup latency, or practice-server load. The 15-minute `[CAD:116]` and next-day `[CAD:617]` figures are the client's own, describe different flows, and neither is a write latency
- **No sight of MyCare's interface.** Existence and read/write capability are stated `[CAD:114]`; operations, payloads, auth, latency, and availability to callers other than PatientComms are not `[ABSENCE]`
- **No sight of the "Fabric Brief"** that `[ARCH:105]` and `[ARCH:243]` cite `[ABSENCE]` — see I10
- **No confirmation that `[CAD]` is current.** DRAFT v0.1, conditionally approved, inputs overdue since w/c 8 June 2026
- **No independent corroboration of `[CAD]`'s R4 claims.** It is one document, and the only one that describes the write interface
- **Four client reporting diagrams** `[D-POC]` `[D-ONPREM]` `[D-CDC]` `[D-MI]`, none scoped to transactional access. Their silence on R4 interfaces is *out of frame*, not evidence of absence — see `docs/mydentist-r4-current-state.md` §6
