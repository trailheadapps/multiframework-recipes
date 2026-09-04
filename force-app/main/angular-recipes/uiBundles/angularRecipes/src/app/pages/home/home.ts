import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCode } from '@ng-icons/lucide';
import { CardImports } from '../../components/ui/card/card';
import { getRecipeCount } from '../../recipe-registry';

@Component({
	selector: 'app-home',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, NgIcon, CardImports],
	providers: [provideIcons({ lucideCode })],
	templateUrl: './home.html',
})
export class HomeComponent {
	// Category tiles. A category appears here once it is ported and routed.
	protected readonly categories = [
		{
			to: '/hello',
			name: 'Hello',
			description:
				'Start here. Covers template binding, conditional and list rendering, lifecycle, and component composition with inputs and outputs.',
			count: getRecipeCount('/hello'),
		},
		{
			to: '/read-data',
			name: 'Read Data',
			description:
				'Query Salesforce records with UIAPI GraphQL: single records, lists, filtering, sorting, cursor pagination, related records, and aliased multi-object queries.',
			count: getRecipeCount('/read-data'),
		},
		{
			to: '/modify-data',
			name: 'Modify Data',
			description:
				'Create, update, and delete records with UIAPI GraphQL mutations, handle server errors, and sync local state from the response.',
			count: getRecipeCount('/modify-data'),
		},
		{
			to: '/salesforce-apis',
			name: 'Salesforce APIs',
			description:
				'Call Salesforce REST APIs with sdk.fetch: the current user via Chatter, the UI API list endpoints, and a custom Apex REST resource.',
			count: getRecipeCount('/salesforce-apis'),
		},
		{
			to: '/error-handling',
			name: 'Error Handling',
			description:
				'Handle async states explicitly, contain failures without a render boundary, and read GraphQL errors from result.errors[].',
			count: getRecipeCount('/error-handling'),
		},
		{
			to: '/styling',
			name: 'Styling',
			description:
				"Two styling systems side by side: SLDS blueprint classes and sprites, and the app's spartan-ng (Tailwind) components and Lucide icons.",
			count: getRecipeCount('/styling'),
		},
		{
			to: '/routing',
			name: 'Routing',
			description:
				'Angular Router in a UI Bundle: routerLink, active links, programmatic navigation, route parameters bound to inputs, and nested master-detail routes.',
			count: getRecipeCount('/routing'),
		},
		{
			to: '/integration',
			name: 'Integration',
			description:
				'End-to-end patterns that combine GraphQL variables, debounced search, and aliased multi-object queries into dashboards.',
			count: getRecipeCount('/integration'),
		},
	];
}
