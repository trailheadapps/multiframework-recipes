# Multiframework Recipes README Ruleset

This document defines the standard structure and formatting for README files in this repository. There are two README types: the **root README** (project-level) and **per-app READMEs** (one per framework app).

## 1. Root README (`README.md`)

The root README covers shared setup and links to individual app READMEs. It must include these sections in order:

1. **Title** (`# Multiframework Recipes`)
2. **CI Badges** — CI and codecov badges
3. **Description** — 1-2 paragraphs explaining the project
4. **Learn more** — A short pointer to the Salesforce Multi-Framework developer guide. All frameworks (React, Angular, Micro-Frontend) are generally available and ship with the standard deploy; don't describe any of them as preview or work-in-progress.
5. **Table of Contents** (`## Table of Contents`)
6. **Multi-Framework Recipes** (`## Multi-Framework Recipes`) — Table with columns: App, Framework, README (link to per-app README)
7. **Micro-Frontend Recipes** (`## Micro-Frontend Recipes`) — Short description plus a link to its **Running the guest server** section
8. **Prerequisites** (`## Prerequisites`) — Environment setup, Node version, Salesforce CLI version
9. **Setting up a Scratch Org** (`## Setting up a Scratch Org`) — The **only** install/deploy instructions in the repo. Every recipe app deploys together as one project: scratch org creation, `npm run install:all` + `npm run build`, deploy all of `force-app`, assign `recipesAll`, data import, open org. Ends with a callout pointing to the Micro-Frontend guest server step.
10. **Optional Installation Instructions** (`## Optional Installation Instructions`) — Shared tooling: Prettier, ESLint, pre-commit hooks

### What does NOT go in the root README

- Local development commands
- Testing instructions

## 2. Per-App README (e.g., `force-app/main/<app>/README.md`)

Each app has its own README covering local development and testing. Per-app READMEs must **not** contain install or deploy steps (scratch org creation, per-app deploys, permset assignment, data import) — link to the root README's **Setting up a Scratch Org** instead. It must include these sections in order:

1. **Title** (`# <App Name>`)
2. **Description** — 1-2 sentences: what the app demonstrates, tech stack (framework, build tool, language, CSS)
3. **Setup callout** — A blockquote linking to the root README's **Setting up a Scratch Org**
4. **Running the guest server** (`## Running the guest server`) — Micro-Frontend Recipes only: start a guest dev server on `localhost:5173` after deploying
5. **Local Development** (`## Local Development`) — Commands: dev server, build, preview, codegen when relevant
6. **Testing** (`## Testing`) — Unit tests, coverage, e2e tests with browser install step

## 3. Formatting Rules

- **Code Blocks**: Use `bash` for all CLI commands
- **Headings**: `#` for title, `##` for sections, `###` for subsections
- **Numbered Lists**: Use `1.` for all items (Markdown auto-increments)
- **Emphasis**: Use **bold** for key terms, UI elements, and important names. Use `code` for file names, commands, and specific values.
- **Links**: Use relative paths for cross-linking between READMEs

## 4. Tone and Style

- **Concise**: Get to the point. One sentence where one sentence works.
- **Action-oriented**: Steps should be imperative ("Install dependencies", "Build the app")
- **No duplication**: Shared setup lives in the root README only. Per-app READMEs link back to it.
- **Keep it current**: Update recipe counts, paths, and commands when the app changes.
