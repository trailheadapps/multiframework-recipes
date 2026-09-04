# Angular Recipes Catalog

Angular Recipes are self-contained examples that teach one concept at a time. Every recipe inlines its GraphQL queries, types, and SDK calls so you can read the whole pattern in one place. Each recipe is an Angular standalone component — open its folder in `src/app/recipes/` and the `.ts` (logic) and `.html` (template) hold everything you need.

## Recommended Learning Path

More categories are being ported from React Recipes over time. Available today:

1. **Hello** -- Angular fundamentals on Salesforce: template binding, conditional rendering, lists, inputs, outputs, signals, lifecycle
2. **Read Data** -- UIAPI GraphQL queries: single record, lists, filtering, sorting, cursor pagination, related records, aliases, imperative refetch
3. **Modify Data** -- UIAPI GraphQL mutations: create, update, delete, server-side error handling, and query + mutation together
4. **Salesforce APIs** -- REST beyond GraphQL via sdk.fetch: current user (Chatter), UI API REST, and custom Apex REST
5. **Integration** -- End-to-end patterns: debounced searchable list and an aliased multi-object dashboard
6. **Error Handling** -- Loading/error/empty states, containing failures without a render boundary, and GraphQL errors
7. **Styling** -- Two systems side by side: SLDS blueprint classes and sprites, and the app's spartan-ng (Tailwind) components and Lucide icons
8. **Routing** -- Angular Router in a UI Bundle: routerLink, active links, programmatic navigation, route parameters, and nested routes

## Full Recipe Table

| Category        | Recipe                           | Description                                                                                     |
| --------------- | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| Hello           | Hello World                      | The simplest possible Salesforce web application component.                                     |
| Hello           | Binding to an Account Name       | Fetches an Account via UIAPI GraphQL and binds the Name field to the template.                  |
| Hello           | Conditional Rendering            | Fetches an Account and conditionally renders different UI based on the Industry picklist value. |
| Hello           | List Rendering (For Each)        | Fetches Accounts via GraphQL and renders them with the @for block.                              |
| Hello           | Lifecycle (Fetch on Mount)       | Fetches a Contact in ngOnInit with cleanup to prevent stale updates.                            |
| Hello           | Parent-to-Child (Inputs)         | The parent fetches Accounts via GraphQL and passes each one to a child component as inputs.     |
| Hello           | Child-to-Parent (Outputs)        | A child component presents an Industry selector and emits an output to its parent.              |
| Hello           | State Management (Shared State)  | Two sibling components share a selected Account by lifting state to their common parent.        |
| Read Data       | Single Record                    | Queries a single Contact via UIAPI GraphQL and displays its fields.                             |
| Read Data       | List of Records                  | Queries multiple Contacts and renders each one from the Relay edges[].node shape.               |
| Read Data       | Filtered List with Variables     | Queries Contacts by name using a debounced GraphQL variable bound to an input.                  |
| Read Data       | Sorted Results                   | Fetches Contacts with an orderBy rebuilt from signals whenever the sort changes.                |
| Read Data       | Paginated List                   | Fetches Contacts two at a time using Relay cursor pagination (first / after).                   |
| Read Data       | Related Records                  | Queries Contacts with their parent Account in one request, traversing a lookup relationship.    |
| Read Data       | Aliased Multi-Object Query       | Queries Accounts and Contacts in a single request using GraphQL aliases.                        |
| Read Data       | Imperative Refetch               | Displays a Contact list with a Refresh button that re-runs the query on demand.                 |
| Modify Data     | Create a Record                  | Creates an Account via the AccountCreate UIAPI mutation on form submit.                         |
| Modify Data     | Update a Record                  | Loads an Account and edits Name and Industry via the AccountUpdate mutation.                    |
| Modify Data     | Delete a Record                  | Deletes an Account with a per-row confirm and removes the row from local state.                 |
| Modify Data     | Server-Side Error Handling       | Surfaces a top-level GraphQL error from a mutation missing a required field.                    |
| Modify Data     | Query + Mutation Together        | Inline-edits a list row and patches it from the AccountUpdate response.                         |
| Salesforce APIs | Display Current User             | Fetches the current user from the Chatter REST /users/me endpoint via sdk.fetch.                |
| Salesforce APIs | UI API (REST)                    | Uses the UI API list-ui and list-records REST endpoints to load a list view.                    |
| Salesforce APIs | Apex REST                        | Calls a custom Apex REST endpoint (ContactsResource) that returns plain JSON.                   |
| Integration     | Searchable Account List          | A debounced search input drives a GraphQL variable filtering Accounts by name.                  |
| Integration     | Dashboard with Aliased Queries   | Fetches Accounts, Contacts, and Opportunities in one aliased request as stat cards.             |
| Error Handling  | Loading, Error, and Empty States | Handles loading, error, and empty states explicitly with a discriminated-union signal.          |
| Error Handling  | Error Boundary                   | Angular has no render boundary — guard the risky work and surface failures with a signal.       |
| Error Handling  | GraphQL Errors                   | Reads query-level errors from result.errors[] and contrasts them with thrown exceptions.        |
| Styling         | Account Card (SLDS)              | Account data rendered with SLDS blueprint card classes on plain markup.                         |
| Styling         | Account Card (spartan-ng)        | The same Account data rendered with the app's spartan-ng card components.                       |
| Styling         | Icons (SLDS)                     | SLDS icons referenced from SVG sprite sheets (utility and standard).                            |
| Styling         | Icons (Lucide)                   | Lucide icons via @ng-icons as individual, tree-shakable ng-icon components.                     |
| Styling         | Button (SLDS)                    | Standard button variants as slds-button\_\* classes on plain buttons.                           |
| Styling         | Button (spartan-ng)              | The app shell's spartan-ng button — appearances, sizes, disabled, and icons.                    |
| Routing         | Link                             | Client-side navigation with the routerLink directive.                                           |
| Routing         | NavLink                          | Active-aware links with routerLinkActive and ariaCurrentWhenActive.                             |
| Routing         | Programmatic Navigation          | Imperative navigation with Router.navigate() after an action completes.                         |
| Routing         | Route Parameters                 | A :accountId detail route bound to a signal input via component input binding.                  |
| Routing         | Nested Routes                    | A master-detail layout with a router-outlet and a route-scoped store.                           |
