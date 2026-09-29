#!/usr/bin/env node
/**
 * Copy the CLI-rendered SVGs into the deck's asset folder.
 *
 * Diagram bodies are never hand-edited here — they are rendered from
 * docs/diagrams/mermaid/*.mmd by scripts/render-diagrams.mjs, which also validates
 * that they compile and are readably proportioned. This step just makes the
 * validated output importable by Vite.
 */

import { readdirSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', 'docs', 'diagrams', 'svg');
const DEST = join(HERE, 'src', 'assets');

if (!existsSync(SRC)) {
  console.error('No rendered SVGs found. Run: node ../scripts/render-diagrams.mjs');
  process.exit(1);
}

mkdirSync(DEST, { recursive: true });

const files = readdirSync(SRC).filter((f) => f.endsWith('.svg'));
for (const f of files) {
  copyFileSync(join(SRC, f), join(DEST, f));
  console.log(`  synced  ${f}`);
}

console.log(`\n${files.length} diagram(s) synced into the deck.`);
console.log('Add or reorder slides in src/slides.ts.');
