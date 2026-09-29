# {my}dentist — AI Delivery Partner, Discovery

Working repository for the discovery phase: the diagram set, the deck that walks a room through
it, and the written material the phase produces.

Two workstreams are in scope — AI voice call handling for practices and the support centre, and
an internal agentic knowledge assistant. The architecture position is in `docs/Architecture.md`;
the four-week discovery scope and its internal priorities are in `docs/additional_context.md`.

## Layout

```text
docs/
  Architecture.md          Our target architecture: three planes, the transaction layer, the write path.
  additional_context.md    Discovery-phase scope, with ownership and sequencing notes.
  client documentation/    Client-supplied source material. Tracked. See "Client material".
  diagram-conventions.md   The visual language. Authoritative; read it before drawing anything.
  tooling.md               Approved tooling for the phase, and the rules for client material in it.
  diagrams/
    mermaid/   *.mmd       Hand-edited sources. The only diagram files you edit.
    svg/       *.svg       Generated — what the deck embeds. Committed.
    png/       *.png       Generated — for documents, tickets and email. Committed.
  rfp/                     Our written output — proposal and response material.

discovery/
  AI Vendors/              Voice platform evaluation: benchmarks, scoring, live-call test results.
  Integrations/            R4, HubSpot, Dataphiles — spike findings and feasibility evidence.

deck/                      Pan/zoom slideshow of the rendered diagrams.
scripts/
  render-diagrams.mjs      Mermaid -> SVG + PNG, with a compile and readability check.
.claude/agents/            Subagents that already know the conventions.
```

## The loop

Diagram bodies are never hand-edited in the deck. Edit the Mermaid source, render, look at it.

```bash
cd deck
npm install
npm run render     # renders SVG + PNG, checks each compiles and is readable, syncs to the deck
npm run dev        # http://localhost:5173
```

Render without touching the deck, or re-render a single diagram:

```bash
node scripts/render-diagrams.mjs                      # only what changed
node scripts/render-diagrams.mjs --force              # everything
node scripts/render-diagrams.mjs soft-lock-state      # one, by filename stem
```

The script reports each diagram's dimensions and warns when one is too elongated to read on a
slide. **Then look at the output.** Mermaid compiles plenty of diagrams that are unreadable, and
the ratio check only catches the most obvious failure.

`--force` rewrites every rendered file even where the source did not change — Mermaid embeds
non-deterministic ids. Prefer the incremental default; after a forced render, check `git status`
and revert anything whose source is untouched.

## Client material

`docs/client documentation/` holds client-supplied source material, and **it is tracked**, so those
documents travel with the repository.

Treat the contents as confidential. Two consequences worth keeping in view: **the remote must stay
private**, and anything committed here is permanent in history even if deleted later. Office files
are marked binary in `.gitattributes`, so each revision stores a full copy rather than a diff —
commit updated versions deliberately, not on every save.

Loose `.eml` exports remain excluded. They are correspondence rather than delivered documents and
carry sender and recipient personal data.

## Conventions

`docs/diagram-conventions.md` decides the palette, node shapes, edge semantics and document
structure. It is authoritative and it encodes mistakes already paid for — follow it rather than
inventing a second visual language. If a convention looks wrong, say so; don't silently deviate.
