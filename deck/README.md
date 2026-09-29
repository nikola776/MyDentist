# Architecture Deck

A pan/zoom slideshow of the architecture diagrams, for walking a room through the
system without exporting anything to PowerPoint.

## The loop

Diagram bodies are **never hand-edited here**. They are Mermaid sources under
`docs/diagrams/mermaid/*.mmd`, rendered and validated by the render script, then synced in.

```bash
# edit  docs/diagrams/mermaid/<name>.mmd
npm run render     # renders SVG + PNG, checks they compile and are readable, syncs to the deck
npm run dev        # http://localhost:5173
```

`npm run render` will refuse to pass silently: it reports the dimensions of every
diagram and warns when one is too elongated to read on a slide.

## Adding a slide

1. Write `docs/diagrams/mermaid/<name>.mmd` following `docs/diagram-conventions.md`.
2. `npm run render`
3. Add an entry to `src/slides.ts` — import the SVG, give it a title, caption and audience.

Order in `slides.ts` is the order in the deck. It ships empty; until the first slide is
added the stage shows those same three steps.

## Controls

| Input | Action |
|---|---|
| Left / Right arrow, PageUp / PageDown | Previous / next slide |
| Home / End | First / last slide |
| Mouse wheel | Zoom |
| Drag | Pan |
| Double-click | Reset zoom |
| Filmstrip thumbnail | Jump to slide |

## Build

```bash
npm run build      # static site in dist/, openable from the filesystem (base is './')
```
