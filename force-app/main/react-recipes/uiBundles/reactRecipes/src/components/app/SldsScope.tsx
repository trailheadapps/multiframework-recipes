import type { ReactNode } from 'react';

/**
 * Wraps SLDS 2 blueprint markup in the required `.slds-scope` container.
 *
 * The app loads the SLDS 2 *scoped* stylesheet, which only styles elements
 * inside `.slds-scope`. This keeps SLDS out of the Tailwind/shadcn app shell —
 * put SLDS blueprint recipes inside <SldsScope>, leave everything else outside.
 */
export default function SldsScope({ children }: { children: ReactNode }) {
  return <div className="slds-scope">{children}</div>;
}
