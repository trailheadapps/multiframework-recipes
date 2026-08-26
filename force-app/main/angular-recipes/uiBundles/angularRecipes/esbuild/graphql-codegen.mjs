/**
 * GraphQL Codegen esbuild plugin — runs codegen on build start.
 *
 * Resolves GraphQL operations into typed TypeScript at build time using the
 * project's `codegen.yml` configuration. Re-runs on every rebuild during
 * `ng serve` so generated types stay in sync with schema/document changes.
 *
 * Referenced from angular.json: architect.build.options.plugins[].
 */
import { createGraphQLCodegenPlugin } from '@salesforce/angular-plugin-ui-bundle';

const plugin = createGraphQLCodegenPlugin();
export default plugin;
