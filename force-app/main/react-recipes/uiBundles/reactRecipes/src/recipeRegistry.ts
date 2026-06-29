/**
 * Central registry of all recipes, keyed by category route.
 *
 * Each recipe has one or more flavors — a (hosting, framework) pair plus
 * optional flavor-specific source imports. The first flavor is the default
 * shown to users; "(soon)" UI states reference flavors that are not yet built.
 */

export type Hosting = 'salesforce-hosted' | 'externally-hosted';
export type Framework = 'react' | 'vue' | 'angular';

export interface RecipeFlavor {
  hosting: Hosting;
  framework: Framework;
  /** Source-file imports for code tabs. Shape varies by category; empty when not yet wired. */
  sources?: Record<string, string>;
  /** Optional flavor-specific description override. */
  notes?: string;
}

export interface RecipeEntry {
  /** Stable ID, kebab-case, unique within a category. e.g. "basic-embed" */
  id: string;
  name: string;
  description: string;
  category: string;
  categoryRoute: string;
  /** Zero-based index of this recipe within its category page. */
  recipeIndex: number;
  /** At least one. flavors[0] is the default. */
  flavors: RecipeFlavor[];
}

const CATEGORY_DEFAULTS: Record<string, { hosting: Hosting; framework: Framework }> = {
  '/hello': { hosting: 'salesforce-hosted', framework: 'react' },
  '/read-data': { hosting: 'salesforce-hosted', framework: 'react' },
  '/modify-data': { hosting: 'salesforce-hosted', framework: 'react' },
  '/salesforce-apis': { hosting: 'salesforce-hosted', framework: 'react' },
  '/error-handling': { hosting: 'salesforce-hosted', framework: 'react' },
  '/styling': { hosting: 'salesforce-hosted', framework: 'react' },
  '/routing': { hosting: 'salesforce-hosted', framework: 'react' },
  '/integration': { hosting: 'salesforce-hosted', framework: 'react' },
  '/embedding': { hosting: 'externally-hosted', framework: 'react' },
};

interface RawRecipeEntry {
  category: string;
  categoryRoute: string;
  recipeIndex: number;
  name: string;
  description: string;
  id?: string;
  flavors?: RecipeFlavor[];
}

