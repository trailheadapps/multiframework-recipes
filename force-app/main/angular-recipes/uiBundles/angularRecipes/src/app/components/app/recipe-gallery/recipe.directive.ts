import { Directive, TemplateRef, inject, input } from '@angular/core';
import type { RecipeSource } from '../code-block/code-block';

/**
 * Marks an `<ng-template>` as one recipe in a category gallery. The template
 * holds the live recipe component; the inputs carry its name, description, and
 * highlighted source. `RecipeGalleryComponent` collects these with a content
 * query and renders the selected one — so only the visible recipe is mounted
 * (and only it fetches data), matching the React gallery.
 */
@Directive({
	selector: 'ng-template[appRecipe]',
})
export class RecipeDirective {
	readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);

	readonly name = input.required<string>({ alias: 'appRecipe' });
	readonly description = input<string>('');
	readonly sources = input.required<readonly RecipeSource[]>();
}
