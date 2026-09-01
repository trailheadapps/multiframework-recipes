/**
 * Creates placeholder assets that @salesforce-ux/design-system-2 references but
 * does not ship.
 *
 * slds2.scoped.base.css has background-image url()s pointing at decorative
 * avatar / Einstein / info-background files under the package's dist/public/,
 * but that directory is absent from the published package. Angular's esbuild CSS
 * pipeline hard-errors on the unresolvable url()s (Vite tolerates a dangling
 * url() as a literal, which is why the React app needs no such shim). None of
 * the recipes use these assets, so we drop in 1x1 placeholders to satisfy
 * resolution. Runs on postinstall so a fresh `npm install`/`npm ci` (dev and CI)
 * always has them before a build.
 */
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);

let publicDir;
try {
	const pkgJson = require.resolve('@salesforce-ux/design-system-2/package.json');
	publicDir = join(dirname(pkgJson), 'dist', 'public');
} catch {
	// SLDS 2 isn't installed — nothing to stub.
	process.exit(0);
}

// 1x1 transparent PNG and a minimal SVG — never displayed, only resolved.
const PNG = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
	'base64',
);
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';

const PNG_NAMES = [
	'profile_avatar_96',
	'profile_avatar_160',
	'profile_avatar_200',
	'group_avatar_96',
	'group_avatar_160',
	'group_avatar_200',
	'bg-info@2x',
];
const SVG_NAMES = ['einstein-figure', 'einstein-header-background'];

mkdirSync(publicDir, { recursive: true });
for (const name of PNG_NAMES) {
	const file = join(publicDir, `${name}.png`);
	if (!existsSync(file)) writeFileSync(file, PNG);
}
for (const name of SVG_NAMES) {
	const file = join(publicDir, `${name}.svg`);
	if (!existsSync(file)) writeFileSync(file, SVG);
}
