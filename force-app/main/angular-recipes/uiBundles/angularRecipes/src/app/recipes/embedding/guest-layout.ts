/**
 * Route layout for the externally-hosted embedding guests.
 *
 * Importing the ui-embedding entry at module load registers the SDK's
 * embedding bootstrap before any guest calls getViewSDK(). The layout also
 * adds `.embedding-guest` to the document root so the shared app styles switch
 * to a transparent, chromeless surface (see styles.css). Each matched guest
 * renders through <router-outlet> and calls getViewSDK() for its SDK instance.
 */
// Registers the ui-embedding bootstrap at module load, before any guest
// calls getViewSDK().
import '@salesforce/platform-sdk/ui-embedding';

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
	selector: 'app-guest-layout',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterOutlet],
	template: '<router-outlet />',
})
export class GuestLayoutComponent implements OnInit, OnDestroy {
	ngOnInit(): void {
		document.documentElement.classList.add('embedding-guest');
	}

	ngOnDestroy(): void {
		document.documentElement.classList.remove('embedding-guest');
	}
}
