import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

const APP_PAGES = [
	{ path: '/hello', label: 'Hello' },
	{ path: '/read-data', label: 'Read Data' },
	{ path: '/modify-data', label: 'Modify Data' },
	{ path: '/salesforce-apis', label: 'Salesforce APIs' },
	{ path: '/error-handling', label: 'Error Handling' },
	{ path: '/routing', label: 'Routing' },
];

/**
 * NavLink (routerLinkActive)
 *
 * routerLinkActive applies classes when a link matches the current URL, and
 * ariaCurrentWhenActive sets aria-current="page" automatically — ideal for a
 * nav menu that highlights the current page. This replaces React Router's
 * NavLink + useMatch.
 *
 * LWC equivalent: @wire(CurrentPageReference) + manual URL comparison.
 *
 * @see RouteParametersComponent — reading dynamic URL segments
 */
@Component({
	selector: 'app-nav-link-demo',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, RouterLinkActive],
	templateUrl: './nav-link-demo.html',
})
export class NavLinkDemoComponent {
	protected readonly pages = APP_PAGES;
}
