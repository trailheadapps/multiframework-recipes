# Angular Recipes

![Angular Recipes](angular-recipes.webp)

A Salesforce UI Bundle demonstrating how to build an Angular app that runs directly on the Salesforce platform. The bundle is built with the Angular CLI (esbuild) + TypeScript and deployed to the org as a single artifact; Salesforce serves the static assets.

> [!IMPORTANT]
> **Preview — in active development.** Angular Recipes is being built toward feature parity with React Recipes and currently includes only a subset of the recipes, with more categories added over time. Because it's still a work in progress, it's excluded from the standard deploy via the root [`.forceignore`](../../../.forceignore), so `sf project deploy start` ships **React Recipes only**. To try Angular Recipes in an org, follow the steps below — they include temporarily removing the force-ignore entry.

```mermaid
graph LR
    A[Framework App<br/>Angular CLI + TypeScript] -->|Build| B[UI Bundle]
    B -->|Deploy| C[Salesforce Org]
    C -->|Query| D[GraphQL UIAPI]
    C -->|Fetch| E[REST APIs]
```

**Use when:** you want a single-team workflow, zero external infrastructure, and deep integration with Salesforce's security/identity model.

> Check the [prerequisites](../../../README.md#prerequisites) in the root README before starting.

## Set Up an Org

Pick one path.

### Scratch org

1. Authorize your Dev Hub (alias **myhuborg**):

   ```bash
   sf org login web -d -a myhuborg
   ```

1. Clone this repository:

   ```bash
   git clone https://github.com/trailheadapps/multiframework-recipes
   cd multiframework-recipes
   ```

1. Create a scratch org (alias **recipes**):

   ```bash
   sf org create scratch -d -f config/project-scratch-def.json -a recipes
   ```

### Sandbox

1. Authorize your Sandbox (alias **mysandbox**):

   ```bash
   sf org login web -a mysandbox -r https://test.salesforce.com
   ```

1. Clone this repository:

   ```bash
   git clone https://github.com/trailheadapps/multiframework-recipes
   cd multiframework-recipes
   ```

### Developer Edition

Developer Edition support is coming soon.

## Install & Deploy

Angular Recipes is in preview and force-ignored, so it is skipped by the standard deploy. The steps below opt it in for an org. The permission set that grants access to the app references the UI Bundle metadata, so the app must be deployed to the org before the permset can be assigned.

1. Install dependencies:

   ```bash
   cd force-app/main/angular-recipes/uiBundles/angularRecipes
   npm install
   ```

1. Build the app:

   ```bash
   npm run build
   ```

1. Return to the repository root:

   ```bash
   cd ../../../../..
   ```

1. Opt Angular Recipes into the deploy by removing (or commenting out) its entry in the root `.forceignore`:

   ```bash
   # In .forceignore, remove the line: force-app/main/angular-recipes/**
   ```

1. Deploy the project to your org:

   ```bash
   sf project deploy start
   ```

1. Assign the **Angular Recipes** permission set to the default user:

   ```bash
   sf org assign permset -n angularRecipes
   ```

1. Import sample data:

   ```bash
   sf data tree import -p ./data/data-plan.json
   ```

1. Open the org and select the **Angular Recipes** app in App Launcher:

   ```bash
   sf org open
   ```

## Local Development

All commands run from `force-app/main/angular-recipes/uiBundles/angularRecipes`.

Start the Angular development server (`sf-angular-serve`) with hot reload:

```bash
npm run dev
```

Build the app for production:

```bash
npm run build
```

## Testing

Run unit tests ([Vitest](https://vitest.dev/) + [Angular TestBed](https://angular.dev/guide/testing)):

```bash
npm test
```

Run end-to-end tests ([Playwright](https://playwright.dev/)):

```bash
npx playwright install chromium
npm run build:e2e
npm run e2e
```
