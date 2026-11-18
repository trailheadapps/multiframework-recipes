import { test, expect, type Page } from '@playwright/test';

// Runs against the static build (npm run build:e2e) without a Salesforce org:
// the shell, navigation and code viewer work offline; data recipes show their
// loading or error states.

const navLink = (page: Page, name: string) =>
	page.locator('header').getByRole('link', { name, exact: true });

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

test('home page loads', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Angular Recipes' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
});

test('Get Started opens the Hello recipes', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Get Started' }).click();
	await expect(page).toHaveURL('/hello');
	await expect(page.getByRole('heading', { name: 'Hello' })).toBeVisible();
});

test('SPA deep-link works', async ({ page }) => {
	await page.goto('/styling');
	await expect(page.getByRole('heading', { name: 'Styling' })).toBeVisible();
});

test('unknown route renders 404 page', async ({ page }) => {
	await page.goto('/non-existent-route');
	await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
	await expect(page.getByText('Page not found')).toBeVisible();
	await page.getByRole('link', { name: 'Go to Home' }).click();
	await expect(page).toHaveURL('/');
});

// ---------------------------------------------------------------------------
// All navigation categories — navbar click → heading visible
// ---------------------------------------------------------------------------

const navCategories = [
	{ label: 'Hello', path: '/hello', heading: 'Hello' },
	{ label: 'Read Data', path: '/read-data', heading: 'Read Data' },
	{ label: 'Modify Data', path: '/modify-data', heading: 'Modify Data' },
	{ label: 'Salesforce APIs', path: '/salesforce-apis', heading: 'Salesforce APIs' },
	{ label: 'Integration', path: '/integration', heading: 'Integration' },
	{ label: 'Error Handling', path: '/error-handling', heading: 'Error Handling' },
	{ label: 'Styling', path: '/styling', heading: 'Styling' },
	{ label: 'Routing', path: '/routing', heading: 'Routing' },
	{ label: 'Micro-Frontends', path: '/embedding', heading: 'UI Embedding' },
];

for (const { label, path, heading } of navCategories) {
	test(`navbar navigates to ${label}`, async ({ page }) => {
		await page.goto('/');
		await navLink(page, label).click();
		await expect(page).toHaveURL(path);
		await expect(page.getByRole('heading', { name: heading, level: 1 })).toBeVisible();
	});
}

// ---------------------------------------------------------------------------
// Category card navigation from Home
// ---------------------------------------------------------------------------

const homeCards = [
	{ name: 'Hello', url: '/hello' },
	{ name: 'Read Data', url: '/read-data' },
	{ name: 'Modify Data', url: '/modify-data' },
	{ name: 'Integration', url: '/integration' },
];

for (const { name, url } of homeCards) {
	test(`home card "${name}" navigates to ${url}`, async ({ page }) => {
		await page.goto('/');
		await page
			.locator('main')
			.getByRole('link', { name: new RegExp(`^${name} \\d+ recipes`) })
			.click();
		await expect(page).toHaveURL(url);
		await expect(page.getByRole('heading', { name, level: 1 })).toBeVisible();
	});
}

// ---------------------------------------------------------------------------
// Recipe code viewer — sidebar + code viewer per category
// ---------------------------------------------------------------------------

const codeViewerCategories = [
	{
		path: '/hello',
		heading: 'Hello',
		firstRecipe: 'Hello World',
		secondRecipe: 'Conditional Rendering',
	},
	{
		path: '/read-data',
		heading: 'Read Data',
		firstRecipe: 'Single Record',
		secondRecipe: 'List of Records',
	},
	{
		path: '/routing',
		heading: 'Routing',
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
			await expect(sidebar.getByRole('button').first()).toHaveText(firstRecipe);
			await expect(page.locator('[data-slot="card-title"]')).toHaveText(firstRecipe);
			// Code viewer shows the recipe's source files as tabs, the first one selected
			const firstTab = page.getByRole('tab').first();
			await expect(firstTab).toHaveAccessibleName(/\.ts$/);
			await expect(firstTab).toHaveAttribute('aria-selected', 'true');
			await expect(page.locator('pre').first()).not.toBeEmpty();
		});

		test('clicking a recipe shows its code', async ({ page }) => {
			await page.goto(path);
			const before = await page.locator('pre').first().innerText();
			const sidebar = page.locator('nav[aria-label="Recipes"]');
			await sidebar.getByRole('button', { name: secondRecipe, exact: true }).click();
			await expect(page.locator('[data-slot="card-title"]')).toHaveText(secondRecipe);
			await expect(page.locator('pre').first()).not.toHaveText(before);
		});
	});
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

test('search jumps to a recipe', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: /Search recipes/ }).click();
	const search = page.getByRole('textbox', { name: 'Search all recipes' });
	await search.fill('Single Record');
	await expect(page.getByRole('button', { name: 'Single Record' })).toBeVisible();
	await search.press('Enter');
	await expect(page).toHaveURL(/\/read-data/);
	await expect(page.locator('[data-slot="card-title"]')).toHaveText('Single Record');
});

// ---------------------------------------------------------------------------
// Recipe component rendering — verify recipes render content, not just nav
// ---------------------------------------------------------------------------

test('hello page renders Hello World recipe component', async ({ page }) => {
	await page.goto('/hello');
	await expect(page.locator('[data-slot="card-content"]').first()).not.toBeEmpty();
});

test('error-handling page renders simulation buttons', async ({ page }) => {
	await page.goto('/error-handling');
	await expect(page.getByRole('button', { name: 'Simulate: Error' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Simulate: Empty' })).toBeVisible();
});

// ---------------------------------------------------------------------------
// Micro-Frontend guests — served outside the app shell
// ---------------------------------------------------------------------------

test('embedding index links the guest recipes', async ({ page }) => {
	await page.goto('/embedding');
	await expect(page.getByRole('heading', { name: 'UI Embedding' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Open guest' }).first()).toBeVisible();
});

test('guest route renders without the app shell', async ({ page }) => {
	await page.goto('/embedding/basic-render');
	// Without a host, the guest waits for the ui-state the host would push.
	await expect(page.getByText('Waiting for host…')).toBeVisible();
	await expect(page.locator('header')).toHaveCount(0);
});
