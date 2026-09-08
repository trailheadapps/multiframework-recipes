import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Index child of the Nested Routes layout — shown when no account is selected.
 */
@Component({
	selector: 'app-nested-routes-index',
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="text-center p-4">
		<p class="text-muted-foreground">Select an account from the list</p>
	</div>`,
})
export class NestedRoutesIndexComponent {}
