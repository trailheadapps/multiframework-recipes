/**
 * Prepares dist/ for e2e: root-relative asset paths + SPA fallback for serve.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

// Rewrite index.html so every relative src/href is root-relative (/assets/..., /favicon.ico, ...)
const indexPath = join(distDir, 'index.html');
let html = readFileSync(indexPath, 'utf8');
html = html.replace(/(src|href)="\.\//g, '$1="/');
writeFileSync(indexPath, html);

// SPA fallback so /about, /non-existent-route etc. serve index.html
writeFileSync(
  join(distDir, 'serve.json'),
  JSON.stringify({
    rewrites: [{ source: '**', destination: '/index.html' }],
  })
);
