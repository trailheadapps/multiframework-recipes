/**
 * Build-time substitution of `__SF_API_VERSION__`.
 *
 * Resolves the connected org's API version (from `sf` CLI session) once at
 * builder startup and injects it via esbuild's `define`. Falls back to "65.0"
 * if no session is available — matches @salesforce/platform-sdk's default.
 *
 * Referenced from angular.json's production build configuration
 * (architect.build.configurations.production.plugins[]). Local dev runs via
 * `sf-angular-serve`, which uses the SDK's default API version instead.
 */
import { createApiVersionPlugin } from '@salesforce/angular-plugin-ui-bundle';

const { plugin } = await createApiVersionPlugin();
export default plugin;
