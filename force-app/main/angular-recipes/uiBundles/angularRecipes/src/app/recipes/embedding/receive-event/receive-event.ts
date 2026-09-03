/**
 * Receive Event — live stock quote
 *
 * The mirror of SendToHost: here the host pushes an event *down* to the guest.
 * The LWC dispatches a `refreshticker` event on <lightning-ui-embedding>; the
 * guest hears it through viewSDK.addEventListener() and re-pulls the price.
 *
 * Why an event and not ui-state? Two channels, two jobs:
 *   - ui-state carries the Account's tickerSymbol — a Salesforce field the
 *     host owns and pushes (like every other recipe).
 *   - the share price is NOT in Salesforce. Only the guest can fetch it, so
 *     the host can't push it — it can only fire a `refreshticker` event that
 *     says "re-pull your own data now."
 *
 * This is fire-and-forget: the host doesn't wait for a result. A dispatched
 * event can't hand data back to its sender, so a reply would need the guest to
 * dispatch its own event the other direction.
 *
 * @see ReadHostDataComponent — receiving host-owned fields via ui-state
 * @see SendToHostComponent — dispatching events guest → host
 */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { getViewSDK } from '@salesforce/platform-sdk';
import { CardImports } from '../../../components/ui/card/card';
import { IconComponent } from '../../../components/ui/icon/icon';

interface AccountProps {
	recordId?: string;
	name?: string | null;
	tickerSymbol?: string | null;
}

interface Quote {
	price: number;
	asOf: string;
}

@Component({
	selector: 'app-receive-event',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [CardImports, IconComponent],
	templateUrl: './receive-event.html',
})
export class ReceiveEventComponent implements OnInit, OnDestroy {
	protected readonly account = signal<AccountProps>({});
	protected readonly quote = signal<Quote | null>(null);
	protected readonly refreshCount = signal(0);
	protected readonly connected = computed(() => Boolean(this.account().recordId));

	// The refresh listener reads this so it always re-pulls the current ticker
	// without re-subscribing every time ui-state changes.
	private currentTicker: string | null = null;
	private destroyed = false;
	private unsubscribe?: () => void;
	private detachRefresh?: () => void;

	ngOnInit(): void {
		getViewSDK().then((sdk) => {
			if (this.destroyed) return;

			// ui-state: which company are we looking at?
			const ui = sdk.getUiState?.();
			if (ui) {
				this.applyProps(ui.state.props as AccountProps);
				this.unsubscribe = ui.subscribe((next) => this.applyProps(next.props as AccountProps));
			}

			// Host → guest: the LWC fires `refreshticker`; re-pull the quote.
			const onRefresh = (): void => {
				const symbol = this.currentTicker;
				if (!symbol) return;
				this.fetchQuote(symbol).then((price) => {
					this.quote.set({ price, asOf: new Date().toLocaleTimeString() });
					this.refreshCount.update((count) => count + 1);
				});
			};
			sdk.addEventListener?.('refreshticker', onRefresh);
			this.detachRefresh = () => sdk.removeEventListener?.('refreshticker', onRefresh);
		});
	}

	ngOnDestroy(): void {
		this.destroyed = true;
		this.unsubscribe?.();
		this.detachRefresh?.();
	}

	// Apply host props and, when the ticker changes, seed a fresh quote.
	private applyProps(props: AccountProps): void {
		this.account.set(props);
		const symbol = props.tickerSymbol ?? null;
		if (symbol && symbol !== this.currentTicker) {
			this.currentTicker = symbol;
			this.fetchQuote(symbol).then((price) =>
				this.quote.set({ price, asOf: new Date().toLocaleTimeString() }),
			);
		}
	}

	// Stand-in for a real market feed. A production guest would fetch() its own
	// quote API here; we derive a stable base price from the symbol and add a
	// little jitter so each host refresh visibly moves the number.
	private async fetchQuote(symbol: string): Promise<number> {
		const base = [...symbol].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 500;
		const jitter = (Math.random() - 0.5) * 4;
		return Math.max(1, base + jitter);
	}
}
