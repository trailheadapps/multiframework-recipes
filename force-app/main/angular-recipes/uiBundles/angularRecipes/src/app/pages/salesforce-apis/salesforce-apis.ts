import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RecipeGalleryComponent } from '../../components/app/recipe-gallery/recipe-gallery';
import { RecipeDirective } from '../../components/app/recipe-gallery/recipe.directive';
import type { RecipeSource } from '../../components/app/code-block/code-block';
import { DisplayCurrentUserComponent } from '../../recipes/salesforce-apis/display-current-user/display-current-user';
import { UiApiRestComponent } from '../../recipes/salesforce-apis/ui-api-rest/ui-api-rest';
import { ApexRestComponent } from '../../recipes/salesforce-apis/apex-rest/apex-rest';

// `?shiki` imports resolve to the file's highlighted source HTML (esbuild/shiki.mjs).
import userTs from '../../recipes/salesforce-apis/display-current-user/display-current-user.ts?shiki';
import userHtml from '../../recipes/salesforce-apis/display-current-user/display-current-user.html?shiki';
import uiApiTs from '../../recipes/salesforce-apis/ui-api-rest/ui-api-rest.ts?shiki';
import uiApiHtml from '../../recipes/salesforce-apis/ui-api-rest/ui-api-rest.html?shiki';
import apexTs from '../../recipes/salesforce-apis/apex-rest/apex-rest.ts?shiki';
import apexHtml from '../../recipes/salesforce-apis/apex-rest/apex-rest.html?shiki';

@Component({
	selector: 'app-salesforce-apis',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		RecipeGalleryComponent,
		RecipeDirective,
		DisplayCurrentUserComponent,
		UiApiRestComponent,
		ApexRestComponent,
	],
	templateUrl: './salesforce-apis.html',
})
export class SalesforceApisComponent {
	protected readonly userSources: RecipeSource[] = [
		{ label: 'display-current-user.ts', html: userTs },
		{ label: 'display-current-user.html', html: userHtml },
	];
	protected readonly uiApiSources: RecipeSource[] = [
		{ label: 'ui-api-rest.ts', html: uiApiTs },
		{ label: 'ui-api-rest.html', html: uiApiHtml },
	];
	protected readonly apexSources: RecipeSource[] = [
		{ label: 'apex-rest.ts', html: apexTs },
		{ label: 'apex-rest.html', html: apexHtml },
	];
}
