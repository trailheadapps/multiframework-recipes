# Angular Recipes

![Angular Recipes](angular-recipes.webp)

A Salesforce UI Bundle demonstrating how to build an Angular app that runs directly on the Salesforce platform. The bundle is built with the Angular CLI (esbuild) + TypeScript and deployed to the org as a single artifact; Salesforce serves the static assets.

The same bundle also serves the Micro-Frontend **guest** views: chromeless `/embedding/*` routes (plus an `/embedding` catalog, linked as **Micro-Frontends** in the nav) that render outside the app shell and exchange state and events with `<lightning-ui-embedding>` through `@salesforce/platform-sdk`. The LWC hosts that embed them live in [Micro-Frontend Recipes](../microfrontend-recipes).

**Use when:** you want a single-team workflow, zero external infrastructure, and deep integration with Salesforce's security/identity model.

> To install and deploy, follow [Setting up a Scratch Org](../../../README.md#setting-up-a-scratch-org) in the root README — it deploys every recipe app together. Unless noted, run the commands below from the repository root.

## Local Development

Start the development server with hot reload:

```bash
npm run dev:angular
```

Build the app for production:

```bash
npm run build
```

## Testing

Run unit tests ([Vitest](https://vitest.dev/) + [Angular TestBed](https://angular.dev/guide/testing)):

```bash
npm run test:angular
```

Run with coverage:

```bash
npm run test:coverage:angular
```

Run end-to-end tests ([Playwright](https://playwright.dev/)):

```bash
cd force-app/main/angular-recipes/uiBundles/angularRecipes
npx playwright install chromium
npm run build:e2e
npm run e2e
```
