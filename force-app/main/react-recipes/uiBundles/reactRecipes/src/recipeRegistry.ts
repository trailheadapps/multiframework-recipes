/**
 * Central registry of all recipes, keyed by category route.
 * Each entry stores the recipe name, description, and the category it belongs to.
 * Used by the Home page for counts and by the global search bar for filtering.
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
    description:
      'The simplest possible Salesforce web application component.',
  },
  {
    category: 'Hello',
    categoryRoute: '/hello',
    recipeIndex: 1,
    name: 'Binding to an Account Name',
    description:
      'Fetches an Account via UIAPI GraphQL and binds the Name field to JSX.',
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
    description:
      'Fetches Accounts via GraphQL and renders them using Array.map().',
  },
  {
    category: 'Hello',
    categoryRoute: '/hello',
    recipeIndex: 4,
    name: 'Lifecycle (Fetch on Mount)',
    description:
      'Uses useEffect to fetch a Contact on mount with cleanup to prevent stale updates.',
  },
  {
    category: 'Hello',
    categoryRoute: '/hello',
    recipeIndex: 5,
    name: 'Parent-to-Child (Props)',
    description:
      'The parent fetches Accounts via GraphQL and passes each one to a child component as props.',
  },
  {
    category: 'Hello',
    categoryRoute: '/hello',
    recipeIndex: 6,
    name: 'Child-to-Parent (Callbacks)',
    description:
      'A child component presents an Industry selector and calls a parent callback.',
  },
  {
    category: 'Hello',
    categoryRoute: '/hello',
    recipeIndex: 7,
    name: 'State Management (Lifted State)',
    description:
      'Two sibling components share a selected Account by lifting state to their common parent.',
  },

  // Read Data
  {
    category: 'Read Data',
    categoryRoute: '/read-data',
    recipeIndex: 0,
    name: 'Single Record',
    description:
      'Queries a single Contact via UIAPI GraphQL and displays its fields.',
  },
  {
    category: 'Read Data',
    categoryRoute: '/read-data',
    recipeIndex: 1,
    name: 'List of Records',
    description:
      'Queries multiple Contacts via UIAPI GraphQL and renders each one.',
  },
  {
    category: 'Read Data',
    categoryRoute: '/read-data',
    recipeIndex: 2,
    name: 'Filtered List with Variables',
    description:
      'Queries Contacts by name using a GraphQL variable bound to an input field.',
  },
  {
    category: 'Read Data',
    categoryRoute: '/read-data',
    recipeIndex: 3,
    name: 'Sorted Results',
    description:
      'Fetches Contacts with an orderBy argument driven by component state.',
  },
  {
    category: 'Read Data',
    categoryRoute: '/read-data',
    recipeIndex: 4,
    name: 'Paginated List',
    description:
      'Fetches two Contacts at a time using Relay cursor pagination.',
  },
  {
    category: 'Read Data',
    categoryRoute: '/read-data',
    recipeIndex: 5,
    name: 'Related Records',
    description:
      'Queries Contacts with their parent Account in a single GraphQL request.',
  },
  {
    category: 'Read Data',
    categoryRoute: '/read-data',
    recipeIndex: 6,
    name: 'Aliased Multi-Object Query',
    description:
      'Queries Accounts and Contacts in a single GraphQL request using aliases.',
  },
  {
    category: 'Read Data',
    categoryRoute: '/read-data',
    recipeIndex: 7,
    name: 'Imperative Refetch',
    description:
      'Displays a Contact list with a Refresh button that re-invokes the query on demand.',
  },

  // Modify Data
  {
    category: 'Modify Data',
    categoryRoute: '/modify-data',
    recipeIndex: 0,
    name: 'Create a Record',
    description:
      'Creates a Salesforce Account via the AccountCreate UIAPI mutation on form submit.',
  },
  {
    category: 'Modify Data',
    categoryRoute: '/modify-data',
    recipeIndex: 1,
    name: 'Update a Record',
    description:
      'Loads an Account and lets you edit Name and Industry via the AccountUpdate mutation.',
  },
  {
    category: 'Modify Data',
    categoryRoute: '/modify-data',
    recipeIndex: 2,
    name: 'Delete a Record',
    description:
      'Lists Accounts with a delete button per row.',
  },
  {
    category: 'Modify Data',
    categoryRoute: '/modify-data',
    recipeIndex: 3,
    name: 'Server-Side Error Handling',
    description:
      'Handles top-level GraphQL errors from a UIAPI mutation.',
  },
  {
    category: 'Modify Data',
    categoryRoute: '/modify-data',
    recipeIndex: 4,
    name: 'Query + Mutation Together',
    description:
      'Lists Accounts with inline editing using query and mutation together.',
  },

  // Salesforce APIs
  {
    category: 'Salesforce APIs',
    categoryRoute: '/salesforce-apis',
    recipeIndex: 0,
    name: 'Display Current User',
    description:
      'Fetches the current user via the Chatter REST endpoint using DataSDK.fetch.',
  },
  {
    category: 'Salesforce APIs',
    categoryRoute: '/salesforce-apis',
    recipeIndex: 1,
    name: 'UI API (REST)',
    description:
      'Lists Contacts from a list view via UI API and DataSDK.fetch.',
  },
  {
    category: 'Salesforce APIs',
    categoryRoute: '/salesforce-apis',
    recipeIndex: 2,
    name: 'Apex REST',
    description:
      'Calls a custom Apex REST endpoint to fetch Contacts via DataSDK.fetch.',
  },

  // Error Handling
  {
    category: 'Error Handling',
    categoryRoute: '/error-handling',
    recipeIndex: 0,
    name: 'Loading, Error, and Empty States',
    description:
      'Handles loading, error, and empty states explicitly as a discriminated union state machine.',
  },
  {
    category: 'Error Handling',
    categoryRoute: '/error-handling',
    recipeIndex: 1,
    name: 'Error Boundary',
    description:
      'A class component that catches render-time exceptions and shows a fallback UI.',
  },
  {
    category: 'Error Handling',
    categoryRoute: '/error-handling',
    recipeIndex: 2,
    name: 'GraphQL Errors',
    description:
      'Executes a query that intentionally requests a nonexistent field to trigger a GraphQL error.',
  },

  // Styling
  {
    category: 'Styling',
    categoryRoute: '/styling',
    recipeIndex: 0,
    name: 'Account Card — SLDS Blueprint',
    description:
      'Account card built with SLDS blueprint classes.',
  },
  {
    category: 'Styling',
    categoryRoute: '/styling',
    recipeIndex: 1,
    name: 'Account Card — SLDS React',
    description:
      'Account data rendered with the Card component from design-system-react.',
  },
  {
    category: 'Styling',
    categoryRoute: '/styling',
    recipeIndex: 2,
    name: 'Account Card — shadcn/ui',
    description:
      'Account card built with shadcn/ui Card + Tailwind CSS.',
  },
  {
    category: 'Styling',
    categoryRoute: '/styling',
    recipeIndex: 3,
    name: 'Icons — SLDS Blueprint',
    description:
      'SLDS icons via SVG sprite references — utility, standard, and action categories.',
  },
  {
    category: 'Styling',
    categoryRoute: '/styling',
    recipeIndex: 4,
    name: 'Icons — SLDS React',
    description:
      'SLDS icons rendered via the Icon component from design-system-react.',
  },
  {
    category: 'Styling',
    categoryRoute: '/styling',
    recipeIndex: 5,
    name: 'Icons — Lucide',
    description:
      'Lucide icons as individual React components — stroke-based, tree-shakeable, and fully typed.',
  },
  {
    category: 'Styling',
    categoryRoute: '/styling',
    recipeIndex: 6,
    name: 'Button — SLDS Blueprint',
    description:
      'All standard SLDS button variants using slds-button classes.',
  },
  {
    category: 'Styling',
    categoryRoute: '/styling',
    recipeIndex: 7,
    name: 'Button — SLDS React',
    description:
      'Button variants via the Button component from design-system-react.',
  },
  {
    category: 'Styling',
    categoryRoute: '/styling',
    recipeIndex: 8,
    name: 'Button — shadcn/ui',
    description:
      'shadcn/ui Button with all six variants, three sizes, and icon composition.',
  },

  // Routing
  {
    category: 'Routing',
    categoryRoute: '/routing',
    recipeIndex: 0,
    name: 'Link',
    description:
      "Client-side navigation with React Router's <Link> component.",
  },
  {
    category: 'Routing',
    categoryRoute: '/routing',
    recipeIndex: 1,
    name: 'NavLink',
    description:
      'NavLink knows whether its path matches the current URL for active styling.',
  },
  {
    category: 'Routing',
    categoryRoute: '/routing',
    recipeIndex: 2,
    name: 'Programmatic Navigation (useNavigate)',
    description:
      'useNavigate() returns an imperative navigate function for component logic.',
  },
  {
    category: 'Routing',
    categoryRoute: '/routing',
    recipeIndex: 3,
    name: 'Route Parameters',
    description:
      'An Account list links to a detail view using a dynamic route parameter.',
  },
  {
    category: 'Routing',
    categoryRoute: '/routing',
    recipeIndex: 4,
    name: 'Nested Routes',
    description:
      'A master-detail layout where the sidebar stays visible while a detail panel renders via Outlet.',
  },

  // Integration
  {
    category: 'Integration',
    categoryRoute: '/integration',
    recipeIndex: 0,
    name: 'Searchable Account List',
    description:
      'A controlled search input drives a GraphQL variable with debounce.',
  },
  {
    category: 'Integration',
    categoryRoute: '/integration',
    recipeIndex: 1,
    name: 'Dashboard with Aliased Queries',
    description:
      'Fetches Accounts, Contacts, and Opportunities in a single aliased GraphQL request.',
  },
];

/** Returns the number of recipes for a given category route (e.g. "/hello"). */
export function getRecipeCount(categoryRoute: string): number {
  return recipeRegistry.filter((r) => r.categoryRoute === categoryRoute).length;
}
