/**
 * Basic Render
 *
 * The minimum viable embedding guest. Reads Account props (name, industry,
 * type, website) the LWC host pushes through the Platform SDK's ui-state
 * channel and renders them as a card. Data flows one way, host → guest.
 *
 * getViewSDK() resolves the embedding SDK; getUiState() returns the latest
 * cached snapshot synchronously plus a subscribe() for every later host push.
 *
 * @see ReadHostDataComponent — reacting to a live stream of host updates
 */
import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
	computed,
	signal,
} from '@angular/core';
import { getViewSDK } from '@salesforce/platform-sdk';
import { BadgeImports } from '../../../components/ui/badge/badge';
import { CardImports } from '../../../components/ui/card/card';
import { IconComponent } from '../../../components/ui/icon/icon';

interface AccountProps {
	recordId?: string;
	name?: string | null;
	industry?: string | null;
	type?: string | null;
	website?: string | null;
}

@Component({
	selector: 'app-basic-render',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [BadgeImports, CardImports, IconComponent],
	templateUrl: './basic-render.html',
})
export class BasicRenderComponent implements OnInit, OnDestroy {
	protected readonly account = signal<AccountProps>({});
	protected readonly connected = computed(() => Boolean(this.account().recordId));

	// getViewSDK() is async; `destroyed` stops a late resolution from
	// subscribing after the guest has been torn down.
	private destroyed = false;
	private unsubscribe?: () => void;

	ngOnInit(): void {
		getViewSDK().then((sdk) => {
			if (this.destroyed) return;
			const ui = sdk.getUiState?.();
			if (!ui) return;
			this.account.set(ui.state.props as AccountProps);
			this.unsubscribe = ui.subscribe((next) => this.account.set(next.props as AccountProps));
		});
	}

	ngOnDestroy(): void {
		this.destroyed = true;
		this.unsubscribe?.();
	}

	// The current guest URL, shown as a "live from" link so it's obvious the
	// card is served from an external origin and embedded in the record page.
	protected readonly href = globalThis.location?.href ?? '';
	protected readonly origin =
		(globalThis.location?.origin ?? '') + (globalThis.location?.pathname ?? '');

	// Prefix a bare host (acme.example) with https:// so the link is absolute.
	protected normalizeUrl(url: string): string {
		return /^https?:\/\//i.test(url) ? url : `https://${url}`;
	}
}
