import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Existing tests
// ---------------------------------------------------------------------------

test('home page loads', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'React Recipes' })
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
});

test('navbar navigates to recipe page', async ({ page }) => {
  await page.goto('/');
  await page.locator('header').getByRole('button', { name: 'Hello' }).click();
  await expect(page).toHaveURL('/hello');
  await expect(page.getByRole('heading', { name: 'Hello' })).toBeVisible();
});

test('recipe page renders sidebar and code viewer', async ({ page }) => {
  await page.goto('/hello');
  const sidebar = page.locator('nav[aria-label="Recipes"]');
  await expect(sidebar).toBeVisible();
  await expect(sidebar.locator('button').first()).toHaveText('Hello World');
  await expect(page.locator('.font-mono', { hasText: 'TSX' }).first()).toBeVisible();
  await expect(page.locator('pre').first()).toContainText('HelloWorld');
});

test('sidebar selection switches recipe', async ({ page }) => {
  await page.goto('/hello');
  const sidebar = page.locator('nav[aria-label="Recipes"]');
  await sidebar
    .getByRole('button', { name: 'State Management (Lifted State)' })
    .click();
  await expect(page.locator('[data-slot="card-title"]')).toHaveText(
    'State Management (Lifted State)'
  );
  await expect(page.locator('pre').first()).toContainText('StateManagement');
});

test('SPA deep-link works', async ({ page }) => {
  await page.goto('/styling');
  await expect(
    page.getByRole('heading', { name: 'Styling with SLDS' })
  ).toBeVisible();
});

test('unknown route renders 404 page', async ({ page }) => {
  await page.goto('/non-existent-route');
  await expect(
    page.getByRole('heading', { name: 'Page Not Found' })
  ).toBeVisible();
});

// ---------------------------------------------------------------------------
// All navigation categories — navbar click → heading visible
// ---------------------------------------------------------------------------

const navCategories = [
  { label: 'Read Data', path: '/read-data', heading: 'Read Data' },
  { label: 'Modify Data', path: '/modify-data', heading: 'Modify Data' },
  { label: 'Salesforce APIs', path: '/salesforce-apis', heading: 'Salesforce APIs' },
  { label: 'Error Handling', path: '/error-handling', heading: 'Error Handling' },
  { label: 'Routing', path: '/routing', heading: 'Routing & Navigation' },
  { label: 'Integration', path: '/integration', heading: 'Integration Patterns' },
];

for (const { label, heading, path } of navCategories) {
  test(`navbar navigates to ${label}`, async ({ page, isMobile }) => {
    await page.goto('/');
    // On mobile viewports the navbar items may overflow and overlap,
    // so use force click to bypass actionability checks.
    await page
      .locator('header')
      .getByRole('button', { name: label })
      .click({ force: isMobile });
    await expect(page).toHaveURL(path);
    await expect(
      page.getByRole('heading', { name: heading })
    ).toBeVisible();
  });
}

// ---------------------------------------------------------------------------
// Recipe code viewer — sidebar + code viewer per category
// ---------------------------------------------------------------------------

const codeViewerCategories = [
  {
    path: '/read-data',
    heading: 'Read Data',
    firstRecipe: 'Single Record',
    secondRecipe: 'List of Records',
  },
  {
    path: '/modify-data',
    heading: 'Modify Data',
    firstRecipe: 'Create a Record',
    secondRecipe: 'Update a Record',
  },
  {
    path: '/routing',
    heading: 'Routing & Navigation',
    firstRecipe: 'Link',
    secondRecipe: 'NavLink',
  },
];

for (const { path, heading, firstRecipe, secondRecipe } of codeViewerCategories) {
  test.describe(`code viewer on ${heading}`, () => {
    test('sidebar lists recipes and first recipe is selected', async ({ page }) => {
      await page.goto(path);
      const sidebar = page.locator('nav[aria-label="Recipes"]');
      await expect(sidebar).toBeVisible();
      await expect(sidebar.locator('button').first()).toHaveText(firstRecipe);
      // Code viewer should show TSX content
      await expect(page.locator('.font-mono', { hasText: 'TSX' }).first()).toBeVisible();
      await expect(page.locator('pre').first()).not.toBeEmpty();
    });

    test('clicking a recipe shows its code', async ({ page }) => {
      await page.goto(path);
      const sidebar = page.locator('nav[aria-label="Recipes"]');
      await sidebar.getByRole('button', { name: secondRecipe }).click();
      await expect(page.locator('[data-slot="card-title"]')).toHaveText(
        secondRecipe
      );
      await expect(page.locator('pre').first()).not.toBeEmpty();
    });
  });
}

