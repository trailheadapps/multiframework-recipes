import type { RouteObject } from 'react-router';
import AppLayout from '@/appLayout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Hello from './pages/Hello';
import ReadData from './pages/ReadData';
import ModifyData from './pages/ModifyData';
import SalesforceAPIs from './pages/SalesforceAPIs';
import Authentication from './pages/Authentication';
import ErrorHandling from './pages/ErrorHandling';
import Styling from './pages/Styling';
import Routing, {
  RouteParametersPage,
  NestedRoutesPage,
} from './pages/Routing';
import Integration from './pages/Integration';
import { RouteParametersDetail } from './recipes/routing/RouteParameters';
import NestedRoutes, {
  NestedRoutesIndex,
  NestedRoutesDetail,
} from './recipes/routing/NestedRoutes';
import GuestLayout from './recipes/embedding/GuestLayout';
import BasicRender from './recipes/embedding/BasicRender';
import ReadHostData from './recipes/embedding/ReadHostData';
import SendToHost from './recipes/embedding/SendToHost';
import AutoResize from './recipes/embedding/AutoResize';
import ThemeTokens from './recipes/embedding/ThemeTokens';
import UnsavedChanges from './recipes/embedding/UnsavedChanges';
import ReceiveEvent from './recipes/embedding/ReceiveEvent';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'hello',
        element: <Hello />,
        handle: { showInNavigation: true, label: 'Hello' },
      },
      {
        path: 'read-data',
        element: <ReadData />,
        handle: { showInNavigation: true, label: 'Read Data' },
      },
      {
        path: 'modify-data',
        element: <ModifyData />,
        handle: { showInNavigation: true, label: 'Modify Data' },
      },
      {
        path: 'salesforce-apis',
        element: <SalesforceAPIs />,
        handle: { showInNavigation: true, label: 'Salesforce APIs' },
      },
      {
        path: 'authentication',
        element: <Authentication />,
        handle: { showInNavigation: true, label: 'Authentication' },
      },
      {
        path: 'error-handling',
        element: <ErrorHandling />,
        handle: { showInNavigation: true, label: 'Error Handling' },
      },
      {
        path: 'styling',
        element: <Styling />,
        handle: { showInNavigation: true, label: 'Styling' },
      },
      {
        path: 'routing',
        element: <Routing />,
        handle: { showInNavigation: true, label: 'Routing' },
      },
      {
        path: 'route-parameters',
        element: <RouteParametersPage />,
        handle: { showInNavigation: true, label: 'Route Parameters' },
        children: [{ path: ':accountId', element: <RouteParametersDetail /> }],
      },
      {
        path: 'nested-routes',
        element: <NestedRoutesPage />,
        handle: { showInNavigation: true, label: 'Nested Routes' },
        children: [
          {
            element: <NestedRoutes />,
            children: [
              { index: true, element: <NestedRoutesIndex /> },
              { path: ':accountId', element: <NestedRoutesDetail /> },
            ],
          },
        ],
      },
      {
        path: 'integration',
        element: <Integration />,
        handle: { showInNavigation: true, label: 'Integration' },
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    // Externally-hosted embedding guests. Loaded by the uiEmbedding*
    // LWC hosts via <lightning-ui-embedding src=".../embedding/<recipe>">. This
    // is a PATHLESS layout route (no `path`) so it sits OUTSIDE AppLayout —
    // the iframe renders a clean recipe with no gallery navbar/footer.
    // GuestLayout bootstraps the Platform SDK and provides it to each recipe.
    element: <GuestLayout />,
    children: [
      { path: 'embedding/basic-render', element: <BasicRender /> },
      { path: 'embedding/read-host-data', element: <ReadHostData /> },
      { path: 'embedding/send-to-host', element: <SendToHost /> },
      { path: 'embedding/auto-resize', element: <AutoResize /> },
      { path: 'embedding/theme-tokens', element: <ThemeTokens /> },
      { path: 'embedding/unsaved-changes', element: <UnsavedChanges /> },
      { path: 'embedding/receive-event', element: <ReceiveEvent /> },
    ],
  },
];
