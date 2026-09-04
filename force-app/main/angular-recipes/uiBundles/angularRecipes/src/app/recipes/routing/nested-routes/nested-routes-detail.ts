import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NestedRoutesStore } from './nested-routes-store';

/**
 * Detail child of the Nested Routes layout. Reads :accountId from the bound
 * signal input and looks the record up in the shared route-scoped store — no
 * re-fetch, since the layout already loaded the list.
 */
@Component({
	selector: 'app-nested-routes-detail',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './nested-routes-detail.html',
})
export class NestedRoutesDetailComponent {
	protected readonly store = inject(NestedRoutesStore);
	readonly accountId = input<string>();

	protected readonly account = computed(() => {
		const id = this.accountId();
		return id ? this.store.find(id) : undefined;
	});
}
