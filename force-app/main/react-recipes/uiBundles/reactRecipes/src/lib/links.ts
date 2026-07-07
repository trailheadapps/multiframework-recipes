/**
 * External links surfaced from the UI. The advanced server-recipes repo is
 * tracked separately and may not exist yet; v1 ships with a placeholder.
 * Flip this single constant when the real URL lands — every callsite reads
 * `serverRepo` rather than hardcoding.
 */
export const EXTERNAL_LINKS = {
  serverRepo: {
    url: '#advanced-server-recipes',
    label: 'Advanced server recipes',
    placeholder: true,
  },
  developerGuide: {
    url: 'https://developer.salesforce.com/docs/platform/einstein-for-devs/guide/reactdev-overview.html',
    label: 'Developer Guide',
    placeholder: false,
  },
} as const;
