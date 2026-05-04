# React Recipes -- Developer & Agent Guide

This is a **Salesforce DX project** containing a **React app** that serves as a sample "recipes" repository -- like [lwc-recipes](https://github.com/trailheadapps/lwc-recipes) but for React on Salesforce.

**Goal:** Teach things a React developer doesn't know about Salesforce, and things a Salesforce developer doesn't know about React -- at the intersection.

**Non-goal:** Teach React fundamentals.

The full project plan lives in **PLAN.md**. This file covers what you need to know to contribute.

---

## Project Structure

```
multiframework-recipes/                     # Repository root (Salesforce DX project)
  sfdx-project.json                         # Salesforce DX config (API v66.0)
  package.json                              # Root -- SFDX scripts only, NOT the React app
  data/                                     # Sample data for sf data import tree (planned)
  force-app/main/default/                        # Shared metadata (objects, classes, etc.)
  force-app/main/react-recipes/
    uiBundles/reactRecipes/                        # <-- THE REACT APP (all work happens here)
      src/
        app.tsx                             # React entry: Router + providers
        appLayout.tsx                       # Shell: Navbar + <Outlet />
        routes.tsx                          # Route definitions (React Router 7)
        api/
          graphqlClient.ts                  # executeGraphQL wrapper
          graphql-operations-types.ts       # Generated types (from codegen)
          utils/
            query/                          # .graphql read queries
            mutation/                       # .graphql write mutations
        recipes/                            # Individual recipe components (planned)
          hello/
          read-data/
          modify-data/
          salesforce-apis/
          error-handling/
          routing/
          styling/
        components/
          app/                              # App shell components (Navbar, Layout, CodeBlock)
          recipe/                           # Shared recipe UI (Skeleton, ContactTile, etc.)
          ui/                               # shadcn/ui primitives
        pages/                              # Route pages -- containers that render recipes
        lib/                                # Utilities (cn, etc.)
        styles/                             # global.css, slds.css
        assets/                             # Icons, images
      scripts/
        get-graphql-schema.mjs              # GraphQL introspection from connected org
      codegen.yml                           # GraphQL codegen config
      ui-bundle.json                   # Salesforce routing (SPA fallback)
      reactRecipes.uibundle-meta.xml         # Salesforce metadata
      package.json                          # React app dependencies
      vite.config.ts                        # Vite 7 + Tailwind + Salesforce plugin
      tsconfig.json                         # TypeScript strict mode
      dist/                                 # Build output (deployed to Salesforce)
```

**Key point:** There are **two `package.json` files**. The root one is for SFDX metadata scripts. The one inside `reactRecipes/` is for the React app. Almost all work happens in the React app directory.

---

## Commands

All React app commands run from `force-app/main/react-recipes/uiBundles/reactRecipes/`:

```bash
cd force-app/main/react-recipes/uiBundles/reactRecipes

npm run start              # Vite dev server
npm run build              # tsc -b && vite build (MUST pass before finishing work)
npm run lint               # ESLint (MUST pass before finishing work)
npm run test               # Vitest
npm run graphql:schema     # Fetch GraphQL schema from connected org
npm run graphql:codegen    # Generate TypeScript types from .graphql files
```

### Deploying

From the **project root**:

```bash
# Build first
cd force-app/main/react-recipes/uiBundles/reactRecipes && npm i && npm run build && cd -

# Deploy to org
sf project deploy start --source-dir force-app/main/react-recipes/uiBundles/reactRecipes --target-org <alias>
```

### Seeding Sample Data

```bash
sf data import tree --plan data/data-plan.json --target-org <alias>
```

---

## Tech Stack

| Concern           | Tool                                                                |
| ----------------- | ------------------------------------------------------------------- |
| Framework         | React 19                                                            |
| Routing           | React Router 7 (`react-router`, not `react-router-dom`)             |
| Build             | Vite 7 + `@salesforce/vite-plugin-ui-bundle`                        |
| App shell styling | Tailwind CSS 4 + shadcn/ui                                          |
| SLDS styling      | `@salesforce-ux/design-system` 2.29.0 (CSS classes on JSX)          |
| Data (GraphQL)    | `executeGraphQL` via `@salesforce/sdk-data`                         |
| Data (REST)       | `await createDataSDK()` then `.fetch()` from `@salesforce/sdk-data` |
| GraphQL types     | codegen via `codegen.yml`                                           |
| Testing           | Vitest + Testing Library + Playwright                               |
| Linting           | ESLint 9 flat config                                                |
| Formatting        | Prettier (semi, singleQuote, printWidth 80)                         |

### Path Aliases

Defined in both `vite.config.ts` and `tsconfig.json`:

- `@/` = `src/`
- `@api/` = `src/api/`
- `@components/` = `src/components/`
- `@utils/` = `src/utils/`
- `@styles/` = `src/styles/`
- `@assets/` = `src/assets/`

---

## Salesforce Data Access

### GraphQL (preferred)

The wrapper lives at `src/api/graphqlClient.ts` and uses `createDataSDK()` from `@salesforce/sdk-data`:

```typescript
import { createDataSDK } from "@salesforce/sdk-data";

export async function executeGraphQL({
  query,
  variables
}: {
  query: string;
  variables?: Record<string, unknown>;
}) {
  const sdk = await createDataSDK();
  const response = await sdk.graphql?.({ query, variables });
  // ... error handling, returns response.data
}
```

### GraphQL Workflow

Two patterns for defining queries:

**Pattern 1: External `.graphql` file (recommended for most recipes)**

```
src/api/utils/query/singleAccountQuery.graphql   # Query definition
src/api/graphql-operations-types.ts               # Generated types (from codegen)
src/api/utils/accounts.ts                         # Utility function
src/recipes/read-data/SingleRecord.tsx          # Recipe component
```

```typescript
// Import query as raw string, import generated types
import QUERY from "./query/singleAccountQuery.graphql?raw";
import type {
  SingleAccountQuery,
  SingleAccountQueryVariables
} from "../graphql-operations-types";
import { executeGraphQL } from "../graphqlClient";
```

**Pattern 2: Inline with `gql` tag (for simple queries)**

```typescript
import { gql } from "../api/graphqlClient";
const MY_QUERY = gql`query { ... }`;
```

### UIAPI Response Shape

All Salesforce GraphQL responses follow this structure -- every field is wrapped in `{ value }`:

```typescript
// Fields: { value: T | null }
account.Name.value; // "Acme Corp"
account.Industry.value; // "Technology"

// Connections: edges/node pattern
response.uiapi.query.Account.edges?.map((edge) => edge?.node);
```

### REST APIs

```typescript
import { createDataSDK } from "@salesforce/sdk-data";

const sdk = await createDataSDK();
const response = await sdk.fetch("/services/data/v66.0/ui-api/records/001...");
```

### Schema & Codegen

- `schema.graphql` is **generated from a connected org**, not committed to the repo
- Generate it: `npm run graphql:schema` (runs `scripts/get-graphql-schema.mjs`)
- Then generate types: `npm run graphql:codegen` (reads `codegen.yml`)
- Generated types land in `src/api/graphql-operations-types.ts`
- `codegen.yml` includes full UIAPI scalar mappings (Currency, Date, Picklist, etc.)

---

## Recipe Conventions

### What is a recipe?

A self-contained component that demonstrates one concept at the intersection of React and Salesforce. Each recipe should be understandable in isolation.

### File organization

- **Recipes** live in `src/recipes/<category>/RecipeName.tsx`
- **Pages** are containers (`src/pages/<Category>.tsx`) that import and render recipes in a grid
- **GraphQL files** live in `src/api/utils/query/` or `src/api/utils/mutation/`

### Adding a new recipe

1. Create the recipe component in `src/recipes/<category>/RecipeName.tsx`
2. If it needs GraphQL: add `.graphql` file, run `npm run graphql:codegen`, create utility function in `src/api/utils/`
3. Import the recipe into the appropriate page in `src/pages/<Category>.tsx`
4. Comment Salesforce-specific concepts, not React basics
5. Run `npm run build && npm run lint` -- both must pass

### Naming

- Recipe files: **PascalCase** (`SingleRecord.tsx`)
- GraphQL files: **camelCase** (`singleAccountQuery.graphql`)
- Hooks: **camelCase** with `use` prefix (`useAuth.ts`)

### Recipe template

```tsx
/**
 * Recipe 2.1: Single Record
 *
 * Queries a single Account by ID and displays its fields.
 * Demonstrates: .graphql file -> codegen types -> executeGraphQL -> component.
 */
export default function SingleRecord() {
  // ... implementation
}
```

---

## Recipe Code Style

Recipe code is optimized for **reading**, not authoring. A developer skimming the file should hit the interesting code first.

### File-level comment

Title line + 1–2 sentences max. No bullet lists.

```tsx
/**
 * Recipe 2.1: Single Record
 *
 * Queries a single Account by ID using executeGraphQL.
 * Demonstrates the .graphql file -> codegen -> component pattern.
 */
```

### Inline comments

Keep brief. Explain Salesforce-specific concepts, not React basics.

### Component ordering: most relevant code first

The default-exported recipe component goes **at the top** of the file. Helper sub-components are placed **below** it. This is the opposite of typical "define before use" style, but better for a reading-first codebase.

### Break complex JSX into named sub-components

Loading skeletons, error states, cards, and list items should be their own components within the file, placed below the main component.

- Exception: recipes specifically _about_ UI (hello, styling) can inline more.
- Heuristic: if you're writing a JSX comment like `{/* Column headers */}`, it should probably be a named component instead.

### Extract reused UI to `components/recipe/`

If the same UI pattern appears across multiple non-UI recipes, extract it to `src/components/recipe/` so each recipe stays focused on its lesson. Existing examples: `Skeleton`, `ContactTile`, `Paginator`, `RecipeCard`, `SLDSCard`.

---

## Routing

Routes are defined in `src/routes.tsx` using React Router 7. Each route uses a `handle` property for navigation metadata:

```typescript
{
  path: 'read-data',
  element: <ReadData />,
  handle: { showInNavigation: true, label: 'Read Data' },
}
```

The Navbar in `appLayout.tsx` dynamically renders routes where `handle.showInNavigation === true`.

Current routes: `/hello`, `/read-data`, `/modify-data`, `/authentication`, `/error-handling`, `/styling`, and `/*` fallback.

---

## Styling

The app uses **three styling approaches** (recipes demonstrate all three):

1. **Tailwind + shadcn/ui** -- Used for the app shell. Import from `@/components/ui/...`.
2. **SLDS CSS blueprints** -- `@salesforce-ux/design-system` classes applied to JSX (`slds-card`, `slds-table`, etc.)
3. **SLDS React Components** -- From [design-system-react](https://github.com/salesforce/design-system-react). Note: pins an older SLDS CSS version.

Global styles: `src/styles/global.css` (Tailwind + CSS variables), `src/styles/slds.css` (SLDS imports).

---

## Salesforce Metadata

- **`ui-bundle.json`**: Output dir `dist/`, SPA fallback routing, trailing slash `never`
- **`reactRecipes.uibundle-meta.xml`**: Metadata definition (v1, isActive)
- **`sfdx-project.json`**: Package dir `force-app`, API version 66.0
- Only one UI bundle can be deployed per metadata push

---

## Important Context

- This is a **B2E (Business-to-Employee)** app -- users are already authenticated via Salesforce login. No client-side auth needed.
- B2C auth patterns are **deferred** to a future phase.
- The `.a4drules/` directory (generic template rules from Salesforce CLI scaffolding) was removed. Relevant guidance has been consolidated into this file.
- `schema.graphql` must be generated from a connected org -- scratch org support is uncertain.

---

## ⚠️ Critical Rule: Recipe Code ≠ Production Code

This is a learning app. Every recipe must be **self-contained and readable top-to-bottom**. The reader should never need to open another file to understand the lesson.

**INLINE the thing the recipe teaches.** If a recipe is about GraphQL queries, the query must be visible in the recipe file — not hidden in `src/api/`. If a recipe is about mutations, the mutation must be visible.

**DO NOT** abstract queries, mutations, types, or SDK calls into shared utility files and import them into recipes. The `src/api/` folder exists for the app shell and shared infrastructure, not for recipe-specific data access.

**Exception:** Recipes later in a category may reference patterns taught in earlier recipes (e.g., "See the Single Record recipe for the basic query pattern"). But the code they add on top must be inline.

This rule overrides the "GraphQL Workflow" section above. The recommended pattern for recipes is **inline with `gql` tag**, not external `.graphql` files.

---

## Recipe File Structure (top to bottom)

```
1. File header comment (title, what it demonstrates, related recipes)
2. Imports (SDK, React hooks)
3. GraphQL query/mutation string (inline, not imported)
4. Type definitions (explicit, not inferred from utility return types)
5. Default export: the recipe component
6. Helper sub-components (below the main export)
```

This ordering is mandatory for recipes. The reader should hit the GraphQL query before the component, so they understand the data shape before seeing how it's rendered.

---

## Recipe Anti-Patterns (DO NOT USE)

### ❌ Importing queries/mutations from src/api/

```tsx
// BAD — hides the lesson
import { getContacts } from "@/api/contacts";
import { deleteAccount } from "@/api/mutations";
```

```tsx
// GOOD — the query is visible
import { createDataSDK, gql } from "@salesforce/sdk-data";

const QUERY = gql`
  query SingleContact {
    uiapi {
      query {
        Contact(first: 1) {
          edges {
            node {
              Id
              Name {
                value
              }
            }
          }
        }
      }
    }
  }
`;
```

### ❌ Complex inferred types

```tsx
// BAD — unreadable
const [contact, setContact] =
  useState<Awaited<ReturnType<typeof getContacts>>[number]>();

type AccountNode = NonNullable<NonNullable<NonNullable<...>>>;
```

```tsx
// GOOD — explicit and clear
interface ContactFields {
  id: string;
  name: string;
  title: string | null;
  phone: string | null;
}

const [contact, setContact] = useState<ContactFields>();
```

### ❌ Type casts for errors

```tsx
// BAD — tells TypeScript to shut up
.catch(err => setError((err as Error).message))
```

```tsx
// GOOD — tells the reader what's happening
.catch(err => {
  setError(err instanceof Error ? err.message : "Request failed");
})
```

### ❌ Importing formatting utilities

```tsx
// BAD — reader wonders what formatPhone does
import { formatPhone } from "@/utils/formatPhone";
<a href={`tel:${value}`}>{formatPhone(value)}</a>;
```

```tsx
// GOOD — just render the value
<a href={`tel:${phone}`}>{phone}</a>
```

### ❌ Mixing styling systems

```tsx
// BAD — SLDS + Tailwind in same component
<div className="flex items-center gap-4">          {/* Tailwind */}
<button className="slds-button slds-button_brand"> {/* SLDS */}
```

```tsx
// GOOD — pick one system per recipe
// Data recipes use SLDS throughout
<div className="slds-grid slds-grid_vertical-align-center">
<button className="slds-button slds-button_brand">
```

### ❌ Debug code left in recipes

```tsx
// BAD
createDataSDK().then((sdk) => console.log(`sdk: ${JSON.stringify(sdk)}`));
```

Delete it.

### ❌ Hello recipes that teach pure React

```tsx
// BAD — works identically outside Salesforce
export default function DataBinding() {
  const [count, setCount] = useState(0);
  return <p>Count: {count}</p>;
}
```

```tsx
// GOOD — grounded in the platform
export default function BindingAccountName() {
  // Fetches an Account via GraphQL, binds Name to UI
  // Introduces the { value } wrapper unique to Salesforce GraphQL
}
```

Every Hello recipe must involve the Salesforce platform. If it would work identically outside Salesforce, it belongs in a React tutorial, not here.

---

## Recipe Commenting Rules

- **DO** comment platform-specific behavior: `{ value }` wrappers, `edges/node` pattern, `__r` traversal, mutation input shapes
- **DO NOT** comment standard React patterns (useState, useEffect, JSX)
- **DO NOT** leave debug code (console.log, SDK inspection calls)

---

## Recipe Verification Checklist

Before completing any recipe task:

- [ ] The query/mutation is **inline in the recipe file**, not imported from `src/api/`
- [ ] Types are **explicit interfaces**, not `Awaited<ReturnType<...>>` or `NonNullable<...>` chains
- [ ] Errors use `err instanceof Error`, not `(err as Error)`
- [ ] No `formatPhone` or other utility imports
- [ ] No `console.log` or debug code
- [ ] One styling system per recipe (SLDS for data recipes)
- [ ] Hello recipes involve the Salesforce platform
- [ ] `npm run build` passes
- [ ] `npm run lint` passes
