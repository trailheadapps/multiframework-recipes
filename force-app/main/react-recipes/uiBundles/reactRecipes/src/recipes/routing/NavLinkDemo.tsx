/**
 * NavLink
 *
 * <NavLink> is a superset of <Link> that knows whether its path matches the
 * current URL. Its className prop accepts a function receiving { isActive },
 * useful for highlighting the current page in a nav menu.
 *
 * LWC equivalent: @wire(CurrentPageReference) and manual URL comparison to
 * highlight active navigation items. NavLink handles this automatically
 * and also sets aria-current="page" for accessibility.
 *
 * Try it: "Routing" is already highlighted — click another link to see the
 * active state move.
 *
 * @see RouteParameters — reading dynamic URL segments
 */
import { NavLink, useMatch } from 'react-router';

const APP_PAGES = [
  { path: '/hello', label: 'Hello' },
  { path: '/read-data', label: 'Read Data' },
  { path: '/modify-data', label: 'Modify Data' },
  { path: '/salesforce-apis', label: 'Salesforce APIs' },
  { path: '/error-handling', label: 'Error Handling' },
  { path: '/routing', label: 'Routing' },
];

export default function NavLinkDemo() {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">
        Pass a function to <code>className</code> to apply styles when the link
        matches the current URL. React Router also sets{' '}
        <code>aria-current="page"</code> automatically.
      </p>
      <nav className="flex flex-col">
        <ul>
          {APP_PAGES.map(page => (
            <NavItem key={page.path} path={page.path} label={page.label} />
          ))}
        </ul>
      </nav>
    </div>
  );
}

// Extracted so useMatch can be called per item — hooks can't be called inside .map()
// Active state styling applied via className; NavLink handles aria-current="page" on the <a>
function NavItem({ path, label }: { path: string; label: string }) {
  const match = useMatch(path);
  return (
    <li>
      <NavLink
        to={path}
        className={`block px-3 py-2 text-sm rounded-md hover:bg-accent ${
          match ? 'bg-accent text-accent-foreground font-medium' : ''
        }`}
      >
        {label}
      </NavLink>
    </li>
  );
}
