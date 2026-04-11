# React Recipes Catalog

React Recipes are self-contained, single-file examples that teach one concept at a time. Every recipe inlines its GraphQL queries, mutations, types, and SDK calls so you can read the entire pattern without jumping between files. Open any `.tsx` file in `src/recipes/` and everything you need is right there.

## Recommended Learning Path

Work through the categories in this order. Each builds on concepts from the previous one.

1. **Hello** -- React fundamentals on Salesforce: JSX binding, conditional rendering, lists, props, callbacks, state, lifecycle
2. **Read Data** -- GraphQL UIAPI queries: single record, lists, filtering, sorting, pagination, related records, aliases
3. **Modify Data** -- GraphQL mutations: create, update, delete, combined query+mutation, error handling
4. **Error Handling** -- Loading/error/empty states, GraphQL errors, React error boundaries
5. **Salesforce APIs** -- Platform APIs beyond GraphQL: current user context, Connect API, Apex REST, UI API REST
6. **Routing** -- React Router in UI Bundles: Link, NavLink, route parameters, nested routes, programmatic navigation
7. **Styling** -- CSS approaches: SLDS utility classes, shadcn/ui + Tailwind, Design System React components
8. **Integration** -- End-to-end patterns combining multiple APIs and React features

## Full Recipe Table

| Category | Recipe | Description |
| --- | --- | --- |
| Hello | HelloWorld | The simplest possible Salesforce web application component -- a plain React function component. |
| Hello | BindingAccountName | Fetches an Account via UIAPI GraphQL and binds the Name field to the UI. |
| Hello | ConditionalStatus | Fetches an Account and conditionally renders different UI based on the Industry picklist value. |
| Hello | ListOfAccounts | Fetches Accounts via UIAPI GraphQL and renders them using .map(). Each item needs a stable key prop. |
| Hello | LifecycleFetch | Uses useEffect to fetch a Contact when the component mounts. A stale flag prevents state updates after unmount. |
| Hello | ParentToChild | The parent fetches Accounts via GraphQL and passes each one to a child component as props. |
| Hello | ChildToParent | A child component presents an Industry selector and calls a parent callback when the user picks a value. |
| Hello | StateManagement | Two sibling components share a selected Account by lifting state to their common parent. |
| Read Data | SingleRecord | Queries a single Contact via UIAPI GraphQL and displays its fields. |
| Read Data | ListOfRecords | Queries multiple Contacts via UIAPI GraphQL and renders each one using the Relay connection shape. |
| Read Data | FilteredList | Queries Contacts by name using a GraphQL variable bound to an input field. |
| Read Data | SortedResults | Fetches Contacts with an orderBy argument driven by component state. |
| Read Data | PaginatedList | Fetches two Contacts at a time using Relay cursor pagination (first / after). |
| Read Data | RelatedRecords | Queries Contacts with their parent Account in a single GraphQL request, traversing a lookup relationship. |
| Read Data | AliasedMultiObjectQuery | Queries Accounts and Contacts in a single GraphQL request using aliases. |
| Read Data | ImperativeRefetch | Displays a Contact list with a "Refresh" button that re-invokes the GraphQL query on demand. |
| Modify Data | CreateRecord | Creates a Salesforce Account via the AccountCreate UIAPI mutation on form submit. |
| Modify Data | UpdateRecord | Loads an Account and lets you edit Name and Industry via the AccountUpdate mutation. |
| Modify Data | DeleteRecord | Lists Accounts with a delete button per row. Confirming calls the AccountDelete mutation. |
| Modify Data | QueryMutationTogether | Lists Accounts with inline editing. Saving calls AccountUpdate and patches that row in local state. |
| Modify Data | ServerErrorHandling | Handles top-level GraphQL errors from a UIAPI mutation. |
| Error Handling | LoadingErrorEmpty | Every async component must handle loading, error, and empty states explicitly. |
| Error Handling | GraphqlErrors | Executes a query that intentionally requests a nonexistent field to trigger a GraphQL error. |
| Error Handling | ErrorBoundaryRecipe | An Error Boundary catches JavaScript errors thrown during rendering and displays a fallback UI. |
| Salesforce APIs | DisplayCurrentUser | Fetches the current user via the Chatter REST endpoint /users/me using DataSDK.fetch. |
| Salesforce APIs | ConnectApi | Calls the Chatter Connect API via DataSDK.fetch to fetch the current user's news feed. |
| Salesforce APIs | ApexRest | Calls a custom Apex REST endpoint to fetch Contacts via DataSDK.fetch. |
| Salesforce APIs | UiApiRest | Uses DataSDK.fetch with two UI API endpoints: list-ui and list-records. |
| Routing | LinkDemo | Client-side navigation with React Router's Link component. |
| Routing | NavLinkDemo | NavLink is a superset of Link that knows whether its path matches the current URL. |
| Routing | RouteParameters | An Account list links to a detail view using a dynamic route parameter (:accountId). |
| Routing | NestedRoutes | A master-detail layout where the sidebar stays visible while a detail panel renders via Outlet. |
| Routing | UseNavigate | useNavigate() returns an imperative navigate function for programmatic navigation. |
| Styling | ButtonSLDS | All standard SLDS button variants using slds-button classes applied directly to button elements. |
| Styling | ButtonShadcn | Button variants from shadcn/ui using Tailwind CSS and class-variance-authority. |
| Styling | ButtonDSR | Same variants as ButtonSLDS using the Button component from design-system-react. |
| Styling | AccountCardSLDS | Displays Account data using SLDS blueprint CSS classes on plain JSX markup. |
| Styling | AccountCardShadcn | Same Account data displayed using shadcn/ui Card components and Tailwind. |
| Styling | AccountCardDSR | Same Account data rendered with the Card component from design-system-react. |
| Styling | IconsSLDS | SLDS icons via SVG sprite sheet references. |
| Styling | IconsLucide | Lucide icons as individual React components, tree-shaken and stroke-based. |
| Styling | IconsDSR | Same icons as IconsSLDS via the Icon component from design-system-react. |
| Integration | SearchableAccountList | A controlled search input drives a GraphQL variable that filters Accounts by name with debounce. |
| Integration | DashboardAliasedQueries | Fetches Accounts, Contacts, and Opportunities in a single GraphQL request using aliases. |
