import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { createDataSDK } from '@salesforce/platform-sdk';

/**
 * Display Current User
 *
 * Fetches the current user from the Chatter REST endpoint /users/me via
 * sdk.fetch — plain JSON, no UIAPI { value } wrappers. This is the first recipe
 * to use sdk.fetch (REST) rather than sdk.graphql.
 *
 * LWC equivalent: import userId from '@salesforce/user/Id', then @wire(getRecord)
 * on the User object for fields like Name and Email.
 *
 * @see UiApiRestComponent — the UI API REST endpoints
 */
@Component({
	selector: 'app-display-current-user',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './display-current-user.html',
})
export class DisplayCurrentUserComponent implements OnInit {
	protected readonly user = signal<ChatterUser | undefined>(undefined);
	protected readonly error = signal<string | undefined>(undefined);

	async ngOnInit(): Promise<void> {
		try {
			const sdk = await createDataSDK();
			const res = await sdk.fetch?.('/services/data/v66.0/chatter/users/me');
			if (!res?.ok) {
				throw new Error(`Failed to fetch current user (${res?.status})`);
			}
			// res.json() is untyped; annotate the destination rather than casting.
			const data: ChatterUser = await res.json();
			this.user.set(data);
		} catch (err) {
			this.error.set(err instanceof Error ? err.message : 'Request failed');
		}
	}
}

interface ChatterUser {
	displayName: string;
	email: string;
}
