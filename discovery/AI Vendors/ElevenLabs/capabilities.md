# ElevenLabs — what it can and can't do

Desk research against the RFP requirement set (`../RFP_MoSCoW_Vendor_Assessment_v2_marked.xlsx`)
and our target architecture (`docs/Architecture.md`). **Checked against ElevenLabs' public docs,
API reference, changelog, Trust Centre, DPA, status page and G-Cloud listing on 2026-10-01.**
Nothing here is vendor-confirmed yet. See **Verification status** for which claims were checked
against primary sources, and the question list at the end for what only ElevenLabs can answer.

> **Naming.** The product is now **ElevenAgents** (formerly Conversational AI / Agents Platform).
> Docs moved to `elevenlabs.io/docs/eleven-agents/…`; old `agents-platform` links redirect.
>
> **Moving target.** Eleven **v4 and v4 Turbo shipped on 28 Sep 2026**, three days before this
> check. Pin model IDs for the benchmark and re-check anything model-dependent before a decision.

---

## Verification status

Desk research went through two passes. The first had four research agents read ElevenLabs'
public sources. The second re-checked the claims that drive gate failures or architecture
changes against the **raw text** of the primary sources on 2026-10-01: the docs' `.md` pages,
the pricing page, the G-Cloud listing, the DPA, the NHS DSPT register and the status page.

**Confirmed, word for word in the source:**
- **Signing.** Tool auth is OAuth2 client credentials, OAuth2 JWT, Basic, bearer or custom headers. HMAC appears only for post-call webhooks. Static egress IPs cover all outbound traffic.
- **Initiation webhook.** It uses header secrets and must return every custom dynamic variable. A failed or timed-out webhook "can prevent the conversation from starting"; no timeout is published.
- **Post-call webhooks.** Retries are off by default and only cover transcription webhooks. A webhook auto-disables after 10 consecutive failures if the last success was more than 7 days ago.
- **Residency.** It's an Enterprise feature with no UK region. EU-only processing needs Zero Retention Mode (ZRM) plus the API. Support and moderation staff may process data outside the region.
- **ZRM.** Enterprise-only. It stores no recordings or transcripts, so data arrives by webhook only. It turns off MCP and the HubSpot integration, can't be used for batch calls, and limits the LLMs to Gemini, Claude and ElevenLabs-hosted Qwen.
- **Transfers.** Whisper messages need native Twilio. Over SIP you get Conference or REFER; Blind transfer is Twilio-only. Custom headers travel only on REFER, plus the automatic `X-Conversation-ID` and `X-Caller-ID`. The UUI payload is 256 bytes, sent only to a SIP URI and dropped if too long.
- **SIP.** TLS 1.2 or higher, G.711 or G.722 audio, digest or IP-list auth, UDP experimental. `X-` headers arrive as `{{sip_*}}` variables.
- **Card data.** DTMF input is out-of-band only. In ElevenLabs' words, redaction "does not hide digits from the agent during the live call". Card-number redaction is post-call, for select Enterprise customers only, and "not 100%".
- **HubSpot.** The native integration only supports US-hosted HubSpot accounts.
- **Welsh.** Supported on v4, v4 Turbo, v3 and v3 Conversational, but not on Multilingual v2 or Flash v2.5. ElevenAgents can use any v3 Conversational language. Welsh speech recognition is in the "Good" band (10–20% word error rate).
- **Pricing.** Plan list prices, concurrency 4 to 40, $0.08 a minute and $0.16 burst all match the pricing page. Burst goes up to 3× or 300 calls, and burst calls are "deprioritized and may experience higher latency". Queued callers wait at most 1,800 seconds, and outbound calls aren't queued.
- **Model changes.** Retired LLMs move traffic to a replacement on a schedule (the documented example: warning at 30 days, 25% moved at 14, all at 7). The default fallback list "may be updated without notice".
- **Guardrails.** They're in alpha. The Manipulation guardrail always ends the conversation. Blocking mode adds 200–500ms.
- **Training on our data.** Enterprise data isn't used for training by default.
- **G-Cloud listing.** Agents SLA 99.5% (text-to-speech 99.9%) with 5% or 10% credits. Accessibility standards "None or don't know". PCI DSS (Insight Assurance, 11 Sep 2025), ISO 27001, Cyber Essentials and Cyber Essentials Plus. No phone support; the Customer Success package costs £2,500 a month.
- **DSPT.** Eleven Labs Ltd 2025-26 (v8): "Standards exceeded", 23 Sep 2025.
- **DPA.** Dated 8 Apr 2026, with the UK Addendum. Sensitive data is listed as "N/A". §13.1.2 and §13.1.3 allow support and moderation access from outside the residency region. Sub-processor changes get 30 days' notice.
- **Status page.** The 31 Jul SIP outage and the September Agents and EU-residency incidents are all there.

