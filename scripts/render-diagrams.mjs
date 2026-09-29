#!/usr/bin/env node
/**
 * Render every Mermaid source in docs/diagrams/mermaid to SVG and PNG, then
 * sanity-check the result. Mermaid will happily compile a diagram that is
 * unreadable, so this also reports dimensions and flags anything with a
 * punishing aspect ratio.
 *
 *   node scripts/render-diagrams.mjs             render everything that changed
 *   node scripts/render-diagrams.mjs --force     re-render everything
 *   node scripts/render-diagrams.mjs container   render one, by filename stem
 *
 *   docs/diagrams/mermaid/  hand-edited sources
 *   docs/diagrams/svg/      generated — the deck's source of truth
 *   docs/diagrams/png/      generated — for documents, tickets and email
 */

import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, basename, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIAGRAMS = join(ROOT, 'docs', 'diagrams');
const SRC = join(DIAGRAMS, 'mermaid');
const OUT_SVG = join(DIAGRAMS, 'svg');
const OUT_PNG = join(DIAGRAMS, 'png');

const WIDTH = 2000;          // wide enough that 11px labels stay legible
const MAX_RATIO = 3.5;       // past this it will not survive a slide
const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.find((a) => !a.startsWith('--'));

for (const dir of [OUT_SVG, OUT_PNG]) mkdirSync(dir, { recursive: true });

const sources = readdirSync(SRC)
  .filter((f) => extname(f) === '.mmd')
  .filter((f) => !only || basename(f, '.mmd') === only);

if (sources.length === 0) {
  console.error(only ? `No diagram named "${only}" in docs/diagrams/mermaid` : 'No .mmd files found in docs/diagrams/mermaid');
  process.exit(1);
}

/** Render one file to one format. Returns the output path. */
function render(src, out) {
  execFileSync(
    'npx',
    ['-y', '@mermaid-js/mermaid-cli', '-i', src, '-o', out, '-b', 'white', '-w', String(WIDTH)],
    // cwd is pinned to the repo root: when this runs via `deck`'s npm script, letting
    // npx execute inside deck/ prunes that package's optional deps and breaks its build.
    { cwd: ROOT, stdio: ['ignore', 'ignore', 'pipe'], shell: process.platform === 'win32' },
  );
  return out;
}

/** Pull width/height out of the rendered SVG without a parser dependency. */
function svgDimensions(path) {
  const head = readFileSync(path, 'utf8').slice(0, 2000);
  const vb = head.match(/viewBox="([\d.\-\s]+)"/);
  if (vb) {
    const [, , w, h] = vb[1].trim().split(/\s+/).map(Number);
    if (w && h) return { w: Math.round(w), h: Math.round(h) };
  }
  const w = head.match(/width="(\d+)/);
  const h = head.match(/height="(\d+)/);
  return w && h ? { w: +w[1], h: +h[1] } : null;
}

let failed = 0;
let warned = 0;

for (const file of sources) {
  const stem = basename(file, '.mmd');
  const src = join(SRC, file);
  const svg = join(OUT_SVG, `${stem}.svg`);
  const png = join(OUT_PNG, `${stem}.png`);

  const fresh =
    !force && existsSync(svg) && statSync(svg).mtimeMs > statSync(src).mtimeMs;
  if (fresh) {
    console.log(`  skip  ${stem}  (up to date)`);
    continue;
  }

  try {
    render(src, svg);
    render(src, png);
  } catch (err) {
    failed++;
    const detail = (err.stderr?.toString() || err.message).trim().split('\n').slice(-4).join('\n');
    console.error(`  FAIL  ${stem}\n${detail.replace(/^/gm, '        ')}`);
    continue;
  }

  const dim = svgDimensions(svg);
  if (!dim) {
    console.log(`   ok   ${stem}`);
    continue;
  }

  const ratio = dim.w / dim.h;
  const shape = ratio > MAX_RATIO || ratio < 1 / MAX_RATIO ? 'WARN' : ' ok ';
  if (shape === 'WARN') warned++;
  console.log(
    `  ${shape}  ${stem.padEnd(28)} ${dim.w}x${dim.h}  ratio ${ratio.toFixed(2)}` +
      (shape === 'WARN' ? '  <- too elongated to read; re-lay it out' : ''),
  );
}

console.log(
  `\n${sources.length} diagram(s) processed` +
    (warned ? `, ${warned} with layout warnings` : '') +
    (failed ? `, ${failed} FAILED` : ''),
);

if (warned && !failed) {
  console.log(
    'Tip: a common cause is `direction LR` inside a subgraph whose nodes have\n' +
      '     external edges — it is ignored. Set the direction at the top level instead.',
  );
}

process.exit(failed ? 1 : 0);
