import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RecipeGalleryComponent } from '../../components/app/recipe-gallery/recipe-gallery';
import { RecipeDirective } from '../../components/app/recipe-gallery/recipe.directive';
import type { RecipeSource } from '../../components/app/code-block/code-block';
import { SingleRecordComponent } from '../../recipes/read-data/single-record/single-record';
import { ListOfRecordsComponent } from '../../recipes/read-data/list-of-records/list-of-records';
import { FilteredListComponent } from '../../recipes/read-data/filtered-list/filtered-list';
import { SortedResultsComponent } from '../../recipes/read-data/sorted-results/sorted-results';
import { PaginatedListComponent } from '../../recipes/read-data/paginated-list/paginated-list';
import { RelatedRecordsComponent } from '../../recipes/read-data/related-records/related-records';
import { AliasedMultiObjectQueryComponent } from '../../recipes/read-data/aliased-multi-object-query/aliased-multi-object-query';
import { ImperativeRefetchComponent } from '../../recipes/read-data/imperative-refetch/imperative-refetch';

// `?shiki` imports resolve to the file's highlighted source HTML (esbuild/shiki.mjs).
import singleRecordTs from '../../recipes/read-data/single-record/single-record.ts?shiki';
import singleRecordHtml from '../../recipes/read-data/single-record/single-record.html?shiki';
import listTs from '../../recipes/read-data/list-of-records/list-of-records.ts?shiki';
import listHtml from '../../recipes/read-data/list-of-records/list-of-records.html?shiki';
import filteredTs from '../../recipes/read-data/filtered-list/filtered-list.ts?shiki';
import filteredHtml from '../../recipes/read-data/filtered-list/filtered-list.html?shiki';
import sortedTs from '../../recipes/read-data/sorted-results/sorted-results.ts?shiki';
import sortedHtml from '../../recipes/read-data/sorted-results/sorted-results.html?shiki';
import paginatedTs from '../../recipes/read-data/paginated-list/paginated-list.ts?shiki';
import paginatedHtml from '../../recipes/read-data/paginated-list/paginated-list.html?shiki';
import relatedTs from '../../recipes/read-data/related-records/related-records.ts?shiki';
import relatedHtml from '../../recipes/read-data/related-records/related-records.html?shiki';
import aliasedTs from '../../recipes/read-data/aliased-multi-object-query/aliased-multi-object-query.ts?shiki';
import aliasedHtml from '../../recipes/read-data/aliased-multi-object-query/aliased-multi-object-query.html?shiki';
import imperativeTs from '../../recipes/read-data/imperative-refetch/imperative-refetch.ts?shiki';
import imperativeHtml from '../../recipes/read-data/imperative-refetch/imperative-refetch.html?shiki';

@Component({
	selector: 'app-read-data',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		RecipeGalleryComponent,
		RecipeDirective,
		SingleRecordComponent,
		ListOfRecordsComponent,
		FilteredListComponent,
		SortedResultsComponent,
		PaginatedListComponent,
		RelatedRecordsComponent,
		AliasedMultiObjectQueryComponent,
		ImperativeRefetchComponent,
	],
	templateUrl: './read-data.html',
})
export class ReadDataComponent {
	protected readonly singleRecordSources: RecipeSource[] = [
		{ label: 'single-record.ts', html: singleRecordTs },
		{ label: 'single-record.html', html: singleRecordHtml },
	];
	protected readonly listSources: RecipeSource[] = [
		{ label: 'list-of-records.ts', html: listTs },
		{ label: 'list-of-records.html', html: listHtml },
	];
	protected readonly filteredSources: RecipeSource[] = [
		{ label: 'filtered-list.ts', html: filteredTs },
		{ label: 'filtered-list.html', html: filteredHtml },
	];
	protected readonly sortedSources: RecipeSource[] = [
		{ label: 'sorted-results.ts', html: sortedTs },
		{ label: 'sorted-results.html', html: sortedHtml },
	];
	protected readonly paginatedSources: RecipeSource[] = [
		{ label: 'paginated-list.ts', html: paginatedTs },
		{ label: 'paginated-list.html', html: paginatedHtml },
	];
	protected readonly relatedSources: RecipeSource[] = [
		{ label: 'related-records.ts', html: relatedTs },
		{ label: 'related-records.html', html: relatedHtml },
	];
	protected readonly aliasedSources: RecipeSource[] = [
		{ label: 'aliased-multi-object-query.ts', html: aliasedTs },
		{ label: 'aliased-multi-object-query.html', html: aliasedHtml },
	];
	protected readonly imperativeSources: RecipeSource[] = [
		{ label: 'imperative-refetch.ts', html: imperativeTs },
		{ label: 'imperative-refetch.html', html: imperativeHtml },
	];
}