**Corrected after the check** (already reflected below):
- Tools and the knowledge base *are* versioned with the agent. Only privacy, call limits and auth are shared across versions.
- The 31 Jul SIP outage took ~18h in the US and ~12.5h in the EU, not 18h everywhere.
- "Recording covers the AI leg only" isn't in the docs, so I removed it.
- Codecs are now phrased as the docs phrase them, rather than as a list of what's excluded.

**Not checked against a primary source — treat as indicative:**
- **Trust Centre details.** The page is JavaScript-rendered, so these couldn't be read: PCI level and version, ISO 27017/27018/27701/42001, SOC 2, the 28 sub-processors and the LLM training wording.
- **G-Cloud pricing PDF figures:** the discounts, pilot packages and 60 included sessions.
- **Absence claims** (the docs don't mention it):
  - no speech-recognition confidence, no translation field (neither appears in the conversation API schema)
  - no noise suppression, no human QA scorecard, no BI connector
  - alerting API-only, RAG limits
- **Release dates** from the changelog: v4 on 28 Sep, keypad input in Aug 2026, simulate-conversation API removal on 31 Oct.
- **Latency figures** beyond the models page: v4 Turbo time to first speech, Scribe Realtime.

---

## The short version

**It fits the architecture well where it matters most.** ElevenAgents is built to be a
conversation plane that calls out to someone else's backend: a conversation-initiation webhook
before the first word, dynamic variables (SIP headers included), webhook tools with
per-tool timeouts and pre-tool speech, versioned agents with branches and traffic splits, and
signed post-call webhooks. Our "the model proposes, deterministic code disposes" design maps onto
it without fighting the platform.

**What it can't do, it mostly can't do *by design*** — no payments, no human queues, no business
hours, no callback object, no email. Those were always going to live in the PBX or our layer.

**The real problems are five, and three of them are commercial/contractual:**

1. **Residency.** No UK region. Processing stays in the EU only with **Enterprise + EU residency +
   Zero Retention Mode + API-only** — and Zero Retention Mode **disables MCP**, our only knowledge tool.
2. **SLA.** Published Agents SLA is **99.5%**, not the 99.9% the RFP requires. The 90-day status
   history shows seven Agents/telephony incidents, including a SIP outage on 31 Jul that took
   ~18h to fully restore in the US and ~12.5h in the EU, during which ElevenLabs' own alerting failed to fire.
3. **Payments.** No native card capture, no pause/resume of STT or recording, and DTMF digits reach
   the LLM live (`redact_input` only cleans the *stored* transcript). PAY-03 can only be met by
   handing the call to Securio before any card data is spoken or keyed — and transfers are one-way.
4. **Request signing.** ElevenLabs does **not HMAC-sign** tool calls, MCP calls or the initiation
   webhook. Part 10 of our architecture assumes it does.
5. **Welsh quality.** Supported, but only on v4 / v4 Turbo / v3 / v3 Conversational TTS (not Flash),
   and STT is rated 10–20% WER for Welsh against ≤5% for English. This is the Must most likely to
   be decided by the live test rather than the docs.

---

## Draft scores

Provisional 0–5 scores are in `RFP_MoSCoW_ElevenLabs_draft.xlsx` (this folder): a copy of the
marked RFP sheet with ElevenLabs in the Vendor A column, a basis note per row in column Q, and the
template's placeholder scores cleared. **Desk-based, not vendor-confirmed.** Two scoring rules:

- **Set-up assumed: Enterprise + EU residency + Zero Retention Mode**, the only configuration that
  can pass SEC-05. Rows that ZRM degrades (recording, QA, analytics) are scored with it on.
- **Vendor-only.** Rows that the PBX or our layer delivers are left blank rather than scored low,
  as are VegaIT "Out of scope" rows, Won'ts, and NHS-02, which needs a vendor statement. 68 of 85 rows are scored.

**Result: 837 / 1410 = 59.4%, Must gate FAIL** on nine rows. They fall into three groups:

| Group | Rows (score) | What closes it |
|---|---|---|
| **Contract** | SVC-01 SLA 99.5% (2), SVC-05 model-change notice (2) | Enterprise terms: 99.9% SLA with credits; contractual notice and freeze on model changes |
| **Closed by our layer, with ZRM** | TEL-08 recording (2), REC-02 translation (2), RPT-04 QA tooling (2), RPT-05 alerting (2), SAF-03 grounding (2) | Our audit store holds recordings and transcripts; post-call translation; QA and alerting on our observability stack; grounding through our retrieval service |
| **Hard** | PAY-03 card data (1), SEC-03 accessibility (1) | PAY-03: hand off to Securio before any card data, and accept a one-way transfer. SEC-03: vendor evidence, or we carry the accessibility case |

Most of the gate failures are real but closable. PAY-03 is the only one that constrains call
design, and SVC-01 is the only one that could stop the vendor outright if Enterprise terms don't move.

**Proposed additions to the VegaIT "Out of scope" marking**, using the sheet's own rule (ours to
build, so it can't separate vendors): TEL-02, TEL-03, TEL-07 (PBX); HND-06, INT-01, INT-05, OMN-02
(our layer); PAY-01 (telephony hand-off to Securio). PAY-01's current "Why" note ("PCI DSS
certification is held or it is not held") belongs to PAY-02. It looks like it slipped a row.

---

## What this changes in our architecture

Each item names the section of `docs/Architecture.md` it affects.

| # | Finding | Affects | Proposed change |
|---|---|---|---|
| 1 | **No HMAC on outbound requests.** Webhook tools support OAuth2 client credentials, OAuth2 JWT, Basic, bearer and custom headers. No request signing. The initiation webhook takes secret headers only. Post-call webhooks *are* HMAC-signed (`ElevenLabs-Signature: t=…,v0=…`). | Part 10 security spine; §2.1 | Replace HMAC on the bidirectional edges with **OAuth2 client credentials (Entra-issued) + APIM `validate-jwt`**, keep the IP allowlist (ElevenLabs publishes fixed egress IPs). Keep HMAC verification on post-call webhooks. |
| 2 | **EU processing requires ZRM, and ZRM disables MCP.** Confirmed on the data-residency and MCP pages. ZRM also disables stored transcripts/audio, the native HubSpot integration, the flag-for-review tool, batch calling and the Twilio SMS tool. | Part 6 retrieval plane; §1.3; SEC-05 | **Decision needed.** Either (a) ZRM on, and expose retrieval to voice as a **webhook tool** on the same retrieval service (MCP stays for WS2); or (b) ZRM off, keep MCP, and accept EU *storage* with possible out-of-region processing — which fails SEC-05 as written. (a) is the only option that passes the gate. |
| 3 | **Under ZRM the post-call webhook is the only copy of the call.** Transcription webhooks retry 5× (to 30 min) only if retries are switched on; **audio webhooks are never retried**; a webhook auto-disables after 10 consecutive failures. | §2.7 audit trail; TEL-08, REC-01 | The landing endpoint must be highly available and idempotent. Ask whether audio webhooks work under ZRM at all. |
| 4 | **Initiation webhook has no published timeout,** and a failure "can prevent the conversation from starting". Its response must include every custom dynamic variable the agent defines. | §2.1 personalisation service | Treat it as call-critical: keep the <500ms target and make it highly available; ask the vendor for a fallback (default variables) on timeout. |
| 5 | **Transfer claim is half right.** No whisper over SIP is correct. But SIP trunks support **Conference and REFER**; only Blind is Twilio-only. Conference carries no headers. REFER carries custom `X-` headers (no documented size limit) plus automatic `X-Conversation-ID` / `X-Caller-ID`. The **256-byte limit is the UUI payload**, sent only when REFER targets a SIP URI; oversized UUI is silently dropped. | §1.4 hand-off | Reword §1.4 (suggested text below). Screen-pop via HubSpot keyed on `X-Conversation-ID` stays the guaranteed channel. |
| 6 | **Codecs: the trunk must offer G.711 (PCMU/PCMA) or G.722,** or resample on our side. No other codec is listed, so assume no Opus or G.729. TLS 1.2+, SRTP Disabled/Allowed/Required, digest or IP-allowlist auth. Static SIP IPs (incl. an EU endpoint) are Enterprise-only. | §1.1 call arrival; discovery item 6 | Add codec check to the Maintel coordination list. |
| 7 | **No STT confidence reaches the LLM.** | §2.3 identity, tool contracts | Confirm-by-read-back for every identifier our tools consume (DOB, postcode, slot time). That is also the "19 vs 90" test. |
| 8 | **Retired models migrate automatically** (staged: warning ~30 days, 25% at 14, 100% at 7), and the default fallback-LLM chain "may be updated without notice". | §8 governance; SVC-05 | Pin model IDs, set our own fallback chain, test replacements on a branch. Get a notice period in the contract. |
| 9 | **Not everything is versioned.** Tool configuration and knowledge base *are* versioned with the agent, but privacy/retention, call limits and auth are shared across all versions. Whether editing a shared tool or KB document changes every version that references it is undocumented. | §8.1 change ladder | Keep privacy and call-limit changes under their own change control; confirm the shared-resource behaviour (question 20). |

**Suggested replacement for §1.4's "why via HubSpot" paragraph:**

> Over a SIP trunk ElevenLabs offers Conference transfer (no whisper, no headers) or SIP REFER
> (no whisper; custom `X-` headers with dynamic values, automatic `X-Conversation-ID` /
> `X-Caller-ID`, and a UUI payload of up to 256 bytes only when the target is a SIP URI).
> Whisper and post-dial digits need native Twilio. So the screen-pop is the guaranteed channel,
> and whatever Mitel does with REFER headers is a bonus to be proven in the telephony spike.

---

## Can do

- **Telephony:** inbound and outbound SIP over TLS/SRTP; SIP headers arrive as dynamic variables
  (`X-Practice-ID` → `{{sip_practice_id}}`); outbound and batch calling over the trunk; out-of-band
  DTMF input (since Aug 2026) and DTMF output; AI-capacity call queueing with hold audio.
- **Conversation:** native barge-in with a tone-aware turn model (`turn_v3`), turn eagerness,
  `spelling_patience` for spelled names and numbers, interruption-ignore terms; 72 agent languages
  incl. Welsh; per-language voice, model, first message and pronunciation dictionary; non-interruptible
  first message for the AI disclosure.
- **Orchestration hooks:** initiation webhook that can override prompt, first message, voice, language,
  ASR keywords, branch and environment; webhook tools with 5–300s timeouts, `pre_tool_speech`,
  execution mode, tool-call sounds and response filtering; MCP (SSE or streamable HTTP) outside ZRM.
- **Journeys:** visual workflows (subagent, tool, transfer, end nodes; LLM, expression and
  tool-result edges), structured procedures with verbatim "Say" steps, agent-to-agent transfer.
- **Change control:** immutable versions, branches, drafts, merge/rebase, percentage traffic splits,
  environment variables, agent tests runnable per branch.
- **Safety (alpha):** guardrails for focus, manipulation, content (incl. a medical/legal category)
  and custom rules.
- **Records & analytics:** transcripts, audio, summaries, up to 30 evaluation criteria and 25/40
  data-collection fields; dashboard with latency p50–p99, errors, evaluation results, per-node stats.
- **Assurance:** ISO 27001, PCI DSS (own environment), Cyber Essentials Plus, NHS DSPT 2025-26
  "Standards exceeded"; the Trust Centre also claims ISO 27017/27018/27701/42001 and SOC 2 Type II, DPA with UK Addendum, 28 sub-processors
  disclosed, G-Cloud 15 listing.

## Can't do (or not without us)

- **No UK region.** EU residency, ZRM, SSO/SCIM, audit logs, static SIP IPs and PII redaction are
  all Enterprise-only.
- **No payments.** No capture, no Securio integration, no STT/recording pause; transfers don't come back.
- **No human queueing, business hours, schedules, callbacks or email.** PBX and our layer.
- **No real-time sentiment** for routing — sentiment is post-call only.
- **No STT confidence**, no agent-level noise suppression setting.
- **No Welsh–English mixing within a sentence** (only Hindi has a code-mixing mode); Welsh not on Flash.
- **No stored English translation** of transcripts — only the dashboard viewer translates.
- **No "answer only from KB" or citation enforcement.** Grounding is prompt, guardrail and test discipline.
- **Manipulation guardrail ends the call** rather than handing to a human; ~500ms of a blocked
  streamed reply can still be heard.
- **No human QA scorecard or sampling workflow, no BI connector**, alerting is API-only and undocumented.
- **No consent capture or mid-call recording stop.** Recording is an on/off setting per agent.
- **Concurrency caps at 40 below Enterprise;** burst calls (3×, 2× price) are deprioritised.
- **No clinical safety case, DTAC, MHRA registration or published accessibility conformance.**
  The Use Policy forbids tailored health advice without professional review.
- **Voice clones can't be exported** at exit.

---

## Requirement by requirement

**Verdicts:** **Native** = works out of the box · **Config** = configuration, no code ·
**Partial** = notable gaps · **We build** = possible on ElevenLabs hooks, but the logic is ours ·
**PBX** = belongs to Mitel/Maintel · **Ent.** = Enterprise plan required · **Gap** = not supported ·
**Ask** = undocumented, needs vendor confirmation. *VegaIT* column repeats the marking from the RFP sheet.

### Telephony & call routing

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| TEL-01 | Must | | Config · Ask | Generic SIP trunk (TCP/TLS, G.711/G.722). Mitel isn't on ElevenLabs' compatibility list; interop is a live-test item. |
| TEL-02 | Must | | PBX | ElevenLabs answers what reaches it; ring-count, queue-time and out-of-hours diversion live in Mitel. Can be primary if DDIs point straight at the trunk. |
| TEL-03 | Must | | PBX | Queues only for AI capacity (hold audio, max 30 min, no position announcements). Human queues stay in Mitel; AI reaches them by REFER to a hunt group. |
| TEL-04 | Must | | Native | Outbound API over SIP, batch calling with scheduling. Batch capped at min(50% workspace, 70% agent) concurrency; not under ZRM; UK PECR is ours. |
| TEL-05 | Must | | Ent. | Self-serve caps at 40 concurrent (Business). Burst 3× at 2× price, "deprioritized… higher latency". Over-limit calls rejected unless queueing on. |
| TEL-06 | Must | | We build | Full API/CLI for agents, numbers, branches, env vars. No multi-site admin UI; per-practice config comes from our initiation webhook. One number → one agent. |
| TEL-07 | Must | | PBX · We build | No schedule object. Mitel diverts on schedule; per-practice hours logic sits in our initiation webhook (`system__time`). |
| TEL-08 | Must | Gate | Native · ZRM risk | `record_voice` + `retention_days` per agent; per-call audio API and `post_call_audio` webhook (MP3). Under ZRM, webhook is the only copy and is never retried. |
| TEL-09 | Must | | Native | DTMF input (Aug 2026): `#` terminator, 0.5–10s timeout, ≤50 digits, redaction. Out-of-band only; no IVR menu builder. |

### Conversation & voice experience

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| CNV-01 | Must | | Native · Ask | Inference figures: v4 Turbo ~100ms median / ~150ms first speech, Flash v2.5 ~75ms, Scribe v2 Realtime ~150ms. **No end-to-end figure published** — measure it. |
| CNV-02 | Should | | Partial | Tone adapts in expressive mode (v3 Conversational / v4 Turbo). Speed is static (0.7–1.2) and may not apply on v4. |
| CNV-03 | Must | | Config · risk | Welsh (`cy`) agent language. TTS on v4, v4 Turbo, v3, v3 Conversational — **not Flash v2.5 or Multilingual v2**. STT Welsh 10–20% WER. `language_detection` switches mid-call; no intra-sentence mixing. |
| CNV-04 | Could | | Config | 72 agent languages with per-language presets. |
| CNV-05 | Could | | Config | Voice per agent, per language or per call (override). |
| CNV-06 | Could | | Config | British, RP, Cockney, Geordie, Scouse, Yorkshire, Welsh, Scottish, Irish accent tags. No Brummie, Mancunian, West Country or Northern Irish tags. |
| CNV-07 | Could | | Config · We build | Initiation webhook can override voice/language from `caller_id`; the mapping is ours. Mid-call change via agent transfer or multi-voice. |
| CNV-08 | Must | Gate | Native | Fixed `first_message` + `disable_first_message_interruptions`. ElevenLabs' own terms require AI and recording disclosure. |
| CNV-09 | Must | | Native · caveat | Barge-in, `turn_v3`, eagerness, ignore terms, `spelling_patience`. **No agent-level noise suppression.** Live-test item. |
| CNV-10 | Must | | Config (prompt) | No STT confidence to the LLM. Re-prompt / read-back / hand-off is prompt and workflow design. |

### Caller identification & verification

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| IDV-01 | Must | Out of scope | — | Identity resolution is ours (CDP). |
| IDV-02 | Must | | Native | `caller_id` in the initiation webhook and `{{system__caller_id}}`. Withheld-number format undocumented. |
| IDV-03 | Must | Out of scope | — | Orchestration-layer logic. |
| IDV-04 | Must | Split | Config | Vendor half: LLM caller-type classification via prompt/workflow edges, captured as a data-collection field. |
| IDV-05 | Must | | Config · We build | Procedure "Ask" step, webhook tool to our API, data-collection field for the post-call payload. |
| IDV-06 | Must | Split | Config | Vendor half: conversational handling of third parties via workflow branches. Authority check ours. |
| IDV-07 | Should | | Config · We build | Expression edges on a `verification_level` returned by our tool; policy is ours. |

### Journey design & workflow orchestration

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| JRN-01 | Must | | Native | Visual workflow builder plus structured procedures. |
| JRN-02 | Must | | Native | Multiple workflows and agents; agent-to-agent transfer keeps the transcript. |
| JRN-03 | Should | | Config | Webhook tools, MCP (not under ZRM), dispatch-tool nodes. |
| JRN-04 | Must | | Config | LLM intent via triggers and edges; no confidence score. Routing testable with tool-call tests. |
| JRN-05 | Should | | Config · caveat | No-code editors for workflows, procedures and KB; Architect assistant drafts but can't publish; protected main branch. Tools still need developers. |
| JRN-06 | Must | | Native | Versions, branches, drafts, merge, traffic split, env vars, tests per branch. Caveat: privacy/retention, call limits and auth are shared across versions. |

### Human hand-off & escalation

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| HND-01 | Must | Gate | Native | `transfer_to_number` with natural-language conditions; "press 0" via DTMF prompt. |
| HND-02 | Must | | Config | LLM conditions plus deterministic expression and tool-result edges. |
| HND-03 | Could | | Partial | No real-time sentiment; emotion-based hand-off rests on prompted LLM judgement. |
| HND-04 | Should | | Config | Dedicated transfer rules / branches for emergencies and safeguarding. LLM detection → needs a test suite. |
| HND-05 | Should | | Partial · We build | No whisper over SIP. REFER headers + `X-Conversation-ID`; summary via server tool to HubSpot screen-pop. |
| HND-06 | Must | | We build | No callback object or availability check. Server tool → HubSpot task, outbound API for the call-back. |

### Systems integration

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| INT-01 | Must | | Partial · We build | Native HubSpot integration supports **US-hosted HubSpot accounts only** and not under ZRM. Our design writes to HubSpot ourselves. |
| INT-02 | Won't | | — | Not assessed. |
| INT-03 | Won't | | — | Not assessed. |
| INT-04 | Must | Out of scope | — | Booking is ours. |
| INT-05 | Could | | Gap · We build | No Tabeo integration. |
| INT-06 | Must | Out of scope | — | PMS integration is ours. |
| INT-07 | Should | | Native | Full REST API, SDKs, CLI, webhooks, hosted MCP server. |
| INT-08 | Should | | Ent. | Entra ID via SAML (SP-initiated only; OIDC with Entra not advised), SCIM 2.0. |
| SVC-06 (R4) | Must | Out of scope | — | R4 integration is ours. Duplicate ID in the sheet. |

### Payments

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| PAY-01 | Must | Gate | Gap · PBX | No payment capture or Securio integration. Only route is a one-way transfer; coming back to the agent means a new session built in telephony. |
| PAY-02 | Must | | Native | PCI DSS for ElevenLabs' own environment (Insight Assurance, 11 Sep 2025, per G-Cloud), excluding services not eligible for ZRM. Doesn't take our flow out of scope. |
| PAY-03 | Must | Gate | Gap | DTMF `redact_input` cleans the stored transcript only — **digits still reach the LLM live**. PAN redaction is post-call, Enterprise, "not 100%". No pause/resume. Must hand off before card data. |

### Omnichannel

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| OMN-01 | Could | | Native | WhatsApp (messages, voice notes, calls), chat mode, widget, SMS (Twilio numbers only). Cross-channel continuity undocumented. |
| OMN-02 | Must | | We build | SMS via Twilio tool (not under ZRM), WhatsApp templates, **no email**. Better sent from our booking transaction. |

### Safety, guardrails & accuracy

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| SAF-01 | Must | | Native (alpha) | Focus, manipulation, content and custom-rule guardrails. Blocking mode adds 200–500ms. Alpha — breaking changes possible. |
| SAF-02 | Must | | Config | Accuracy controls via KB/RAG tuning, guardrails and evaluation criteria; source of truth is our retrieval service. |
| SAF-03 | Must | | Partial | KB as full context or RAG; no "answer only from KB" mode or citation enforcement. |
| SAF-04 | Must | Gate | Config | Procedure "Say" step for the approved script, custom guardrail, forced transfer. Use Policy also bars tailored health advice. |
| SAF-05 | Must | | Native (alpha) · caveat | Manipulation guardrail detects injection but **ends the call**. `secret__` variables, overrides off by default. Real control is our call grammar (§2.2). |

### Compliance, security & data protection

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| SEC-01 | Should | | Gap | No DCB0129 safety case. As builder, we'd be the manufacturer. |
| SEC-02 | Should | | Gap | No DTAC. Their evidence (DSPT, ISO, pentests) can feed ours. |
| SEC-03 | Must | Gate | Gap · Ask | G-Cloud declares accessibility standards "None or don't know"; WCAG work "in progress". |
| SEC-04 | Must | Gate | Native · contract | DPA (8 Apr 2026) with UK Addendum; DSPT 2025-26 "Standards exceeded". Gaps: DPA annex lists sensitive data "N/A"; §13 allows support/moderation access from outside the region. |
| SEC-05 | Must | Gate | Ent. · conditional | No UK region. EU processing only with EU residency + ZRM + API-only. ZRM disables MCP. Under ZRM only Gemini, Claude and ElevenLabs-hosted Qwen are allowed; custom LLM (e.g. Azure OpenAI UK South) always supported. |
| SEC-06 | Must | Gate | Ent. · contract | Enterprise not trained on by default; self-serve trains by default (opt-out). LLM providers contractually barred, but Trust Centre wording is loose — get it in the contract. |
| SEC-07 | Must | Gate | Ent. | Encryption, RBAC, scoped keys. SSO, SCIM and audit logs Enterprise-only; audit logs cover admin actions only, not data access. |
| SEC-08 | Must | Gate | Native | `retention_days`, `record_voice`, DELETE conversation API. Backups up to 30 days; debug/moderation logs can outlive deletion unless ZRM. |
| SEC-09 | Must | | Native · NDA | Model cards, security whitepaper, SOC 2, CAIQ, ISO 42001 docs — mostly under NDA. DPIA is ours. |
| SEC-10 | Should | | Native | ISO 27001 (G-Cloud); SOC 2 Type II per the Trust Centre. G-Cloud lists Cyber Essentials and Cyber Essentials Plus certificate numbers — check they're current. |

### Transcripts, records & data capture

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| REC-01 | Must | Gate | Native | Transcripts via history, API and post-call webhook. Under ZRM, webhook only. |
| REC-02 | Must | | Partial · We build | Transcript in the spoken language. Translation only in the dashboard viewer; no API field. Post-call translation step is ours. |
| REC-03 | Must | Out of scope | — | Write-back is ours. Vendor side exists: `transcript_summary`, evaluation criteria, data-collection fields. |
| REC-04 | Should | | Partial | Spoken notice at call start. No consent capture, no per-call recording stop. |

### Reporting, monitoring & analytics

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| RPT-01 | Must | | Native | Call counts, duration, cost, latency p50–p99, errors, evaluation results, live call count. |
| RPT-02 | Must | | Native | Built-in dashboard; group by branch or LLM; per-node workflow stats. |
| RPT-03 | Must | | Config | Containment, hand-off, abandonment and conversion aren't built in; derive from evaluation criteria, data collection and `termination_reason`. |
| RPT-04 | Must | | Partial | Auto LLM scoring, tags, triage, convert-to-test. No human scorecard or sampling workflow. |
| RPT-05 | Must | | Partial · Ask | `platform_settings.alerting` failure-rate / spike monitors → webhook, PagerDuty, Slack. API-only, undocumented. Live monitoring Enterprise. |
| RPT-06 | Should | | We build | No BI connector; conversations API (100/page), OpenTelemetry export, webhooks → our warehouse. |

### Service, commercial & vendor

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| SVC-01 | Must | | Gap · contract | Published Agents SLA **99.5%** (TTS 99.9%); credits 5% / 10%. Self-serve best-effort. Standard support email-only, UK hours. |
| SVC-02 | Must | | Partial | $0.08/min list + LLM tokens + burst at 2× + carrier. USD billing. Enterprise / EU rate unpublished. |
| SVC-03 | Must | | Native | G-Cloud trial and pilot packages; traffic splits for staged rollout. Live patient data needs Enterprise EU. |
| SVC-04 | Must | Gate | Native | Conversation, transcript and audio APIs, webhooks, agent config as JSON. Data deleted 30 days after termination. Voice clones not exportable. |
| SVC-05 | Must | | Partial · contract | Pinned versions, branch testing — but retired models migrate automatically and the default fallback chain can change without notice. |
| SVC-06 | Could | | Ask | No UK healthcare or dental reference published (3Shape, Cadence only). |

### NHS certifications, assessments & contracts

| ID | MoSCoW | VegaIT | Verdict | Notes |
|---|---|---|---|---|
| NHS-01 | Could | | Partial | G-Cloud 15 Lot 2b "Agents Platform"; UK Government MOU (Jun 2026). No NHS contracts or CCS / NHS SBS / HSSF listings found. |
| NHS-02 | Could | | Gap · Ask | No MHRA registration or UKCA/CE marking found. Get it in writing. |

---

## For the live benchmark

What the docs say matters for turn latency, voice realism and operational accuracy:

- **TTS.** Welsh: `eleven_v4_turbo` vs `eleven_v3_conversational` (Flash can't do Welsh). English:
  `eleven_v4_turbo` vs `eleven_flash_v2` as the latency floor. Set per language through
  `language_presets`. Telephony audio formats `ulaw_8000` in and out.
- **STT.** Only `scribe_realtime` in agents. Vary `asr.keywords` (≤50, passed from the initiation
  webhook), `spelling_patience`, turn model (`turn_v3` vs `turn_v2`), eagerness per workflow step,
  `speculative_turn`, and ignore terms (incl. Welsh backchannels "ie", "iawn").
- **Numbers.** Compare `text_normalisation_type` (`system_prompt` vs `elevenlabs`). No confidence
  score, so the "19 vs 90" test is really a test of read-back confirmation.
- **LLM.** One fast (Gemini Flash-Lite, GPT-5.4 Mini, Claude Haiku 4.5) vs one strong (Sonnet,
  GPT-5.5), reasoning effort none/minimal. Score Welsh generation per LLM. Check which are allowed
  under EU residency + ZRM, and set our own fallback chain.
- **Measure latency at the caller's ear** (end of caller speech → first agent audio). Platform
  timestamps are whole seconds; per-turn metrics exist but their field names are undocumented.
- **Pronunciation dictionary** for practice, street and Welsh place names. Phoneme tags documented
  for v4, Flash v2 and v3 — confirm v4 Turbo, otherwise use aliases.

---

## Commercial snapshot (list prices, 2026-10-01)

| Plan | $/month | Included min | Concurrent calls |
|---|---|---|---|
| Pro | 99 | 1,238 | 20 |
| Scale | 299 | 3,738 | 30 |
| Business | 990 | 12,375 | 40 |
| Enterprise | custom | custom | custom |

- $0.08/min overage on every plan; burst at $0.16/min up to 3× concurrency; silence >10s billed at 5%.
- LLM tokens on top (Gemini 2.5 Flash ≈ $0.0012/min in their calculator). Carrier costs separate.
- G-Cloud (GBP): 13.33% discount under £250k, 23.33% from £250k; 60 concurrent sessions included;
  pilot packages £50k–£500k.
- **We need Enterprise regardless** — for concurrency, EU residency, ZRM, SSO and audit logs —
  and that rate isn't published. Get it before the TCO model (discovery item 7).

---

## Questions for ElevenLabs

Grouped by what they unblock. **Bold** = blocks a Gate or a design decision.

**Residency & data**
1. **Which GCP region(s) host EU storage, STT/TTS and Vertex LLM inference? Which LLMs are allowed
   under EU residency + ZRM? Does any US sub-processor (e.g. moderation) touch ZRM traffic?**
2. **Can DPA §13 out-of-region support/moderation access be removed by contract? Will the DPA cover
   Article 9 health data?**
3. **Is there any configuration that keeps processing in the EU without ZRM, so we keep MCP?**
4. Are audio webhooks delivered under ZRM, and what is their retry window?
5. UK residency on the roadmap? Private deployment on Azure (stated "planned H2 2026")?
6. Contractual commitment that neither ElevenLabs nor its LLM sub-processors train on our data.

**Service**

7. **99.9% SLA for Agents in the EU environment, with credits? 12-month EU uptime and RCAs?
   P1 response times and 24/7 escalation?**
8. **Enterprise per-minute rate with EU residency + ZRM; minimum commitment; included concurrency;
   GBP billing.**
9. Notice period before changes behind a pinned model ID or to the fallback chain; can both be frozen?

**Telephony**

10. **Mitel (MiVoice Business, MX-ONE, MiVoice Connect, MBG) customers or interop guides? Anything
    tested with Maintel?**
11. SRTP keying (SDES vs DTLS-SRTP), crypto suites; where SIP/media terminate for UK callers.
12. SIP response code at the concurrency limit / queue timeout, so Mitel can overflow to humans.
13. REFER: are custom headers carried into the PBX's new INVITE? Limits? Does a rejected REFER or
    unanswered human return the call to the agent?
14. Conference transfer over SIP: does media stay on ElevenLabs, is it billed, recorded, counted?
15. Whisper over SIP on the roadmap?

**Payments**

16. **Current PCI AOC and responsibility matrix; a Securio/Sycurio or PCI Pal reference design;
    can STT and recording be paused via API; can a call return to the same conversation after a transfer?**

**Platform**

17. **Initiation-webhook timeout, retries and fallback when our endpoint is slow.**
18. **Request signing (HMAC or mTLS) for tools, MCP and the initiation webhook — on the roadmap?
    Do webhook tools retry on 5xx or timeout?**
19. Guardrails and merge proposals: GA dates? Can a manipulation trigger hand off instead of ending the call?
20. Does editing a shared tool or KB document change every agent version that references it?
21. Do agent tests exercise STT, TTS and telephony, or text only?
22. Alerting monitor names and defaults; a dashboard screen for them.
23. Withheld and international caller ID format in `caller_id`.

**Voice & language**

24. **Welsh WER for Scribe v2 Realtime on 8kHz phone audio; Welsh–English code-switching roadmap.**
25. With v4 Turbo: do `tts.speed`, phoneme dictionaries, expressive tags and `elevenlabs`
    normalisation work, and does normalisation handle Welsh?
26. Production end-to-end turn latency with v4 Turbo over UK/EU telephony.
27. Any inbound noise suppression in the agent pipeline? What do `conversation_turn_metrics` contain?

**Assurance**

28. Current Cyber Essentials Plus certificate; DSPT 2026-27 plan.
29. Hazard and failure-mode input for our DCB0129/DCB0160 work; MHRA position in writing.
30. UK healthcare or dental references; NHS contracts.

---

## Sources

Paths are under `https://elevenlabs.io/docs/` unless a full URL is given. `EA/` = `eleven-agents/`.

- Models and languages — `overview/models`, `overview/capabilities/text-to-speech/eleven-v4`,
  `overview/capabilities/speech-to-text`, `help-center/product/eleven-agents/which-languages-can-i-use-with-eleven-agents`,
  `https://api.elevenlabs.io/v1/voices/accents`
- Conversation — `EA/customization/conversation-flow`, `EA/customization/voice/expressive-mode`,
  `EA/customization/voice/speed-control`, `EA/customization/voice/pronunciation-dictionary`,
  `EA/customization/llm`, `EA/customization/llm/llm-cascading`
- Telephony — `EA/phone-numbers/sip-trunking`, `EA/phone-numbers/sip-reference`,
  `EA/phone-numbers/batch-calls`, `EA/guides/call-queueing`, `EA/guides/burst-pricing`,
  `EA/customization/multimodal-input`, `EA/customization/tools/system-tools/transfer-to-number`
- Platform — `EA/customization/personalization` (+ `/dynamic-variables`, `/overrides`),
  `EA/customization/tools/webhook-tools`, `EA/customization/tools/mcp`, `EA/workflows/post-call-webhooks`,
  `EA/customization/agent-workflows`, `EA/customization/procedures`, `EA/operate/versioning`,
  `EA/best-practices/guardrails`, `EA/customization/knowledge-base/rag`, `EA/dashboard`,
  `EA/customization/integrations/hubspot`, `overview/administration/workspaces/sso`, `…/audit-logs`
- Data & compliance — `overview/administration/data-residency`, `eleven-api/resources/zero-retention-mode`,
  `EA/customization/privacy/retention`, `EA/customization/privacy/conversation-history-redaction`,
  `https://compliance.elevenlabs.io`, `https://elevenlabs.io/dpa`, `https://elevenlabs.io/use-policy`,
  `https://www.dsptoolkit.nhs.uk/OrganisationSearch/O0R6R`
- Commercial & service — `https://elevenlabs.io/pricing/agents`, `https://status.elevenlabs.io/history`,
  G-Cloud service 169034009770830 on the Digital Marketplace
