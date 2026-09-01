# Angular Recipes Catalog

Angular Recipes are self-contained examples that teach one concept at a time. Every recipe inlines its GraphQL queries, types, and SDK calls so you can read the whole pattern in one place. Each recipe is an Angular standalone component — open its folder in `src/app/recipes/` and the `.ts` (logic) and `.html` (template) hold everything you need.

## Recommended Learning Path

More categories are being ported from React Recipes over time. Available today:

1. **Hello** -- Angular fundamentals on Salesforce: template binding, conditional rendering, lists, inputs, outputs, signals, lifecycle
2. **Error Handling** -- Loading/error/empty states, containing failures without a render boundary, and GraphQL errors

## Full Recipe Table

| Category       | Recipe                           | Description                                                                                     |
| -------------- | -------------------------------- | ----------------------------------------------------------------------------------------------- |
| Hello          | Hello World                      | The simplest possible Salesforce web application component.                                     |
| Hello          | Binding to an Account Name       | Fetches an Account via UIAPI GraphQL and binds the Name field to the template.                  |
| Hello          | Conditional Rendering            | Fetches an Account and conditionally renders different UI based on the Industry picklist value. |
| Hello          | List Rendering (For Each)        | Fetches Accounts via GraphQL and renders them with the @for block.                              |
| Hello          | Lifecycle (Fetch on Mount)       | Fetches a Contact in ngOnInit with cleanup to prevent stale updates.                            |
| Hello          | Parent-to-Child (Inputs)         | The parent fetches Accounts via GraphQL and passes each one to a child component as inputs.     |
| Hello          | Child-to-Parent (Outputs)        | A child component presents an Industry selector and emits an output to its parent.              |
| Hello          | State Management (Shared State)  | Two sibling components share a selected Account by lifting state to their common parent.        |
| Error Handling | Loading, Error, and Empty States | Handles loading, error, and empty states explicitly with a discriminated-union signal.          |
| Error Handling | Error Boundary                   | Angular has no render boundary — guard the risky work and surface failures with a signal.       |
| Error Handling | GraphQL Errors                   | Reads query-level errors from result.errors[] and contrasts them with thrown exceptions.        |
