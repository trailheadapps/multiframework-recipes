import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RecipeGalleryComponent } from '../../components/app/recipe-gallery/recipe-gallery';
import { RecipeDirective } from '../../components/app/recipe-gallery/recipe.directive';
import type { RecipeSource } from '../../components/app/code-block/code-block';
import { LoadingErrorEmptyComponent } from '../../recipes/error-handling/loading-error-empty/loading-error-empty';
import { ErrorBoundaryComponent } from '../../recipes/error-handling/error-boundary/error-boundary';
import { GraphqlErrorsComponent } from '../../recipes/error-handling/graphql-errors/graphql-errors';

// `?shiki` imports resolve to the file's highlighted source HTML (esbuild/shiki.mjs).
import loadingTs from '../../recipes/error-handling/loading-error-empty/loading-error-empty.ts?shiki';
import loadingHtml from '../../recipes/error-handling/loading-error-empty/loading-error-empty.html?shiki';
import boundaryTs from '../../recipes/error-handling/error-boundary/error-boundary.ts?shiki';
import boundaryHtml from '../../recipes/error-handling/error-boundary/error-boundary.html?shiki';
import graphqlTs from '../../recipes/error-handling/graphql-errors/graphql-errors.ts?shiki';
import graphqlHtml from '../../recipes/error-handling/graphql-errors/graphql-errors.html?shiki';

@Component({
	selector: 'app-error-handling',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		RecipeGalleryComponent,
		RecipeDirective,
		LoadingErrorEmptyComponent,
		ErrorBoundaryComponent,
		GraphqlErrorsComponent,
	],
	templateUrl: './error-handling.html',
})
export class ErrorHandlingComponent {
	protected readonly loadingSources: RecipeSource[] = [
		{ label: 'loading-error-empty.ts', html: loadingTs },
		{ label: 'loading-error-empty.html', html: loadingHtml },
	];
	protected readonly boundarySources: RecipeSource[] = [
		{ label: 'error-boundary.ts', html: boundaryTs },
		{ label: 'error-boundary.html', html: boundaryHtml },
	];
	protected readonly graphqlSources: RecipeSource[] = [
		{ label: 'graphql-errors.ts', html: graphqlTs },
		{ label: 'graphql-errors.html', html: graphqlHtml },
	];
}
