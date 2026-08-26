/**
 * Build-time substitution of `__SF_API_VERSION__` (production + main app code in dev).
 *
 * Resolves the connected org's API version (from `sf` CLI session) once at
 * builder startup and injects it via esbuild's `define`. Falls back to "65.0"
 * if no session is available — matches @salesforce/platform-sdk's default.
 *
 * In `ng serve`, this plugin runs on the application esbuild pass but does NOT
 * reach Vite's optimizeDeps prebundle of node_modules. `scripts/dev.mjs` covers
 * that gap by passing the same value via `ng serve --define`.
 *
 * Referenced from angular.json: architect.build.options.plugins[].
 */
import { createApiVersionPlugin } from '@salesforce/angular-plugin-ui-bundle';

const { plugin } = await createApiVersionPlugin();
export default plugin;
