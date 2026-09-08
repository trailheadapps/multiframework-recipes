import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RecipeGalleryComponent } from '../../components/app/recipe-gallery/recipe-gallery';
import { RecipeDirective } from '../../components/app/recipe-gallery/recipe.directive';
import type { RecipeSource } from '../../components/app/code-block/code-block';
import { SearchableAccountListComponent } from '../../recipes/integration/searchable-account-list/searchable-account-list';
import { DashboardAliasedQueriesComponent } from '../../recipes/integration/dashboard-aliased-queries/dashboard-aliased-queries';

// `?shiki` imports resolve to the file's highlighted source HTML (esbuild/shiki.mjs).
import searchTs from '../../recipes/integration/searchable-account-list/searchable-account-list.ts?shiki';
import searchHtml from '../../recipes/integration/searchable-account-list/searchable-account-list.html?shiki';
import dashboardTs from '../../recipes/integration/dashboard-aliased-queries/dashboard-aliased-queries.ts?shiki';
import dashboardHtml from '../../recipes/integration/dashboard-aliased-queries/dashboard-aliased-queries.html?shiki';
import statCardTs from '../../components/recipe/stat-card/stat-card.ts?shiki';
import statCardHtml from '../../components/recipe/stat-card/stat-card.html?shiki';

@Component({
	selector: 'app-integration',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		RecipeGalleryComponent,
		RecipeDirective,
		SearchableAccountListComponent,
		DashboardAliasedQueriesComponent,
	],
	templateUrl: './integration.html',
})
export class IntegrationComponent {
	protected readonly searchSources: RecipeSource[] = [
		{ label: 'searchable-account-list.ts', html: searchTs },
		{ label: 'searchable-account-list.html', html: searchHtml },
	];
	protected readonly dashboardSources: RecipeSource[] = [
		{ label: 'dashboard-aliased-queries.ts', html: dashboardTs },
		{ label: 'dashboard-aliased-queries.html', html: dashboardHtml },
		{ label: 'stat-card.ts', html: statCardTs },
		{ label: 'stat-card.html', html: statCardHtml },
	];
}
