/**
 * SDK guest layout for the externally-hosted MFE recipes.
 *
 * Mirrors mfe-app/src/main.tsx: registers the sf-embedding bootstrap listener,
 * resolves the Platform SDK once, and shares it via SdkProvider so every recipe
 * consumes the same instance. Rendered as a route layout; the matched recipe
 * renders through <Outlet />. When running standalone (no iframe) the SDKs still
 * resolve but most methods are no-ops.
 */
// Side-effect import: registers the sf-embedding bootstrap listener at
// module-load time, before any createXxxSDK() call below.
import '@salesforce/platform-sdk/sf-embedding';

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { createChatSDK, createViewSDK } from '@salesforce/platform-sdk';
import { SdkProvider, type SdkBundle } from './sdk-context';
import '../styles/recipe.css';

export default function GuestLayout() {
  const [sdk, setSdk] = useState<SdkBundle | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([createChatSDK(), createViewSDK()]).then(([chat, view]) => {
      if (active) setSdk({ chat, view });
    });
    return () => {
      active = false;
    };
  }, []);

  if (!sdk) return null;

  return (
    <SdkProvider value={sdk}>
      <Outlet />
    </SdkProvider>
  );
}
