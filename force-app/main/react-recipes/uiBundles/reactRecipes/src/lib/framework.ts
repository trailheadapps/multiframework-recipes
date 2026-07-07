import { useEffect, useState } from 'react';
import type { Framework, Hosting } from '@/recipeRegistry';

const STORAGE_KEY = 'mfr.framework';
const HOSTING_STORAGE_KEY = 'mfr.hostingFilter';

export const FRAMEWORK_LABEL: Record<Framework, string> = {
  react: 'React',
  vue: 'Vue',
  angular: 'Angular',
};

export const HOSTING_LABEL: Record<Hosting, string> = {
  'salesforce-hosted': 'Salesforce-Hosted',
  'externally-hosted': 'Externally Hosted',
};

export const HOSTING_SHORT_LABEL: Record<Hosting, string> = {
  'salesforce-hosted': 'SF',
  'externally-hosted': 'Ext',
};

/** Generic copy when a release target is not committed. */
export const SOON_LABEL = '(soon)';

export const FRAMEWORKS: Framework[] = ['react', 'vue', 'angular'];

/** React (today) is the only enabled framework. Flipping a flavor on is one PR. */
export const ENABLED_FRAMEWORKS: Framework[] = ['react'];

export const DEFAULT_FRAMEWORK: Framework = 'react';

export function isFramework(value: string | null | undefined): value is Framework {
  return value === 'react' || value === 'vue' || value === 'angular';
}

export function isHosting(value: string | null | undefined): value is Hosting {
  return value === 'salesforce-hosted' || value === 'externally-hosted';
}

export function isFrameworkEnabled(framework: Framework): boolean {
  return ENABLED_FRAMEWORKS.includes(framework);
}

/** URL short forms keep links scannable per §6 of the design doc. */
export const HOSTING_PARAM_TO_VALUE: Record<string, Hosting> = {
  sf: 'salesforce-hosted',
  ext: 'externally-hosted',
};

export const HOSTING_VALUE_TO_PARAM: Record<Hosting, string> = {
  'salesforce-hosted': 'sf',
  'externally-hosted': 'ext',
};

function readFramework(): Framework {
  if (typeof window === 'undefined') return DEFAULT_FRAMEWORK;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return isFramework(raw) && isFrameworkEnabled(raw) ? raw : DEFAULT_FRAMEWORK;
}

/**
 * Read/write the user's preferred framework. Cross-tab sync via the `storage`
 * event so two open windows stay in step.
 */
export function useFramework(): [Framework, (f: Framework) => void] {
  const [framework, setFrameworkState] = useState<Framework>(readFramework);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && isFramework(e.newValue)) {
        setFrameworkState(e.newValue);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function setFramework(next: Framework) {
    if (!isFrameworkEnabled(next)) return;
    setFrameworkState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }

  return [framework, setFramework];
}

/** Hosting filter on the catalog. `null` = "All". */
export type HostingFilter = Hosting | null;

function readHostingFilter(): HostingFilter {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(HOSTING_STORAGE_KEY);
  return isHosting(raw) ? raw : null;
}

export function useHostingFilter(): [HostingFilter, (f: HostingFilter) => void] {
  const [filter, setFilterState] = useState<HostingFilter>(readHostingFilter);

  function setFilter(next: HostingFilter) {
    setFilterState(next);
    if (typeof window === 'undefined') return;
    if (next === null) window.localStorage.removeItem(HOSTING_STORAGE_KEY);
    else window.localStorage.setItem(HOSTING_STORAGE_KEY, next);
  }

  return [filter, setFilter];
}
