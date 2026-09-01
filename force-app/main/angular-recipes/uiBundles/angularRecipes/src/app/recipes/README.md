# Angular Recipes Catalog

Angular Recipes are self-contained examples that teach one concept at a time. Every recipe inlines its GraphQL queries, types, and SDK calls so you can read the whole pattern in one place. Each recipe is an Angular standalone component — open its folder in `src/app/recipes/` and the `.ts` (logic) and `.html` (template) hold everything you need.

## Recommended Learning Path

More categories are being ported from React Recipes over time. Available today:

1. **Hello** -- Angular fundamentals on Salesforce: template binding, conditional rendering, lists, inputs, outputs, signals, lifecycle
2. **Read Data** -- UIAPI GraphQL queries: single record, lists, filtering, sorting, cursor pagination, related records, aliases, imperative refetch

## Full Recipe Table

| Category  | Recipe                          | Description                                                                                     |
| --------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| Hello     | Hello World                     | The simplest possible Salesforce web application component.                                     |
| Hello     | Binding to an Account Name      | Fetches an Account via UIAPI GraphQL and binds the Name field to the template.                  |
| Hello     | Conditional Rendering           | Fetches an Account and conditionally renders different UI based on the Industry picklist value. |
| Hello     | List Rendering (For Each)       | Fetches Accounts via GraphQL and renders them with the @for block.                              |
| Hello     | Lifecycle (Fetch on Mount)      | Fetches a Contact in ngOnInit with cleanup to prevent stale updates.                            |
| Hello     | Parent-to-Child (Inputs)        | The parent fetches Accounts via GraphQL and passes each one to a child component as inputs.     |
| Hello     | Child-to-Parent (Outputs)       | A child component presents an Industry selector and emits an output to its parent.              |
| Hello     | State Management (Shared State) | Two sibling components share a selected Account by lifting state to their common parent.        |
| Read Data | Single Record                   | Queries a single Contact via UIAPI GraphQL and displays its fields.                             |
| Read Data | List of Records                 | Queries multiple Contacts and renders each one from the Relay edges[].node shape.               |
| Read Data | Filtered List with Variables    | Queries Contacts by name using a debounced GraphQL variable bound to an input.                  |
| Read Data | Sorted Results                  | Fetches Contacts with an orderBy rebuilt from signals whenever the sort changes.                |
| Read Data | Paginated List                  | Fetches Contacts two at a time using Relay cursor pagination (first / after).                   |
| Read Data | Related Records                 | Queries Contacts with their parent Account in one request, traversing a lookup relationship.    |
| Read Data | Aliased Multi-Object Query      | Queries Accounts and Contacts in a single request using GraphQL aliases.                        |
| Read Data | Imperative Refetch              | Displays a Contact list with a Refresh button that re-runs the query on demand.                 |
