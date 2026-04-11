import { Outlet, Link, useLocation } from 'react-router';
import Layout, { type RecipeItem } from '@/components/app/Layout';
import CodeBlock from '@/components/app/CodeBlock';
import LinkDemo from '@/recipes/routing/LinkDemo';
import { RouteParametersList } from '@/recipes/routing/RouteParameters';
import NavLinkDemo from '@/recipes/routing/NavLinkDemo';
import UseNavigate from '@/recipes/routing/UseNavigate';

import linkDemoSource from '@/recipes/routing/LinkDemo.tsx?shiki';
import navLinkDemoSource from '@/recipes/routing/NavLinkDemo.tsx?shiki';
import useNavigateSource from '@/recipes/routing/UseNavigate.tsx?shiki';
import routeParametersSource from '@/recipes/routing/RouteParameters.tsx?shiki';
import nestedRoutesSource from '@/recipes/routing/NestedRoutes.tsx?shiki';

export default function Routing() {
  const recipes: RecipeItem[] = [
    {
      name: 'Link',
      description:
        "Client-side navigation with React Router's <Link> component — renders as a plain <a> in the DOM but prevents a full page reload. In LWC, you'd call NavigationMixin.Navigate() with a typed page reference object; here you pass a URL string directly.",
      component: <LinkDemo />,
      source: linkDemoSource,
    },
    {
      name: 'NavLink',
      description:
        'NavLink is a superset of Link that knows whether its path matches the current URL. Its className prop accepts a function receiving { isActive }, making it ideal for navigation menus that highlight the current page. React Router also sets aria-current="page" automatically.',
      component: <NavLinkDemo />,
      source: navLinkDemoSource,
    },
    {
      name: 'Programmatic Navigation (useNavigate)',
      description:
        "useNavigate() returns an imperative navigate function. Call it anywhere in component logic — after a form submission, mutation, or auth redirect. In LWC, you'd call NavigationMixin.Navigate() with a typed page reference; here you pass a URL string.",
      component: <UseNavigate />,
      source: useNavigateSource,
    },
    {
      name: 'Route Parameters',
      description:
        'An Account list links to a detail view using a dynamic route parameter (:accountId). useParams reads the ID from the URL — in LWC you\'d wire CurrentPageReference and read it from the page state object.',
      component: <RouteParametersList />,
      source: routeParametersSource,
    },
    {
      name: 'Nested Routes',
      description:
        'A master-detail layout where the sidebar stays visible while a detail panel renders alongside it via <Outlet />. Account data is shared with children via useOutletContext — no re-fetch needed in child routes.',
      component: (
        <p className="text-sm text-muted-foreground">
          This recipe requires its own route.{' '}
          <Link to="/nested-routes" className="text-primary hover:underline">
            Open the Nested Routes demo →
          </Link>
        </p>
      ),
      source: nestedRoutesSource,
    },
  ];

  return <Layout header="Routing & Navigation" recipes={recipes} />;
}

/** Page wrapper for the Route Parameters demo. Renders demo + code side by side. */
export function RouteParametersPage() {
  return <DemoPage title="Route Parameters" source={routeParametersSource} />;
}

/** Page wrapper for the Nested Routes demo. Renders demo + code side by side. */
export function NestedRoutesPage() {
  const { pathname } = useLocation();
  return (
    <DemoPage
      title="Nested Routes"
      source={nestedRoutesSource}
      subtitle={pathname}
      backTo="/routing"
    />
  );
}

function DemoPage({
  title,
  source,
  subtitle,
  backTo,
}: {
  title: string;
  source: string;
  subtitle?: string;
  backTo?: string;
}) {
  return (
    <div className="slds-p-vertical_medium">
      <div className="slds-page-header slds-m-bottom_medium">
        <div className="slds-page-header__row">
          <div className="slds-page-header__col-title">
            <div className="slds-media">
              <div className="slds-media__body">
                <div className="slds-page-header__name">
                  <div className="slds-page-header__name-title">
                    <h1>
                      <span className="slds-page-header__title">{title}</span>
                    </h1>
                    {subtitle && (
                      <p className="slds-text-body_small slds-text-color_weak slds-m-top_xx-small">
                        <code>{subtitle}</code>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {backTo && (
            <div className="slds-page-header__col-actions">
              <Link
                to={backTo}
                className="slds-button slds-button_neutral"
              >
                ← Back to Routing
              </Link>
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          alignItems: 'start',
        }}
      >
        <div className="slds-box">
          {/* Child routes render here — see routes.tsx for the route tree */}
          <Outlet />
        </div>
        <div style={{ height: 'calc(100vh - 10rem)' }}>
          <CodeBlock source={source} />
        </div>
      </div>
    </div>
  );
}
