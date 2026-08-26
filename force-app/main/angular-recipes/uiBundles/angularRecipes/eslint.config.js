import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import angular from 'angular-eslint';
import tseslint from 'typescript-eslint';
import { createPlugin } from './eslint-plugin-angular-graphql.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, '../../../../../schema.graphql');
const angularGraphqlPlugin = createPlugin({ schemaPath });

export default tseslint.config(
	// Global ignores
	{
		ignores: [
			'dist/**/*',
			'.angular/**/*',
			'coverage/**/*',
			'node_modules/**/*',
			// Vendored Spartan primitives use upstream hlm*/brn* selectors and are
			// not authored here, so they can't satisfy the app-prefix/a11y rules.
			'**/shared/**',
		],
	},
	// TypeScript files
	{
		files: ['**/*.ts'],
		extends: [
			js.configs.recommended,
			...tseslint.configs.recommended,
			...angular.configs.tsRecommended,
		],
		rules: {
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'app',
					style: 'camelCase',
				},
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'app',
					style: 'kebab-case',
				},
			],
			// The UI wrapper components (app-button, app-card, …) intentionally
			// alias an input to `class` so callers can write `class="…"` on the host
			// and have it forward to the inner Material element. Allow that one name.
			'@angular-eslint/no-input-rename': ['error', { allowedNames: ['class'] }],
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
		},
	},
	// Template files
	{
		files: ['**/*.html'],
		extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
		rules: {},
	},
	// Inline template processor + GraphQL rules (plugin handles schema detection)
	...angularGraphqlPlugin.configs,
);
