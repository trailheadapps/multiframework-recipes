/**
 * eslint-plugin-angular-graphql.js
 *
 * Custom ESLint plugin with composite processor that enables BOTH:
 * - Angular inline template linting (processInlineTemplates)
 * - GraphQL tagged template literal linting (@graphql-eslint processor)
 *
 * ESLint only allows one processor per file type. This plugin calls both
 * processors under the hood, returning the source code only once to avoid
 * duplicate TypeScript lint messages.
 *
 * Usage:
 *   import { createPlugin } from './eslint-plugin-angular-graphql.js';
 *   const plugin = createPlugin({ schemaPath: '/absolute/path/to/schema.graphql' });
 *
 * Safety assumptions (verified against source):
 * - Neither processor clones source messages in postprocess (object identity dedup works)
 * - gql tags do not appear inside inline template strings (autofix ranges non-overlapping)
 * - Both processors store internal state keyed by filePath (or derived from it)
 */
import { existsSync } from 'node:fs';
import angular from 'angular-eslint';
import graphqlPlugin from '@graphql-eslint/eslint-plugin';

const angularProcessor = angular.processInlineTemplates;
const graphqlProcessor = graphqlPlugin.processor;

// Track block counts per file for postprocess message routing
const blockCountsMap = new Map();

const compositeProcessor = {
	meta: {
		name: 'angular-graphql/composite',
		version: '1.0.0',
	},
	supportsAutofix: true,

	preprocess(code, filePath) {
		// Call both preprocessors — this populates their internal state maps
		// Angular returns: [source, ...htmlBlocks] (source FIRST)
		const angularResult = angularProcessor.preprocess(code, filePath);
		// GraphQL returns: [...gqlBlocks, source] (source LAST)
		const graphqlResult = graphqlProcessor.preprocess(code, filePath);

		// Extract blocks (excluding source) from each
		const htmlBlocks = angularResult.length > 1 ? angularResult.slice(1) : [];
		const gqlBlocks = graphqlResult.length > 1 ? graphqlResult.slice(0, -1) : [];

		// Store counts for postprocess routing
		blockCountsMap.set(filePath, {
			gqlCount: gqlBlocks.length,
			htmlCount: htmlBlocks.length,
		});

		// Return unified: [gqlBlocks..., htmlBlocks..., source]
		// Source appears exactly ONCE at the end
		return [...gqlBlocks, ...htmlBlocks, code];
	},

	postprocess(messages, filePath) {
		const { gqlCount, htmlCount } = blockCountsMap.get(filePath) || { gqlCount: 0, htmlCount: 0 };
		blockCountsMap.delete(filePath);

		const sourceIndex = gqlCount + htmlCount;
		const sourceMessages = messages[sourceIndex] || [];

		// Short-circuit: neither processor extracted blocks
		if (gqlCount === 0 && htmlCount === 0) {
			return sourceMessages;
		}

		// Short-circuit: only Angular had blocks
		if (gqlCount === 0) {
			const angularMessages = [sourceMessages, ...messages.slice(0, htmlCount)];
			return angularProcessor.postprocess(angularMessages, filePath);
		}

		// Short-circuit: only GraphQL had blocks
		if (htmlCount === 0) {
			const gqlMessages = [...messages.slice(0, gqlCount), sourceMessages];
			return graphqlProcessor.postprocess(gqlMessages, filePath);
		}

		// Both had blocks — route to each postprocess and merge
		// GraphQL expects: [gqlBlock0Msgs, ..., gqlBlockNMsgs, sourceMessages]
		const gqlInput = [...messages.slice(0, gqlCount), sourceMessages];
		const gqlResult = graphqlProcessor.postprocess(gqlInput, filePath);

		// Angular expects: [sourceMessages, htmlBlock0Msgs, ..., htmlBlockMMsgs]
		const angularInput = [sourceMessages, ...messages.slice(gqlCount, gqlCount + htmlCount)];
		const angularResult = angularProcessor.postprocess(angularInput, filePath);

		// Deduplicate source messages (both postprocessors pass them through by reference)
		const sourceSet = new Set(sourceMessages);
		const gqlOnly = gqlResult.filter((m) => !sourceSet.has(m));

		// angularResult = [...sourceMessages, ...adjustedHtmlMessages]
		// gqlOnly = [...adjustedGqlMessages] (source messages filtered out)
		return [...angularResult, ...gqlOnly].sort((a, b) => a.line - b.line || a.column - b.column);
	},
};

/**
 * Factory: pass schemaPath, get back a plugin with configs ready to spread.
 * - If schema exists → composite processor (Angular + GraphQL) + GraphQL rules
 * - If no schema → Angular-only inline template processor, no GraphQL rules
 */
export function createPlugin({ schemaPath } = {}) {
	const schemaExists = !!(schemaPath && existsSync(schemaPath));

	const configs = [
		{
			files: ['**/*.ts'],
			processor: schemaExists ? compositeProcessor : angularProcessor,
		},
		...(schemaExists
			? [
					{
						files: ['**/*.graphql'],
						languageOptions: {
							parser: graphqlPlugin.parser,
							parserOptions: {
								graphQLConfig: {
									schema: schemaPath,
									documents: 'src/**/*.ts',
								},
							},
						},
						plugins: {
							'@graphql-eslint': graphqlPlugin,
						},
						rules: {
							'@graphql-eslint/no-anonymous-operations': 'error',
							'@graphql-eslint/no-duplicate-fields': 'error',
							'@graphql-eslint/known-fragment-names': 'error',
							'@graphql-eslint/no-undefined-variables': 'error',
							'@graphql-eslint/no-unused-variables': 'error',
						},
					},
				]
			: []),
	];

	return {
		meta: { name: 'eslint-plugin-angular-graphql', version: '1.0.0' },
		configs,
	};
}
