/**
 * Prepares dist/ for e2e: root-relative asset paths + SPA fallback for serve.
 *
 * angular.json sets deployUrl: "./", so the built index.html references
 * scripts/styles with a relative "./" prefix (e.g. ./main-HASH.js). When the
 * SPA fallback serves index.html for a deep route like /non-existent-route,
 * those "./" paths resolve against the wrong base and 404, so the app never
 * boots. Rewrite them to root-relative "/" paths.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// angular.json outputPath: { base: "dist", browser: "" } -> files land in dist/
const distDir = join(__dirname, '..', 'dist');

// Rewrite index.html so asset paths are root-relative (./main-x.js -> /main-x.js)
const indexPath = join(distDir, 'index.html');
let html = readFileSync(indexPath, 'utf8');
html = html.replace(/(src|href)="\.\//g, '$1="/');
writeFileSync(indexPath, html);

// SPA fallback so /non-existent-route etc. serve index.html
writeFileSync(
	join(distDir, 'serve.json'),
	JSON.stringify({
		rewrites: [{ source: '**', destination: '/index.html' }],
	}),
);
