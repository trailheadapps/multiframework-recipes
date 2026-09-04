import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NestedRoutesStore } from './nested-routes-store';

/**
 * Nested Routes (Master-Detail)
 *
 * A layout route whose sidebar stays mounted while the detail panel renders in
 * <router-outlet> from a child route (index or :accountId). The shared account
 * list lives in a route-scoped store — Angular's alternative to React Router's
 * useOutletContext, so the child route never re-fetches.
 *
 * @see UseNavigateComponent — programmatic navigation after an action
 */
@Component({
	selector: 'app-nested-routes',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, RouterLinkActive, RouterOutlet],
	templateUrl: './nested-routes.html',
})
export class NestedRoutesComponent implements OnInit {
	protected readonly store = inject(NestedRoutesStore);

	ngOnInit(): void {
		this.store.load();
	}
}
