/**
 * Shiki esbuild plugin — pre-renders syntax highlighting at build time.
 *
 * Import any file with `?shiki` to get its source as pre-highlighted HTML:
 *
 *   import tsSource from './hello-world.ts?shiki';
 *   import htmlSource from './hello-world.html?shiki';
 *
 * The recipe source viewer renders that HTML directly. `.ts` files highlight as
 * TypeScript and `.html` files as HTML; inline gql`...` tagged templates are
 * highlighted as GraphQL via an injection grammar. This mirrors the React app's
 * vite-plugin-shiki.ts so both apps' code panels look identical.
 *
 * Referenced from angular.json: architect.build.options.plugins[].
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHighlighter } from 'shiki';

const THEME = 'material-theme-darker';

// Highlight the contents of gql`...` tagged templates as GraphQL, matching the
// React plugin so inline UIAPI queries read the same in both apps.
const gqlInjection = {
	name: 'gql-injection',
	scopeName: 'inline.graphql',
	injectTo: ['source.ts'],
	injectionSelector: 'L:source -comment -string',
	patterns: [
		{
			begin: '(?i)(gql)\\s*(`)',
			beginCaptures: {
				1: { name: 'entity.name.function.tagged-template.ts' },
				2: { name: 'punctuation.definition.string.template.begin.ts' },
			},
			end: '(`)',
			endCaptures: {
				1: { name: 'punctuation.definition.string.template.end.ts' },
			},
			contentName: 'meta.embedded.block.graphql',
			patterns: [{ include: 'source.graphql' }],
		},
	],
	embeddedLangs: ['graphql'],
};

let highlighterPromise = null;
function getHighlighter() {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: [THEME],
			langs: ['ts', 'html', 'graphql', gqlInjection],
		});
	}
	return highlighterPromise;
}

const NAMESPACE = 'shiki-source';

/** @type {import('esbuild').Plugin} */
const shikiPlugin = {
	name: 'shiki',
	setup(build) {
		// Resolve the real file, but give the virtual module a non-source path
		// suffix. Angular's own esbuild onLoad claims anything ending in `.ts`
		// (even in a foreign namespace), so the suffix keeps this module ours.
		build.onResolve({ filter: /\?shiki$/ }, (args) => {
			const file = resolve(args.resolveDir, args.path.replace(/\?shiki$/, ''));
			return { path: `${file}.shiki-source`, namespace: NAMESPACE, pluginData: { file } };
		});

		build.onLoad({ filter: /.*/, namespace: NAMESPACE }, async (args) => {
			const file = args.pluginData.file;
			const source = await readFile(file, 'utf-8');
			const lang = file.endsWith('.html') ? 'html' : 'ts';
			let html;
			try {
				const highlighter = await getHighlighter();
				html = highlighter.codeToHtml(source, { lang, theme: THEME });
			} catch (error) {
				// Never break the build if highlighting fails — fall back to plain,
				// escaped source so the panel still renders.
				console.warn(`[shiki] failed to highlight ${file}: ${error}`);
				const escaped = source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
				html = `<pre class="shiki" style="background-color:#212121;color:#EEFFFF"><code>${escaped}</code></pre>`;
			}
			return {
				contents: `export default ${JSON.stringify(html)};`,
				loader: 'js',
				watchFiles: [file],
			};
		});
	},
};

export default shikiPlugin;
