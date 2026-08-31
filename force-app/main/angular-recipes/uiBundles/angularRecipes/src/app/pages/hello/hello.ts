import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RecipeGalleryComponent } from '../../components/app/recipe-gallery/recipe-gallery';
import { RecipeDirective } from '../../components/app/recipe-gallery/recipe.directive';
import type { RecipeSource } from '../../components/app/code-block/code-block';
import { HelloWorldComponent } from '../../recipes/hello/hello-world/hello-world';
import { BindingAccountNameComponent } from '../../recipes/hello/binding-account-name/binding-account-name';
import { ConditionalStatusComponent } from '../../recipes/hello/conditional-status/conditional-status';
import { ListOfAccountsComponent } from '../../recipes/hello/list-of-accounts/list-of-accounts';
import { LifecycleFetchComponent } from '../../recipes/hello/lifecycle-fetch/lifecycle-fetch';
import { ParentToChildComponent } from '../../recipes/hello/parent-to-child/parent-to-child';
import { ChildToParentComponent } from '../../recipes/hello/child-to-parent/child-to-parent';
import { StateManagementComponent } from '../../recipes/hello/state-management/state-management';

// `?shiki` imports resolve to the file's highlighted source HTML (esbuild/shiki.mjs).
import helloWorldTs from '../../recipes/hello/hello-world/hello-world.ts?shiki';
import helloWorldHtml from '../../recipes/hello/hello-world/hello-world.html?shiki';
import bindingTs from '../../recipes/hello/binding-account-name/binding-account-name.ts?shiki';
import bindingHtml from '../../recipes/hello/binding-account-name/binding-account-name.html?shiki';
import conditionalTs from '../../recipes/hello/conditional-status/conditional-status.ts?shiki';
import conditionalHtml from '../../recipes/hello/conditional-status/conditional-status.html?shiki';
import listTs from '../../recipes/hello/list-of-accounts/list-of-accounts.ts?shiki';
import listHtml from '../../recipes/hello/list-of-accounts/list-of-accounts.html?shiki';
import lifecycleTs from '../../recipes/hello/lifecycle-fetch/lifecycle-fetch.ts?shiki';
import lifecycleHtml from '../../recipes/hello/lifecycle-fetch/lifecycle-fetch.html?shiki';
import contactFetcherHtml from '../../recipes/hello/lifecycle-fetch/contact-fetcher.html?shiki';
import parentTs from '../../recipes/hello/parent-to-child/parent-to-child.ts?shiki';
import parentHtml from '../../recipes/hello/parent-to-child/parent-to-child.html?shiki';
import accountCardHtml from '../../recipes/hello/parent-to-child/account-card.html?shiki';
import childTs from '../../recipes/hello/child-to-parent/child-to-parent.ts?shiki';
import childHtml from '../../recipes/hello/child-to-parent/child-to-parent.html?shiki';
import industryPickerHtml from '../../recipes/hello/child-to-parent/industry-picker.html?shiki';
import stateTs from '../../recipes/hello/state-management/state-management.ts?shiki';
import stateHtml from '../../recipes/hello/state-management/state-management.html?shiki';
import accountSelectorHtml from '../../recipes/hello/state-management/account-selector.html?shiki';
import accountDetailHtml from '../../recipes/hello/state-management/account-detail.html?shiki';

@Component({
	selector: 'app-hello',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [
		RecipeGalleryComponent,
		RecipeDirective,
		HelloWorldComponent,
		BindingAccountNameComponent,
		ConditionalStatusComponent,
		ListOfAccountsComponent,
		LifecycleFetchComponent,
		ParentToChildComponent,
		ChildToParentComponent,
		StateManagementComponent,
	],
	templateUrl: './hello.html',
})
export class HelloComponent {
	protected readonly helloWorldSources: RecipeSource[] = [
		{ label: 'hello-world.ts', html: helloWorldTs },
		{ label: 'hello-world.html', html: helloWorldHtml },
	];
	protected readonly bindingSources: RecipeSource[] = [
		{ label: 'binding-account-name.ts', html: bindingTs },
		{ label: 'binding-account-name.html', html: bindingHtml },
	];
	protected readonly conditionalSources: RecipeSource[] = [
		{ label: 'conditional-status.ts', html: conditionalTs },
		{ label: 'conditional-status.html', html: conditionalHtml },
	];
	protected readonly listSources: RecipeSource[] = [
		{ label: 'list-of-accounts.ts', html: listTs },
		{ label: 'list-of-accounts.html', html: listHtml },
	];
	protected readonly lifecycleSources: RecipeSource[] = [
		{ label: 'lifecycle-fetch.ts', html: lifecycleTs },
		{ label: 'lifecycle-fetch.html', html: lifecycleHtml },
		{ label: 'contact-fetcher.html', html: contactFetcherHtml },
	];
	protected readonly parentSources: RecipeSource[] = [
		{ label: 'parent-to-child.ts', html: parentTs },
		{ label: 'parent-to-child.html', html: parentHtml },
		{ label: 'account-card.html', html: accountCardHtml },
	];
	protected readonly childSources: RecipeSource[] = [
		{ label: 'child-to-parent.ts', html: childTs },
		{ label: 'child-to-parent.html', html: childHtml },
		{ label: 'industry-picker.html', html: industryPickerHtml },
	];
	protected readonly stateSources: RecipeSource[] = [
		{ label: 'state-management.ts', html: stateTs },
		{ label: 'state-management.html', html: stateHtml },
		{ label: 'account-selector.html', html: accountSelectorHtml },
		{ label: 'account-detail.html', html: accountDetailHtml },
	];
}
