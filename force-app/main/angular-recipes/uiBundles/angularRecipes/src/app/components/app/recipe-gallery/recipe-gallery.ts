import { NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	contentChildren,
	effect,
	inject,
	input,
	signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CardImports } from '../../ui/card/card';
import { CodeBlockComponent } from '../code-block/code-block';
import { RecipeDirective } from './recipe.directive';

/**
 * Category page shell: a sidebar of recipe names, the selected recipe rendered
 * live, and its source alongside. Recipes are declared as `<ng-template appRecipe>`
 * children (see RecipeDirective). Mirrors the React app's Layout.
 */
@Component({
	selector: 'app-recipe-gallery',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [NgTemplateOutlet, CardImports, CodeBlockComponent],
	templateUrl: './recipe-gallery.html',
})
export class RecipeGalleryComponent {
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);

	readonly header = input<string>('');
	readonly recipes = contentChildren(RecipeDirective);

	protected readonly selectedIndex = signal(0);
	protected readonly codeExpanded = signal(false);
	protected readonly selected = computed(() => this.recipes()[this.selectedIndex()]);

	constructor() {
		// Deep-link support: the search bar navigates to `?recipe=<index>`. Apply
		// it once, then strip the param so a later sidebar click isn't overridden.
		const queryParams = toSignal(this.route.queryParamMap);
		effect(() => {
			const raw = queryParams()?.get('recipe');
			if (raw == null) return;
			const index = Number.parseInt(raw, 10);
			if (index >= 0 && index < this.recipes().length) {
				this.selectedIndex.set(index);
			}
			this.router.navigate([], { queryParams: {}, replaceUrl: true });
		});
	}

	protected select(index: number): void {
		this.selectedIndex.set(index);
		this.codeExpanded.set(false);
	}
}
