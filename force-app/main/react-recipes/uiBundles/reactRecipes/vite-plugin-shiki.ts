/**
 * Vite plugin that pre-renders syntax highlighting at build time.
 *
 * Import any file with `?shiki` to get pre-highlighted HTML:
 *
 *   import html from './MyComponent.tsx?shiki';
 *
 * Uses shiki with material-theme-darker and twoslash for hover types.
 */
import { readFile } from 'node:fs/promises';
import { createHighlighter, type Highlighter } from 'shiki';
import {
  transformerTwoslash,
  rendererRich,
} from '@shikijs/twoslash';
import type { Plugin } from 'vite';
import baseTheme from 'shiki/themes/material-theme-darker.mjs';

const SHIKI_QUERY = 'shiki';

// Brighten comments (#545454 is too dim on the dark background)
const theme = {
  ...baseTheme,
  tokenColors: baseTheme.tokenColors?.map((tc) =>
    tc.settings?.foreground?.toLowerCase() === '#545454'
      ? { ...tc, settings: { ...tc.settings, foreground: '#8A8A8A' } }
      : tc
  ),
};

// Injection grammar: highlight gql`` tagged template contents as GraphQL
const gqlInjection = {
  name: 'gql-injection',
  scopeName: 'inline.graphql',
  injectTo: ['source.tsx', 'source.ts', 'source.js', 'source.jsx'],
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
  embeddedLangs: ['graphql'] as string[],
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [theme],
      langs: ['tsx', 'graphql', gqlInjection as any],
    });
  }
  return highlighterPromise;
}

const twoslash = transformerTwoslash({
  renderer: rendererRich(),
  twoslashOptions: {
    compilerOptions: {
      moduleResolution: 100, // bundler
      module: 99, // esnext
      target: 99, // esnext
      jsx: 4, // react-jsx
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      isolatedModules: true,
    },
  },
});

export default function shikiPlugin(): Plugin {
  return {
    name: 'vite-plugin-shiki',
    enforce: 'pre',

    async load(id) {
      const [filePath, query] = id.split('?');
      if (query !== SHIKI_QUERY) return;

      const source = await readFile(filePath, 'utf-8');
      const highlighter = await getHighlighter();

      let html: string;
      try {
        html = highlighter.codeToHtml(`// @noErrors\n${source}`, {
          lang: 'tsx',
          theme: 'material-theme-darker',
          transformers: [twoslash],
        });
      } catch {
        // Fall back to plain highlighting if twoslash fails
        html = highlighter.codeToHtml(source, {
          lang: 'tsx',
          theme: 'material-theme-darker',
        });
      }

      return `export default ${JSON.stringify(html)};`;
    },
  };
}
