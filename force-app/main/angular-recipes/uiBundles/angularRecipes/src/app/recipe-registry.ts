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
];

/** Returns the number of recipes for a given category route (e.g. "/hello"). */
export function getRecipeCount(categoryRoute: string): number {
	return recipeRegistry.filter((r) => r.categoryRoute === categoryRoute).length;
}
