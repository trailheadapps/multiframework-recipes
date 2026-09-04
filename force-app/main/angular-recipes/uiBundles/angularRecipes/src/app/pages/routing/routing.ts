import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecipeGalleryComponent } from '../../components/app/recipe-gallery/recipe-gallery';
import { RecipeDirective } from '../../components/app/recipe-gallery/recipe.directive';
import type { RecipeSource } from '../../components/app/code-block/code-block';
import { LinkDemoComponent } from '../../recipes/routing/link-demo/link-demo';
import { NavLinkDemoComponent } from '../../recipes/routing/nav-link-demo/nav-link-demo';
import { UseNavigateComponent } from '../../recipes/routing/use-navigate/use-navigate';
import { RouteParametersComponent } from '../../recipes/routing/route-parameters/route-parameters';

// `?shiki` imports resolve to the file's highlighted source HTML (esbuild/shiki.mjs).
import linkTs from '../../recipes/routing/link-demo/link-demo.ts?shiki';
import linkHtml from '../../recipes/routing/link-demo/link-demo.html?shiki';
import navLinkTs from '../../recipes/routing/nav-link-demo/nav-link-demo.ts?shiki';
import navLinkHtml from '../../recipes/routing/nav-link-demo/nav-link-demo.html?shiki';
import useNavigateTs from '../../recipes/routing/use-navigate/use-navigate.ts?shiki';
import useNavigateHtml from '../../recipes/routing/use-navigate/use-navigate.html?shiki';
import routeParamsTs from '../../recipes/routing/route-parameters/route-parameters.ts?shiki';
import routeParamsHtml from '../../recipes/routing/route-parameters/route-parameters.html?shiki';
import routeParamsDetailTs from '../../recipes/routing/route-parameters-detail/route-parameters-detail.ts?shiki';
import routeParamsDetailHtml from '../../recipes/routing/route-parameters-detail/route-parameters-detail.html?shiki';
import nestedTs from '../../recipes/routing/nested-routes/nested-routes.ts?shiki';
import nestedHtml from '../../recipes/routing/nested-routes/nested-routes.html?shiki';
import nestedDetailTs from '../../recipes/routing/nested-routes/nested-routes-detail.ts?shiki';
import nestedDetailHtml from '../../recipes/routing/nested-routes/nested-routes-detail.html?shiki';
import nestedStoreTs from '../../recipes/routing/nested-routes/nested-routes-store.ts?shiki';

@Component({
	selector: 'app-routing',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		RouterLink,
		RecipeGalleryComponent,
		RecipeDirective,
		LinkDemoComponent,
		NavLinkDemoComponent,
		UseNavigateComponent,
		RouteParametersComponent,
	],
	templateUrl: './routing.html',
})
export class RoutingComponent {
	protected readonly linkSources: RecipeSource[] = [
		{ label: 'link-demo.ts', html: linkTs },
		{ label: 'link-demo.html', html: linkHtml },
	];
	protected readonly navLinkSources: RecipeSource[] = [
		{ label: 'nav-link-demo.ts', html: navLinkTs },
		{ label: 'nav-link-demo.html', html: navLinkHtml },
	];
	protected readonly useNavigateSources: RecipeSource[] = [
		{ label: 'use-navigate.ts', html: useNavigateTs },
		{ label: 'use-navigate.html', html: useNavigateHtml },
	];
	protected readonly routeParamsSources: RecipeSource[] = [
		{ label: 'route-parameters.ts', html: routeParamsTs },
		{ label: 'route-parameters.html', html: routeParamsHtml },
		{ label: 'route-parameters-detail.ts', html: routeParamsDetailTs },
		{ label: 'route-parameters-detail.html', html: routeParamsDetailHtml },
	];
	protected readonly nestedRoutesSources: RecipeSource[] = [
		{ label: 'nested-routes.ts', html: nestedTs },
		{ label: 'nested-routes.html', html: nestedHtml },
		{ label: 'nested-routes-detail.ts', html: nestedDetailTs },
		{ label: 'nested-routes-detail.html', html: nestedDetailHtml },
		{ label: 'nested-routes-store.ts', html: nestedStoreTs },
	];
}
