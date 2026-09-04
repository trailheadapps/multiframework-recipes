import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

const APP_PAGES = [
	{ path: '/hello', label: 'Hello' },
	{ path: '/read-data', label: 'Read Data' },
	{ path: '/modify-data', label: 'Modify Data' },
	{ path: '/salesforce-apis', label: 'Salesforce APIs' },
	{ path: '/error-handling', label: 'Error Handling' },
	{ path: '/routing', label: 'Routing' },
];

/**
 * Link (routerLink)
 *
 * Client-side navigation with the routerLink directive — renders a plain <a>
 * but navigates without a full page reload.
 *
 * LWC equivalent: NavigationMixin.Navigate() with a typed page reference;
 * routerLink is simpler — just pass a path.
 *
 * @see NavLinkDemoComponent — links that know if they match the current URL
 */
@Component({
	selector: 'app-link-demo',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink],
	templateUrl: './link-demo.html',
})
export class LinkDemoComponent {
	protected readonly pages = APP_PAGES;
}
