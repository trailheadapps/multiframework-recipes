import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RecipeGalleryComponent } from '../../components/app/recipe-gallery/recipe-gallery';
import { RecipeDirective } from '../../components/app/recipe-gallery/recipe.directive';
import type { RecipeSource } from '../../components/app/code-block/code-block';
import { CreateRecordComponent } from '../../recipes/modify-data/create-record/create-record';
import { UpdateRecordComponent } from '../../recipes/modify-data/update-record/update-record';
import { DeleteRecordComponent } from '../../recipes/modify-data/delete-record/delete-record';
import { ServerErrorHandlingComponent } from '../../recipes/modify-data/server-error-handling/server-error-handling';
import { QueryMutationTogetherComponent } from '../../recipes/modify-data/query-mutation-together/query-mutation-together';

// `?shiki` imports resolve to the file's highlighted source HTML (esbuild/shiki.mjs).
import createTs from '../../recipes/modify-data/create-record/create-record.ts?shiki';
import createHtml from '../../recipes/modify-data/create-record/create-record.html?shiki';
import updateTs from '../../recipes/modify-data/update-record/update-record.ts?shiki';
import updateHtml from '../../recipes/modify-data/update-record/update-record.html?shiki';
import deleteTs from '../../recipes/modify-data/delete-record/delete-record.ts?shiki';
import deleteHtml from '../../recipes/modify-data/delete-record/delete-record.html?shiki';
import serverErrorTs from '../../recipes/modify-data/server-error-handling/server-error-handling.ts?shiki';
import serverErrorHtml from '../../recipes/modify-data/server-error-handling/server-error-handling.html?shiki';
import queryMutationTs from '../../recipes/modify-data/query-mutation-together/query-mutation-together.ts?shiki';
import queryMutationHtml from '../../recipes/modify-data/query-mutation-together/query-mutation-together.html?shiki';

@Component({
	selector: 'app-modify-data',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		RecipeGalleryComponent,
		RecipeDirective,
		CreateRecordComponent,
		UpdateRecordComponent,
		DeleteRecordComponent,
		ServerErrorHandlingComponent,
		QueryMutationTogetherComponent,
	],
	templateUrl: './modify-data.html',
})
export class ModifyDataComponent {
	protected readonly createSources: RecipeSource[] = [
		{ label: 'create-record.ts', html: createTs },
		{ label: 'create-record.html', html: createHtml },
	];
	protected readonly updateSources: RecipeSource[] = [
		{ label: 'update-record.ts', html: updateTs },
		{ label: 'update-record.html', html: updateHtml },
	];
	protected readonly deleteSources: RecipeSource[] = [
		{ label: 'delete-record.ts', html: deleteTs },
		{ label: 'delete-record.html', html: deleteHtml },
	];
	protected readonly serverErrorSources: RecipeSource[] = [
		{ label: 'server-error-handling.ts', html: serverErrorTs },
		{ label: 'server-error-handling.html', html: serverErrorHtml },
	];
	protected readonly queryMutationSources: RecipeSource[] = [
		{ label: 'query-mutation-together.ts', html: queryMutationTs },
		{ label: 'query-mutation-together.html', html: queryMutationHtml },
	];
}
