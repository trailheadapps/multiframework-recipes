/**
 * Central registry of all recipes, keyed by category route. Drives the Home
 * page counts and the global search bar. Mirrors the React app's recipeRegistry.
 * Add a category's entries here as it is ported.
 */
export interface RecipeEntry {
	name: string;
	description: string;
	category: string;
	categoryRoute: string;
	/** Zero-based index of this recipe within its category page. */
	recipeIndex: number;
}

export const recipeRegistry: RecipeEntry[] = [
	// Hello
	{
		category: 'Hello',
		categoryRoute: '/hello',
		recipeIndex: 0,
		name: 'Hello World',
		description: 'The simplest possible Salesforce web application component.',
	},
	{
		category: 'Hello',
		categoryRoute: '/hello',
		recipeIndex: 1,
		name: 'Binding to an Account Name',
		description: 'Fetches an Account via UIAPI GraphQL and binds the Name field to the template.',
	},
	{
		category: 'Hello',
		categoryRoute: '/hello',
		recipeIndex: 2,
		name: 'Conditional Rendering',
		description:
			'Fetches an Account and conditionally renders different UI based on the Industry picklist value.',
	},
	{
		category: 'Hello',
		categoryRoute: '/hello',
		recipeIndex: 3,
		name: 'List Rendering (For Each)',
		description: 'Fetches Accounts via GraphQL and renders them with the @for block.',
	},
	{
		category: 'Hello',
		categoryRoute: '/hello',
		recipeIndex: 4,
		name: 'Lifecycle (Fetch on Mount)',
		description: 'Fetches a Contact in ngOnInit with cleanup to prevent stale updates.',
	},
	{
		category: 'Hello',
		categoryRoute: '/hello',
		recipeIndex: 5,
		name: 'Parent-to-Child (Inputs)',
		description:
			'The parent fetches Accounts via GraphQL and passes each one to a child component as inputs.',
	},
	{
		category: 'Hello',
		categoryRoute: '/hello',
		recipeIndex: 6,
		name: 'Child-to-Parent (Outputs)',
		description:
			'A child component presents an Industry selector and emits an output to its parent.',
	},
	{
		category: 'Hello',
		categoryRoute: '/hello',
		recipeIndex: 7,
		name: 'State Management (Shared State)',
		description:
			'Two sibling components share a selected Account by lifting state to their common parent.',
	},

	// Read Data
	{
		category: 'Read Data',
		categoryRoute: '/read-data',
		recipeIndex: 0,
		name: 'Single Record',
		description: 'Queries a single Contact via UIAPI GraphQL and displays its fields.',
	},
	{
		category: 'Read Data',
		categoryRoute: '/read-data',
		recipeIndex: 1,
		name: 'List of Records',
		description:
			'Queries multiple Contacts and renders each one from the Relay edges[].node shape.',
	},
	{
		category: 'Read Data',
		categoryRoute: '/read-data',
		recipeIndex: 2,
		name: 'Filtered List with Variables',
		description: 'Queries Contacts by name using a debounced GraphQL variable bound to an input.',
	},
	{
		category: 'Read Data',
		categoryRoute: '/read-data',
		recipeIndex: 3,
		name: 'Sorted Results',
		description: 'Fetches Contacts with an orderBy rebuilt from signals whenever the sort changes.',
	},
	{
		category: 'Read Data',
		categoryRoute: '/read-data',
		recipeIndex: 4,
		name: 'Paginated List',
		description: 'Fetches Contacts two at a time using Relay cursor pagination (first / after).',
	},
	{
		category: 'Read Data',
		categoryRoute: '/read-data',
		recipeIndex: 5,
		name: 'Related Records',
		description:
			'Queries Contacts with their parent Account in one request, traversing a lookup relationship.',
	},
	{
		category: 'Read Data',
		categoryRoute: '/read-data',
		recipeIndex: 6,
		name: 'Aliased Multi-Object Query',
		description: 'Queries Accounts and Contacts in a single request using GraphQL aliases.',
	},
	{
		category: 'Read Data',
		categoryRoute: '/read-data',
		recipeIndex: 7,
		name: 'Imperative Refetch',
		description: 'Displays a Contact list with a Refresh button that re-runs the query on demand.',
	},
	// Modify Data
	{
		category: 'Modify Data',
		categoryRoute: '/modify-data',
		recipeIndex: 0,
		name: 'Create a Record',
		description: 'Creates an Account via the AccountCreate UIAPI mutation on form submit.',
	},
	{
		category: 'Modify Data',
		categoryRoute: '/modify-data',
		recipeIndex: 1,
		name: 'Update a Record',
		description: 'Loads an Account and edits Name and Industry via the AccountUpdate mutation.',
	},
	{
		category: 'Modify Data',
		categoryRoute: '/modify-data',
		recipeIndex: 2,
		name: 'Delete a Record',
		description: 'Deletes an Account with a per-row confirm and removes the row from local state.',
	},
	{
		category: 'Modify Data',
		categoryRoute: '/modify-data',
		recipeIndex: 3,
		name: 'Server-Side Error Handling',
		description: 'Surfaces a top-level GraphQL error from a mutation missing a required field.',
	},
	{
		category: 'Modify Data',
		categoryRoute: '/modify-data',
		recipeIndex: 4,
		name: 'Query + Mutation Together',
		description: 'Inline-edits a list row and patches it from the AccountUpdate response.',
	},
	// Salesforce APIs
	{
		category: 'Salesforce APIs',
		categoryRoute: '/salesforce-apis',
		recipeIndex: 0,
		name: 'Display Current User',
		description: 'Fetches the current user from the Chatter REST /users/me endpoint via sdk.fetch.',
	},
	{
		category: 'Salesforce APIs',
		categoryRoute: '/salesforce-apis',
		recipeIndex: 1,
		name: 'UI API (REST)',
		description: 'Uses the UI API list-ui and list-records REST endpoints to load a list view.',
	},
	{
		category: 'Salesforce APIs',
		categoryRoute: '/salesforce-apis',
		recipeIndex: 2,
		name: 'Apex REST',
		description: 'Calls a custom Apex REST endpoint (ContactsResource) that returns plain JSON.',
	},
	// Integration
	{
		category: 'Integration',
		categoryRoute: '/integration',
		recipeIndex: 0,
		name: 'Searchable Account List',
		description: 'A debounced search input drives a GraphQL variable filtering Accounts by name.',
	},
	{
		category: 'Integration',
		categoryRoute: '/integration',
		recipeIndex: 1,
		name: 'Dashboard with Aliased Queries',
		description:
			'Fetches Accounts, Contacts, and Opportunities in one aliased request as stat cards.',
	},
	// Error Handling
	{
		category: 'Error Handling',
		categoryRoute: '/error-handling',
		recipeIndex: 0,
		name: 'Loading, Error, and Empty States',
		description:
			'Handles loading, error, and empty states explicitly with a discriminated-union signal.',
	},
	{
		category: 'Error Handling',
		categoryRoute: '/error-handling',
		recipeIndex: 1,
		name: 'Error Boundary',
		description:
			'Angular has no render boundary — guard the risky work and surface failures with a signal.',
	},
	{
		category: 'Error Handling',
		categoryRoute: '/error-handling',
		recipeIndex: 2,
		name: 'GraphQL Errors',
		description:
			'Reads query-level errors from result.errors[] and contrasts them with thrown exceptions.',
	},
	// Styling
	{
		category: 'Styling',
		categoryRoute: '/styling',
		recipeIndex: 0,
		name: 'Account Card (SLDS)',
		description: 'Account data rendered with SLDS blueprint card classes on plain markup.',
	},
	{
		category: 'Styling',
		categoryRoute: '/styling',
		recipeIndex: 1,
		name: 'Account Card (spartan-ng)',
		description: "The same Account data rendered with the app's spartan-ng card components.",
	},
	{
		category: 'Styling',
		categoryRoute: '/styling',
		recipeIndex: 2,
		name: 'Icons (SLDS)',
		description: 'SLDS icons referenced from SVG sprite sheets (utility and standard).',
	},
	{
		category: 'Styling',
		categoryRoute: '/styling',
		recipeIndex: 3,
		name: 'Icons (Lucide)',
		description: 'Lucide icons via @ng-icons as individual, tree-shakable ng-icon components.',
	},
	{
		category: 'Styling',
		categoryRoute: '/styling',
		recipeIndex: 4,
		name: 'Button (SLDS)',
		description: 'Standard button variants as slds-button_* classes on plain buttons.',
	},
	{
		category: 'Styling',
		categoryRoute: '/styling',
		recipeIndex: 5,
		name: 'Button (spartan-ng)',
		description: "The app shell's spartan-ng button — appearances, sizes, disabled, and icons.",
	},
	// Routing
	{
		category: 'Routing',
		categoryRoute: '/routing',
		recipeIndex: 0,
		name: 'Link',
		description: 'Client-side navigation with the routerLink directive.',
	},
	{
		category: 'Routing',
		categoryRoute: '/routing',
		recipeIndex: 1,
		name: 'NavLink',
		description: 'Active-aware links with routerLinkActive and ariaCurrentWhenActive.',
	},
	{
		category: 'Routing',
		categoryRoute: '/routing',
		recipeIndex: 2,
		name: 'Programmatic Navigation',
		description: 'Imperative navigation with Router.navigate() after an action completes.',
	},
	{
		category: 'Routing',
		categoryRoute: '/routing',
		recipeIndex: 3,
		name: 'Route Parameters',
		description: 'A :accountId detail route bound to a signal input via component input binding.',
	},
	{
		category: 'Routing',
		categoryRoute: '/routing',
		recipeIndex: 4,
		name: 'Nested Routes',
		description: 'A master-detail layout with a router-outlet and a route-scoped store.',
	},
];

/** Returns the number of recipes for a given category route (e.g. "/hello"). */
export function getRecipeCount(categoryRoute: string): number {
	return recipeRegistry.filter((r) => r.categoryRoute === categoryRoute).length;
}
