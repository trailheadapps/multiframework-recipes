import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Programmatic Navigation (Router.navigate)
 *
 * Inject Router and call navigate() imperatively — e.g. to redirect after a
 * save. Replaces React Router's useNavigate().
 *
 * LWC equivalent: NavigationMixin.Navigate() with a typed page reference;
 * Router.navigate() just takes a path array.
 *
 * @see SearchableAccountListComponent — combining search, debounce, and fetching
 */
@Component({
	selector: 'app-use-navigate',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './use-navigate.html',
})
export class UseNavigateComponent {
	private readonly router = inject(Router);
	protected readonly name = signal('');
	protected readonly status = signal<'idle' | 'saving' | 'done'>('idle');

	protected async onSubmit(event: Event): Promise<void> {
		event.preventDefault();
		this.status.set('saving');
		// Simulate an async operation such as a GraphQL mutation.
		await new Promise<void>((resolve) => setTimeout(resolve, 1200));
		this.status.set('done');
		// Navigate once the action completes.
		setTimeout(() => this.router.navigate(['/read-data']), 900);
	}
}
