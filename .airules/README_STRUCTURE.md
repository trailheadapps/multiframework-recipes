# Multiframework Recipes README Ruleset

This document defines the standard structure and formatting for README files in this repository. There are two README types: the **root README** (project-level) and **per-app READMEs** (one per framework app).

## 1. Root README (`README.md`)

The root README covers shared setup and links to individual app READMEs. It must include these sections in order:

1. **Title** (`# Multiframework Recipes`)
2. **CI Badges** — CI and codecov badges
3. **Description** — 1-2 paragraphs explaining the project
4. **Note** — Blockquote with current framework support and Beta availability
5. **Table of Contents** (`## Table of Contents`)
6. **Setting up a Scratch Org** (`## Setting up a Scratch Org`) — Shared steps: environment setup, CLI install, scratch org creation, Beta feature toggle, metadata deployment, permset assignment, data import. Ends with a callout to follow per-app READMEs.
7. **Recipe Apps** (`## Recipe Apps`) — Table with columns: App, Framework, README (link to per-app README)
8. **Optional Installation Instructions** (`## Optional Installation Instructions`) — Shared tooling: Prettier, ESLint, pre-commit hooks

### What does NOT go in the root README

- Framework-specific install, build, or deploy steps (these go in per-app READMEs)
- Local development commands
- Testing instructions

## 2. Per-App README (e.g., `force-app/main/<app>/uiBundles/<bundle>/README.md`)

Each framework app has its own README covering install, deploy, dev, and test. It must include these sections in order:

1. **Title** (`# <App Name>`)
2. **Description** — 1-2 sentences: what the app demonstrates, tech stack (framework, build tool, language, CSS)
3. **Prerequisites** (`## Prerequisites`) — Bulleted list: Node version, link back to root README for scratch org setup
4. **Install & Deploy** (`## Install & Deploy`) — Numbered steps: install deps, any codegen/schema steps, build, deploy bundle to org, open org
5. **Local Development** (`## Local Development`) — Commands: dev server, build, preview
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
