# Multi-Framework Recipes UI — Design Doc

| | |
|---|---|
| **Status** | Draft — for senior review |
| **Owner** | Aman Singh |
| **Reviewers** | Manuel Jasso, Drew Ellison, Navateja Alagam, Theodore Lau, Charles Watkins |
| **Last updated** | 2026-05-13 |
| **Target milestone** | 264 release · July feature freeze |

---

## 1. Summary

Reposition the existing "React Recipes" site under [force-app/main/react-recipes/](../force-app/main/react-recipes/) as **Multi-Framework Recipes**. Add two browse axes (Hosting, Framework) as first-class IA(Information Architecture) without disrupting the pro-code Salesforce developer experience that the recipe set is built for. Push advanced server / SSL / local-host concerns to a separate, future repo and link out instead of inlining.

This document specifies the **information architecture, data model, URL contract, and rollout plan**. It is the artifact for sign-off before implementation begins.

### Goals

- Make Hosting (`Salesforce-Hosted` vs `Externally-Hosted`) a navigable axis, not just a chip.
- Make Framework (`React`, `Vue`, `Angular`) a switchable axis with graceful "(soon)" states for non-shipping frameworks.
- Keep the default user journey simple: deploy and go. Audience is pro-code SF devs, not Node experts.
- Provide a clear, opt-in pointer to the future advanced server repo.

### Non-goals

- Authoring Vue or Angular recipe content (the IA must accommodate them; content lands later).
- Heroku-hosted demo server for externally-hosted scenarios — explicitly deferred per the meeting.
- Replacing the trail/learn/docs site. This is a recipes catalog, not docs.

---

## 2. Background

Source meeting: *Discuss multi-framework & multi-domain recipes* (2026-05-06).

### Decisions locked in the meeting

| Decision | UI implication |
|---|---|
| MFE recipes are **part of** multi-framework recipes, not a separate site | One unified catalog |
| Two hosting modes: **Salesforce-Hosted** (`*.salesforce.app`) and **Externally Hosted** (third-party) | Hosting is a first-class browse axis |
| Multi-framework: React first, then Angular & Vue | Framework is a first-class browse axis |
| Server repo is **separate** (advanced: local Express, SSL, `/etc/hosts`, Heroku deploy) | UI links out; never inlines |
| Audience = pro-code SF devs, often only know SF dev | Default path stays "deploy & go" |
| GA scope = local server only (Heroku-hosted demo deferred) | Copy must not promise hosted demos |

---

## 3. Current state

### What exists

| Surface | Status | File |
|---|---|---|
| Recipe registry with `hosting` and `framework` tags | Present | [recipeRegistry.ts](../force-app/main/react-recipes/uiBundles/reactRecipes/src/recipeRegistry.ts) |
| Home page with category tiles + hosting/framework chips | Present | [Home.tsx](../force-app/main/react-recipes/uiBundles/reactRecipes/src/pages/Home.tsx) |
| Sidebar + Guest/Host-JS/Host-HTML tab template | Present | [Mfe.tsx](../force-app/main/react-recipes/uiBundles/reactRecipes/src/pages/Mfe.tsx) |
| Global Cmd+K search across the registry | Present | [SearchBar.tsx](../force-app/main/react-recipes/uiBundles/reactRecipes/src/components/app/SearchBar.tsx) |
| Flat per-category routes | Present | [routes.tsx](../force-app/main/react-recipes/uiBundles/reactRecipes/src/routes.tsx) |

### Gaps vs. strategic direction

1. Hosting chips are visible but not actionable — no filter.
2. Title and visual identity hard-code "React".
3. No explanation of the SF-hosted vs externally-hosted distinction; reviewers in the meeting needed it walked through verbally.
4. No pointer to the future server / advanced-hosting repo.
5. `Mfe.tsx` is hardcoded to `Externally-Hosted` + `React`; no mechanism for flavors of the same recipe.
6. `recipeRegistry` has a 1:1 recipe→hosting and recipe→framework relationship; cannot represent a recipe that has both an SF-hosted and an externally-hosted flavor without duplicating entries.

---

## 4. Design decisions

Locked via review on 2026-05-13:

