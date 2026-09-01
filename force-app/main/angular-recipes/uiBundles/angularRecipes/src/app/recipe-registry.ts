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
		description: 'Queries multiple Contacts and renders each one from the Relay edges[].node shape.',
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
];

/** Returns the number of recipes for a given category route (e.g. "/hello"). */
export function getRecipeCount(categoryRoute: string): number {
	return recipeRegistry.filter((r) => r.categoryRoute === categoryRoute).length;
}