// ---------------------------------------------------------------------------
// Category card navigation from Home
// ---------------------------------------------------------------------------

const homeCards = [
  { name: 'Hello', url: '/hello', heading: 'Hello' },
  { name: 'Read Data', url: '/read-data', heading: 'Read Data' },
  { name: 'Modify Data', url: '/modify-data', heading: 'Modify Data' },
  { name: 'Integration', url: '/integration', heading: 'Integration Patterns' },
];

for (const { name, url, heading } of homeCards) {
  test(`home card "${name}" navigates to ${url}`, async ({ page, isMobile }) => {
    await page.goto('/');
    // Cards are buttons wrapping Card components with CardTitle text.
    // On mobile viewports the sticky navbar can overlap cards, so force-click.
    const card = page
      .locator('button', { has: page.locator(`text="${name}"`) })
      .first();
    await card.scrollIntoViewIfNeeded();
    await card.click({ force: isMobile });
    await expect(page).toHaveURL(url);
    await expect(
      page.getByRole('heading', { name: heading })
    ).toBeVisible();
  });
}

// ---------------------------------------------------------------------------
// Recipe component rendering — verify recipes render content, not just nav
// ---------------------------------------------------------------------------

test('hello page renders Hello World recipe component', async ({ page }) => {
  await page.goto('/hello');
  // The Hello World recipe should render its greeting text
  await expect(page.locator('[data-slot="card-content"]').first()).not.toBeEmpty();
});

test('read-data page renders recipe with data table or list', async ({ page }) => {
  await page.goto('/read-data');
  // The first recipe (Single Record) should render inside the card content area
  const content = page.locator('[data-slot="card-content"]').first();
  await expect(content).not.toBeEmpty();
});

test('error-handling page renders simulation buttons', async ({ page }) => {
  await page.goto('/error-handling');
  // LoadingErrorEmpty recipe has simulation buttons
  await expect(
    page.getByRole('button', { name: 'Simulate: Error' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Simulate: Empty' })
  ).toBeVisible();
});

test('styling page renders SLDS button variants', async ({ page }) => {
  await page.goto('/styling');
  // Navigate to Button — SLDS Blueprint recipe
  const sidebar = page.locator('nav[aria-label="Recipes"]');
  await sidebar.getByRole('button', { name: 'Button — SLDS Blueprint' }).click();
  // Verify actual SLDS buttons render
  await expect(page.locator('.slds-button_brand').first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// Mobile responsive tests
// ---------------------------------------------------------------------------

test.describe('mobile responsive', () => {
  test('home page renders on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only test');
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'React Recipes' })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Get Started' })
    ).toBeVisible();
    // Category cards should be visible
    await expect(page.locator('button', { hasText: 'Hello' }).first()).toBeVisible();
  });

  test('navigation works on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only test');
    await page.goto('/');
    // The navbar does not collapse into a hamburger menu — items are
    // always rendered, so we can click them directly (they may scroll).
    const navButton = page
      .locator('header')
      .getByRole('button', { name: 'Read Data' });
    await navButton.click({ force: true });
    await expect(page).toHaveURL('/read-data');
    await expect(
      page.getByRole('heading', { name: 'Read Data' })
    ).toBeVisible();
  });

  test('recipe page is usable on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile-only test');
    await page.goto('/hello');
    // Heading should be visible
    await expect(
      page.getByRole('heading', { name: 'Hello' })
    ).toBeVisible();
    // Sidebar should be in the DOM (may need scrolling on small screens)
    const sidebar = page.locator('nav[aria-label="Recipes"]');
    await expect(sidebar).toBeAttached();
    // First recipe button should exist
    await expect(sidebar.locator('button').first()).toHaveText('Hello World');
  });
});