| # | Question | Decision |
|---|---|---|
| D1 | Top-level IA shape | **Filters + categories.** Category tiles stay primary. Framework switcher in navbar; Hosting filter on catalog. |
| D2 | Per-recipe flavor UX | **Tabs on the recipe page.** Disabled "(soon)" for unbuilt flavors; URL-addressable. |
| D3 | Server-repo link prominence | **Footer + contextual callout** on Externally-Hosted recipes only. |
| D4 | Site rebrand | **Yes, now.** "Multi-Framework Recipes" with a current-framework chip. |

### Rationale (for D1)

Considered three IA shapes:

- **Filters + categories** *(chosen)* — minimal disruption, scales to Vue/Angular without new top-level surfaces.
- *Two tracks (SF-Hosted / Externally Hosted)* — too much duplication; many recipes are framework-pure and hosting-agnostic.
- *Flat catalog with multi-axis filters* — strong for power users, weak as a first-time learning surface; the audience here is learning-oriented.

### Rationale (for D2)

Considered three flavor UX options. Rejected:

- *Global navbar switchers* — too far from the content, surprising URL changes.
- *Side-by-side comparison* — high build cost, poor mobile fit, premature when only one flavor exists per recipe today.

---

## 5. Data model

The current registry assumes one recipe = one (hosting × framework) combination. This must change to support flavors.

### Current shape — [recipeRegistry.ts](../force-app/main/react-recipes/uiBundles/reactRecipes/src/recipeRegistry.ts)

```ts
interface RecipeEntry {
  name: string;
  description: string;
  category: string;
  categoryRoute: string;
  recipeIndex: number;
  hosting: Hosting;     // single value
  framework: Framework; // single value
}
```

### Proposed shape

```ts
type Hosting = 'salesforce-hosted' | 'externally-hosted';
type Framework = 'react' | 'vue' | 'angular';

interface RecipeFlavor {
  hosting: Hosting;
  framework: Framework;
  /** Source-file imports for code tabs. Shape varies by category. */
  sources: Record<string, string>;
  /** Optional flavor-specific description override. */
  notes?: string;
}

interface RecipeEntry {
  /** Stable ID, kebab-case, unique within a category. e.g. "basic-embed" */
  id: string;
  name: string;
  description: string;
  category: string;
  categoryRoute: string;
  recipeIndex: number;
  /** At least one. The first entry is the default flavor. */
  flavors: RecipeFlavor[];
}
```

Rules:

- A recipe **must** have at least one flavor.
- Default flavor = `flavors[0]`.
- `(hosting, framework)` is unique within a recipe's flavors.
- Filtering "show me Salesforce-Hosted" matches a recipe if **any** of its flavors is `salesforce-hosted`.

### Helper functions (registry API)

```ts
getRecipe(categoryRoute: string, id: string): RecipeEntry | undefined
listRecipes(filter?: { hosting?: Hosting; framework?: Framework }): RecipeEntry[]
hasFlavor(recipe: RecipeEntry, hosting: Hosting, framework: Framework): boolean
resolveFlavor(recipe: RecipeEntry, hosting?: Hosting, framework?: Framework): RecipeFlavor
```

`resolveFlavor` fallback order: exact match → match on `hosting` only → match on `framework` only → `flavors[0]`. The UI uses the resolved flavor's actual `(hosting, framework)` to update visible state — never silently shows wrong content.

### Migration

Today's registry entries map cleanly: each becomes a recipe with a single-element `flavors` array. No content rewrite needed; the registry shape changes and call sites are updated.

---

## 6. URL contract

URLs are the source of truth for state. Reload must restore the exact same view.

