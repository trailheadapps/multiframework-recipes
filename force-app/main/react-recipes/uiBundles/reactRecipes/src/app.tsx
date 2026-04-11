import { createBrowserRouter, RouterProvider } from 'react-router';
import { routes } from '@/routes';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { IconSettings } from '@salesforce/design-system-react';
import './styles/global.css';
import './styles/slds.css';

// Normalize basename: strip trailing slash so it matches URLs like /lwr/application/ai/c-app
const rawBasePath = (globalThis as any).SFDC_ENV?.basePath;
const basename =
  typeof rawBasePath === 'string' ? rawBasePath.replace(/\/+$/, '') : undefined;
const router = createBrowserRouter(routes, { basename });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IconSettings iconPath="/assets/icons">
      <RouterProvider router={router} />
    </IconSettings>
  </StrictMode>
);
