import { defineConfig } from 'vitest/config';

// Merged into the @angular/build:unit-test builder via `runnerConfig: true`.
// Per-file isolation (fresh module registry each file) so vi.mock() module
// mocks (e.g. @salesforce/platform-sdk) can't bleed across spec files.
export default defineConfig({
	test: {
		isolate: true,
	},
});