const rawRecipes: RawRecipeEntry[] = [
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

  // MFE
  {
    category: 'Embedding',
    categoryRoute: '/embedding',
    recipeIndex: 0,
    name: 'Basic Embed',
    description:
      'Minimum viable lwc-shell embed. Creates the shell imperatively, sets src and sandbox, and handles widget-ready.',
  },
  {
    category: 'Embedding',
    categoryRoute: '/embedding',
    recipeIndex: 1,
    name: 'Receive Data',
    description:
      'Pushes data from the LWC host into the MFE via shell.updateData(). The MFE receives it with bridge.addEventListener(\'data\', handler).',
  },
  {
    category: 'Embedding',
    categoryRoute: '/embedding',
    recipeIndex: 2,
    name: 'Send Event',
    description:
      'The MFE dispatches custom events to the LWC host via bridge.dispatchEvent(). The host catches them on the shell element.',
  },
  {
    category: 'Embedding',
    categoryRoute: '/embedding',
    recipeIndex: 3,
    name: 'Auto-Resize',
    description:
      'The iframe height adjusts automatically as MFE content grows or shrinks via a ResizeObserver inside the iframe.',
  },
  {
    category: 'Embedding',
    categoryRoute: '/embedding',
    recipeIndex: 4,
    name: 'Theme Tokens',
    description:
      'Salesforce CSS custom properties are sent to the MFE on connect and re-synced on demand via shell.refreshTheme().',
  },
  {
    category: 'Embedding',
    categoryRoute: '/embedding',
    recipeIndex: 5,
    name: 'Dirty State',
    description:
      'The MFE notifies the host of unsaved changes via trackdirtystate events so the host can block navigation.',
  },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildRegistry(): RecipeEntry[] {
  return rawRecipes.map((entry) => {
    const flavors: RecipeFlavor[] =
      entry.flavors ??
      (() => {
        const defaults = CATEGORY_DEFAULTS[entry.categoryRoute];
        if (!defaults) {
          throw new Error(
            `Recipe "${entry.name}" in "${entry.categoryRoute}" has no category default and no explicit flavors.`
          );
        }
        return [{ hosting: defaults.hosting, framework: defaults.framework }];
      })();

    if (flavors.length === 0) {
      throw new Error(
        `Recipe "${entry.name}" in "${entry.categoryRoute}" must have at least one flavor.`
      );
    }

    // Validate (hosting, framework) pairs are unique within a recipe.
    const seen = new Set<string>();
    for (const f of flavors) {
      const key = `${f.hosting}|${f.framework}`;
      if (seen.has(key)) {
        throw new Error(
          `Recipe "${entry.name}" has duplicate flavor (${f.hosting}, ${f.framework}).`
        );
      }
      seen.add(key);
    }

    return {
      id: entry.id ?? slugify(entry.name),
      name: entry.name,
      description: entry.description,
      category: entry.category,
      categoryRoute: entry.categoryRoute,
      recipeIndex: entry.recipeIndex,
      flavors,
    };
  });
}

export const recipeRegistry: RecipeEntry[] = buildRegistry();

/** Returns the number of recipes for a given category route (e.g. "/hello"). */
export function getRecipeCount(categoryRoute: string): number {
  return recipeRegistry.filter((r) => r.categoryRoute === categoryRoute).length;
}

/** Returns the default hosting for a category, or undefined if the category is unknown. */
export function getCategoryHosting(categoryRoute: string): Hosting | undefined {
  return CATEGORY_DEFAULTS[categoryRoute]?.hosting;
}

/** Returns the default framework for a category, or undefined if the category is unknown. */
export function getCategoryFramework(categoryRoute: string): Framework | undefined {
  return CATEGORY_DEFAULTS[categoryRoute]?.framework;
}

/** Look up a recipe by category route + id. */
export function getRecipe(categoryRoute: string, id: string): RecipeEntry | undefined {
  return recipeRegistry.find(
    (r) => r.categoryRoute === categoryRoute && r.id === id
  );
}

/** List recipes, optionally narrowed to those that have at least one matching flavor. */
export function listRecipes(filter?: {
  hosting?: Hosting;
  framework?: Framework;
}): RecipeEntry[] {
  if (!filter || (!filter.hosting && !filter.framework)) return recipeRegistry;
  return recipeRegistry.filter((r) =>
    r.flavors.some(
      (f) =>
        (!filter.hosting || f.hosting === filter.hosting) &&
        (!filter.framework || f.framework === filter.framework)
    )
  );
}

/** True if the recipe declares a flavor exactly matching (hosting, framework). */
export function hasFlavor(
  recipe: RecipeEntry,
  hosting: Hosting,
  framework: Framework
): boolean {
  return recipe.flavors.some(
    (f) => f.hosting === hosting && f.framework === framework
  );
}

/**
 * Resolve the best-matching flavor for the requested (hosting, framework).
 * Fallback order: exact match → hosting only → framework only → flavors[0].
 * Callers that care which axis matched should compare the returned flavor's
 * fields to what they requested.
 */
export function resolveFlavor(
  recipe: RecipeEntry,
  hosting?: Hosting,
  framework?: Framework
): RecipeFlavor {
  if (hosting && framework) {
    const exact = recipe.flavors.find(
      (f) => f.hosting === hosting && f.framework === framework
    );
    if (exact) return exact;
  }
  if (hosting) {
    const byHosting = recipe.flavors.find((f) => f.hosting === hosting);
    if (byHosting) return byHosting;
  }
  if (framework) {
    const byFramework = recipe.flavors.find((f) => f.framework === framework);
    if (byFramework) return byFramework;
  }
  return recipe.flavors[0];
}
