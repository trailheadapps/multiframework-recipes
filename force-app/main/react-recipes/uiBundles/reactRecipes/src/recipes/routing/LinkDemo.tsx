/**
 * Link
 *
 * Client-side navigation with React Router's <Link> component — renders as a
 * plain <a> in the DOM but prevents a full page reload.
 *
 * LWC equivalent: NavigationMixin.Navigate() with a typed page reference
 * object, or lightning/navigation's NavigationMixin. React Router's <Link>
 * is simpler — just pass a URL string.
 *
 * Try it: click any link — the URL updates and the page switches without a
 * full page reload.
 *
 * @see NavLinkDemo — links that know if they match the current URL
 */
import { Link } from 'react-router';
import { buttonVariants } from '@/components/ui/button';

const APP_PAGES = [
  { path: '/hello', label: 'Hello' },
  { path: '/read-data', label: 'Read Data' },
  { path: '/modify-data', label: 'Modify Data' },
  { path: '/salesforce-apis', label: 'Salesforce APIs' },
  { path: '/error-handling', label: 'Error Handling' },
  { path: '/routing', label: 'Routing' },
];

export default function LinkDemo() {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">
        Navigates without a full page reload. Renders as a plain{' '}
        <code>&lt;a&gt;</code> in the DOM.
      </p>
      <div className="grid grid-cols-3 gap-2">
        {APP_PAGES.map(page => (
          <Link
            key={page.path}
            to={page.path}
            className={buttonVariants({ variant: "outline", className: "w-full" })}
          >
            {page.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
