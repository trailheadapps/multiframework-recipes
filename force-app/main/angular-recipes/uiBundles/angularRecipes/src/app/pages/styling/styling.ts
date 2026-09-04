import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RecipeGalleryComponent } from '../../components/app/recipe-gallery/recipe-gallery';
import { RecipeDirective } from '../../components/app/recipe-gallery/recipe.directive';
import type { RecipeSource } from '../../components/app/code-block/code-block';
import { ButtonSldsComponent } from '../../recipes/styling/button-slds/button-slds';
import { ButtonShadcnComponent } from '../../recipes/styling/button-shadcn/button-shadcn';
import { AccountCardSldsComponent } from '../../recipes/styling/account-card-slds/account-card-slds';
import { AccountCardShadcnComponent } from '../../recipes/styling/account-card-shadcn/account-card-shadcn';
import { IconsSldsComponent } from '../../recipes/styling/icons-slds/icons-slds';
import { IconsLucideComponent } from '../../recipes/styling/icons-lucide/icons-lucide';

// `?shiki` imports resolve to the file's highlighted source HTML (esbuild/shiki.mjs).
import buttonSldsTs from '../../recipes/styling/button-slds/button-slds.ts?shiki';
import buttonSldsHtml from '../../recipes/styling/button-slds/button-slds.html?shiki';
import buttonShadcnTs from '../../recipes/styling/button-shadcn/button-shadcn.ts?shiki';
import buttonShadcnHtml from '../../recipes/styling/button-shadcn/button-shadcn.html?shiki';
import cardSldsTs from '../../recipes/styling/account-card-slds/account-card-slds.ts?shiki';
import cardSldsHtml from '../../recipes/styling/account-card-slds/account-card-slds.html?shiki';
import cardShadcnTs from '../../recipes/styling/account-card-shadcn/account-card-shadcn.ts?shiki';
import cardShadcnHtml from '../../recipes/styling/account-card-shadcn/account-card-shadcn.html?shiki';
import iconsSldsTs from '../../recipes/styling/icons-slds/icons-slds.ts?shiki';
import iconsSldsHtml from '../../recipes/styling/icons-slds/icons-slds.html?shiki';
import iconsLucideTs from '../../recipes/styling/icons-lucide/icons-lucide.ts?shiki';
import iconsLucideHtml from '../../recipes/styling/icons-lucide/icons-lucide.html?shiki';

@Component({
	selector: 'app-styling',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		RecipeGalleryComponent,
		RecipeDirective,
		ButtonSldsComponent,
		ButtonShadcnComponent,
		AccountCardSldsComponent,
		AccountCardShadcnComponent,
		IconsSldsComponent,
		IconsLucideComponent,
	],
	templateUrl: './styling.html',
})
export class StylingComponent {
	protected readonly buttonSldsSources: RecipeSource[] = [
		{ label: 'button-slds.ts', html: buttonSldsTs },
		{ label: 'button-slds.html', html: buttonSldsHtml },
	];
	protected readonly buttonShadcnSources: RecipeSource[] = [
		{ label: 'button-shadcn.ts', html: buttonShadcnTs },
		{ label: 'button-shadcn.html', html: buttonShadcnHtml },
	];
	protected readonly cardSldsSources: RecipeSource[] = [
		{ label: 'account-card-slds.ts', html: cardSldsTs },
		{ label: 'account-card-slds.html', html: cardSldsHtml },
	];
	protected readonly cardShadcnSources: RecipeSource[] = [
		{ label: 'account-card-shadcn.ts', html: cardShadcnTs },
		{ label: 'account-card-shadcn.html', html: cardShadcnHtml },
	];
	protected readonly iconsSldsSources: RecipeSource[] = [
		{ label: 'icons-slds.ts', html: iconsSldsTs },
		{ label: 'icons-slds.html', html: iconsSldsHtml },
	];
	protected readonly iconsLucideSources: RecipeSource[] = [
		{ label: 'icons-lucide.ts', html: iconsLucideTs },
		{ label: 'icons-lucide.html', html: iconsLucideHtml },
	];
}
