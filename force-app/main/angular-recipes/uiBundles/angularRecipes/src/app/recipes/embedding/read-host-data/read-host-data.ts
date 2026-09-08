/**
 * Read Host Data
 *
 * Subscribes to live Account fields from the host. The LWC wires getRecord on
 * the current Account; every emission rebuilds `props` with a new object
 * reference, which the <lightning-ui-embedding> `props` setter treats as a
 * change and forwards to the guest.
 *
 * getUiState() returns { state, subscribe } synchronously: `state` is the
 * latest cached snapshot, `subscribe` fires on every subsequent host push.
 *
 * @see SendToHostComponent — writing back to the host
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

type Rating = 'Hot' | 'Warm' | 'Cold';

interface AccountProps {
	recordId?: string;
	name?: string | null;
	rating?: Rating | null;
	type?: string | null;
	industry?: string | null;
	website?: string | null;
	phone?: string | null;
}

const RATING_TONE: Record<Rating, string> = {
	Hot: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-100',
	Warm: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100',
	Cold: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100',
};

@Component({
	selector: 'app-read-host-data',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [BadgeImports, CardImports, IconComponent],
	templateUrl: './read-host-data.html',
})
export class ReadHostDataComponent implements OnInit, OnDestroy {
	protected readonly account = signal<AccountProps>({});
	protected readonly updateCount = signal(0);
	protected readonly connected = computed(() => Boolean(this.account().recordId));

	private destroyed = false;
	private unsubscribe?: () => void;

	ngOnInit(): void {
		getViewSDK().then((sdk) => {
			if (this.destroyed) return;
			const ui = sdk.getUiState?.();
			if (!ui) return;
			this.account.set(ui.state.props as AccountProps);
			this.unsubscribe = ui.subscribe((next) => {
				this.account.set(next.props as AccountProps);
				this.updateCount.update((count) => count + 1);
			});
		});
	}

	ngOnDestroy(): void {
		this.destroyed = true;
		this.unsubscribe?.();
	}

	protected ratingTone(rating: Rating): string {
		return RATING_TONE[rating];
	}

	protected normalizeUrl(url: string): string {
		return /^https?:\/\//i.test(url) ? url : `https://${url}`;
	}
}
