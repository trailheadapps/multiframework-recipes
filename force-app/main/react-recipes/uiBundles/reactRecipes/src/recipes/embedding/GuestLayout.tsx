/**
 * Route layout for the externally-hosted embedding recipes.
 *
 * Registers the ui-embedding bootstrap listener at module load and
 * applies the .embedding-guest class to the document root so shared
 * app styles switch to a transparent, chromeless layout. The matched
 * recipe renders through <Outlet /> and calls getViewSDK() to get its
 * SDK instance.
 */
// Registers the ui-embedding bootstrap listener at module load,
// before any recipe calls getViewSDK().
import '@salesforce/platform-sdk/ui-embedding';

import { useEffect } from 'react';
import { Outlet } from 'react-router';

export default function GuestLayout() {
  useEffect(() => {
    document.documentElement.classList.add('embedding-guest');
    return () => {
      document.documentElement.classList.remove('embedding-guest');
    };
  }, []);

  return <Outlet />;
}