| Surface | URL | Notes |
|---|---|---|
| Catalog | `/` | Hosting filter persisted to `localStorage`; not in URL (filter is a browse aid, not shareable state). |
| Category | `/{category}` | e.g. `/mfe` |
| Recipe — default flavor | `/{category}?recipe={index}` | Backwards compatible with current behavior in [SearchBar.tsx:91-95](../force-app/main/react-recipes/uiBundles/reactRecipes/src/components/app/SearchBar.tsx#L91-L95). |
| Recipe — explicit flavor | `/{category}?recipe={index}&host={hosting}&fw={framework}` | `host ∈ {sf, ext}`, `fw ∈ {react, vue, angular}`. Short forms keep URLs scannable. |
| Framework switcher | Navbar control | Updates the in-page selection only; does not navigate. Persisted to `localStorage`. |

Invalid combinations are silently resolved via `resolveFlavor`. The URL is corrected via `replaceState` (not `pushState`) so the user's back button is not littered.

---

## 7. Target UI

### 7.1 Global chrome

```ini
┌──────────────────────────────────────────────────────────────────────┐
│ ⌬ Multi-Framework Recipes  [React ▾]    Hello  Read  Modify  …  🔍   │
└──────────────────────────────────────────────────────────────────────┘
```

- Title: **Multi-Framework Recipes**.
- Framework switcher (`React ▾`); Vue/Angular shown disabled "(soon)".
- Categories unchanged in nav. `Embedding` is a normal category — its hosting nature is conveyed via tags.
- New footer link: *Advanced server recipes ↗* (separate repo).

### 7.2 Home / catalog

```ini
┌──────────────────────────────────────────────────────────────────────┐
│ Multi-Framework Recipes — React                                      │
│ Sample patterns for Salesforce-Hosted and Externally-Hosted apps.    │
│ [Get Started]  [Developer Guide ↗]                                   │
│                                                                      │
│ Hosting:  ● All   ○ Salesforce-Hosted   ○ Externally Hosted          │
│                                                                      │
│ ┌─ Hello ─────────┐ ┌─ Read Data ─────┐ ┌─ Embedding ────┐           │
│ │ 8 recipes       │ │ 8 recipes       │ │ 7 recipes      │           │
│ │ [SF] [React]    │ │ [SF] [React]    │ │ [Ext] [React]  │           │
│ └─────────────────┘ └─────────────────┘ └────────────────┘           │
│ …                                                                    │
│                                                                      │
│ ─── Hosting Models ───────────────────────────────────────────────── │
│ 📦 Salesforce-Hosted          🌐 Externally Hosted                   │
│ Deploy your app to            Host on AWS / Heroku /                 │
│ Salesforce.app (UI bundles).  your own infra; embed via lwc-shell.   │
│ Best for new apps.            Best for existing apps & SaaS vendors. │
│                                                                      │
│ Want to run your own server locally with SSL?                        │
│ → Advanced server recipes (separate repo) ↗                          │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.3 Category page

Two layouts based on category type:

- **Standard categories** (`/hello`, `/read-data`, …): existing recipe-card list. Add small `[SF] [React]` chips on each card.
- **Multi-source categories** (`/mfe` and future similar): sidebar + tabbed-code layout from `Mfe.tsx`. Add the flavor switcher (§7.4) above the code tabs.

### 7.4 Recipe page — flavor switcher

```ini
┌─ Basic Embed ────────────────────────────────────────────────┐
│ Minimum viable lwc-shell embed.                              │
│                                                              │
│ Hosting:    [● Externally Hosted] [ Salesforce-Hosted ⓘ ]   │
│ Framework:  [● React] [ Vue (soon) ] [ Angular (soon) ]      │
│                                                              │
│ ⓘ Externally hosted: this recipe assumes the guest app runs │
│   on a third-party domain. For local dev with SSL, see       │
│   → Advanced server recipes ↗                                │
│                                                              │
│ ┌ Code ─────────────────────────────────────────────────────┐│
│ │ [Guest (React)] [Host (LWC JS)] [Host (LWC HTML)]         ││
│ │   …                                                       ││
│ └───────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

- Both switchers always visible. Unavailable flavors disabled "(soon)" — not hidden.
- Tooltip on disabled flavors explains *why* it's unavailable ("Vue recipe coming in 266", "SF-hosted variant in design").
- Selection reflected in URL per §6.
- Externally-Hosted recipes get the inline callout linking to the server repo.

---

## 8. Accessibility

| Surface | Requirement |
|---|---|
| Hosting filter | `role="radiogroup"` with arrow-key navigation; each option is a `role="radio"` button. Keyboard-equivalent of a click. |
| Framework switcher | `role="combobox"` with proper `aria-expanded`, `aria-controls`, focus trapping in the menu, Escape to close. |
| Flavor tabs | `role="tablist"` / `role="tab"`. Disabled tabs use `aria-disabled="true"` (not `disabled`) so SR users still discover the "(soon)" state. |
| Color | Hosting/framework chips must not rely on color alone; always include a text label. |
| Focus | Visible focus ring on all interactive elements (already enforced via `focus-visible:ring-ring` in current Tailwind setup). |

The existing search bar already meets keyboard-nav expectations (arrow keys, Enter, Esc) — see [SearchBar.tsx:100-111](../force-app/main/react-recipes/uiBundles/reactRecipes/src/components/app/SearchBar.tsx#L100-L111). New components match that bar.

---

## 9. Search

The Cmd+K search ([SearchBar.tsx](../force-app/main/react-recipes/uiBundles/reactRecipes/src/components/app/SearchBar.tsx)) currently matches `name` and `description` only (lines 56–59). Extension:

- Index `hosting` and `framework` keywords so "external", "vue", "angular", "salesforce-hosted" surface relevant recipes.
- Show flavor chips on each result row so users can disambiguate before clicking.
- Selecting a result navigates to the recipe with the matching flavor pre-selected via URL params.

---

## 10. Use-case → UI coverage

| Discussion point | UI surface |
|---|---|
| MFE included in multi-framework recipes | `Embedding` is a normal category tile |
| Two hosting types: SF-hosted vs externally-hosted | Hosting filter on Home + flavor tabs on recipe page |
| Multi-framework: React → Vue → Angular | Navbar framework switcher + per-recipe flavor chips with "(soon)" |
| `salesforce.app` family vs 3P explanation | "Hosting Models" block on Home |
| SDK/bridge communication | Existing Guest / Host code tabs in `Mfe.tsx` |
| Local-server / SSL / `/etc/hosts` (advanced) | Separate repo; linked from footer + Externally-Hosted recipes |
| GA scope = local server only | Copy says *"local Express + SSL"*; nothing promises hosted demos |
| Pro-code SF devs new to Node | Default path stays "deploy & go"; complexity is opt-in via outlinks |

---

## 11. Build plan

Each step is a small, shippable PR. Ownership is implicit (single dev) but each step has clear acceptance criteria for review.

| # | Step | Files | Acceptance |
|---|---|---|---|
| 1 | Registry shape change: introduce `flavors[]` | [recipeRegistry.ts](../force-app/main/react-recipes/uiBundles/reactRecipes/src/recipeRegistry.ts) | All current entries migrate to single-flavor form; existing pages render unchanged; types are strict. |
| 2 | Rebrand to *Multi-Framework Recipes* + disabled framework switcher | [Navbar.tsx](../force-app/main/react-recipes/uiBundles/reactRecipes/src/components/app/Navbar.tsx), [Home.tsx](../force-app/main/react-recipes/uiBundles/reactRecipes/src/pages/Home.tsx), `index.html` | Page title, H1, and navbar reflect new brand; switcher renders with disabled Vue/Angular. |
| 3 | Home Hosting filter | [Home.tsx](../force-app/main/react-recipes/uiBundles/reactRecipes/src/pages/Home.tsx) | Radio group filters tile grid; selection persists across reload; a11y per §8. |
| 4 | Hosting Models explainer + footer link | [Home.tsx](../force-app/main/react-recipes/uiBundles/reactRecipes/src/pages/Home.tsx), new `Footer.tsx` | Two-column block + footer link; placeholder URL acceptable v1. |
| 5 | Recipe-card chips on standard category pages | All non-MFE pages under [pages/](../force-app/main/react-recipes/uiBundles/reactRecipes/src/pages/) | Each card shows hosting + framework chip; same component as Home. |
| 6 | Flavor switcher on `Mfe.tsx` | [Mfe.tsx](../force-app/main/react-recipes/uiBundles/reactRecipes/src/pages/Mfe.tsx) | URL-driven per §6; disabled "(soon)" states; `resolveFlavor` fallback. |
| 7 | Contextual server-repo callout on Externally-Hosted recipes | `Mfe.tsx` + future externally-hosted pages | Shown only when current flavor is externally-hosted. |
| 8 | Search index hosting + framework keywords | [SearchBar.tsx](../force-app/main/react-recipes/uiBundles/reactRecipes/src/components/app/SearchBar.tsx) | "external", "vue" surface relevant recipes; result rows show flavor chips. |

Steps 1 and 2 are sequential (everything else builds on them). 3–8 are largely independent.

### Out of scope (deferred)

- Side-by-side comparison view of flavors.
- Heroku-hosted demo server.
- Vue and Angular *content* — IA scaffolding only.
- Mobile-specific layout work (the recipes site is desktop-first; nothing here regresses mobile but no enhancements either).

---

## 12. Testing

| Layer | Approach |
|---|---|
| Registry shape | Type-level: strict TS; runtime: assertion in registry init that every recipe has ≥1 flavor and `(hosting, framework)` pairs are unique within a recipe. Throws at module load if violated — fast failure beats a misleading UI. |
| Filters | Component test: Hosting filter narrows the tile list to the correct count; "All" restores. |
| Flavor switcher | Component test: clicking each flavor updates URL; reload restores selection; invalid URL params resolve to default without 500. |
| Search | Test that hosting/framework keywords return expected recipes. |
| Visual | Manual walkthrough of every category page after step 5; smoke test in the dev server before each PR is merged. |

The repo uses Jest already ([jest.config.js](../jest.config.js)). New tests follow the same pattern; no new test infra.

---

## 13. Rollout

- All steps are merged to `main` behind no flag — the recipes site is a static React app; there's no runtime risk to existing Salesforce orgs.
- Deployment is a normal SFDX push of the React UI bundle.
- "(soon)" labels are content-controlled in the registry; flipping a flavor from disabled to enabled is one PR, no infra change.
- Server repo URL is configurable in one place ([Footer.tsx](../force-app/main/react-recipes/uiBundles/reactRecipes/src/components/app/Footer.tsx) constant) so it can flip from placeholder to real without touching every callsite.

---

## 14. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 264 freeze (July) — tight window for repo creation + content authoring | Med | High | Ship UI scaffolding (steps 1–8) ahead of MFE recipe content; backfill content when ready. |
| Server repo not yet created when we ship link | High | Low | Ship with placeholder URL + "Coming soon" tooltip. Single constant to flip. |
| "(soon)" labels age badly if Vue/Angular slip | Med | Low | Generic copy ("Additional frameworks planned") if a target slips beyond a release. |
| Registry refactor breaks existing pages | Low | Med | Migration is mechanical (single flavor wrapping); covered by step 1's acceptance criteria. |
| SF-hosted Embedding flavor design not finalized when step 6 lands | Med | Low | Step 6 only requires the *mechanism*; SF-hosted flavor stays disabled until content exists. |

---

## 15. Open questions

These need answers from §4 reviewers before step 2 ships:

1. **Server-repo name and URL** — confirmed name from the open-source team? Charles Watkins is the contact per the meeting notes.
2. **Framework switcher persistence** — proposed: `localStorage` per-user, default = `react`. Accept?
3. **Future SF-hosted Embedding flavors** — confirmed: same recipe with multiple `flavors[]` (per §5). Reviewer should confirm this matches the team's mental model before we commit to the registry refactor.
4. **Disabled-flavor copy** — generic "(soon)" or release-specific ("266")? Recommend release-specific where known, generic otherwise.

---

## 16. Appendix — alternatives considered and rejected

| Alternative | Why rejected |
|---|---|
| Two top-level tracks (SF-Hosted / Externally Hosted) | Most recipes are framework-pure; track-splitting would duplicate the catalog and force users to switch tracks for unrelated content. |
| Flat catalog with multi-axis filters as the primary surface | Strong for power users, weak as a first-time learning surface. Audience is learning-oriented. |
| Inline the server / SSL / `/etc/hosts` content into the main repo | Directly contradicts the meeting's "separation of concerns" decision and the "simple deploy & go" audience principle. |
| Side-by-side flavor comparison on recipe pages | Premature when only one flavor exists per recipe today; high build cost; poor mobile fit. |
| Leave site title as "React Recipes" until Vue/Angular ship | Contradicts the strategic framing of the meeting; the UI should set expectations now. |
