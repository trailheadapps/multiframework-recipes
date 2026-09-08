/**
 * Send To Host — Account scoring matrix
 *
 * A 3×3 grid over engagement × fit. Each cell maps to a (Rating, Type) pair.
 * Clicking fires a `score` CustomEvent through viewSDK.dispatchEvent; the host
 * reads `rating` and `type` off the detail and writes them with updateRecord.
 *
 * @see ReceiveEventComponent — receiving events the other direction (host → guest)
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

type Engagement = 'low' | 'medium' | 'high';
type Fit = 'poor' | 'partial' | 'strong';
type Rating = 'Hot' | 'Warm' | 'Cold';

interface Cell {
	rating: Rating;
	type: string;
}

interface HostProps {
	recordId?: string;
	rating?: Rating | null;
	type?: string | null;
}

// Rows: engagement (high → low). Cols: fit (poor → strong).
// High engagement + strong fit → Hot; low + poor → Cold; middle band → Warm.
const MATRIX: Record<Engagement, Record<Fit, Cell>> = {
	high: {
		poor: { rating: 'Warm', type: 'Prospect' },
		partial: { rating: 'Warm', type: 'Customer - Channel' },
		strong: { rating: 'Hot', type: 'Customer - Direct' },
	},
	medium: {
		poor: { rating: 'Cold', type: 'Prospect' },
		partial: { rating: 'Warm', type: 'Customer - Channel' },
		strong: { rating: 'Warm', type: 'Customer - Direct' },
	},
	low: {
		poor: { rating: 'Cold', type: 'Prospect' },
		partial: { rating: 'Cold', type: 'Customer - Channel' },
		strong: { rating: 'Warm', type: 'Technology Partner' },
	},
};

const RATING_STYLE: Record<Rating, string> = {
	Hot: 'bg-red-100 text-red-900 hover:bg-red-200 dark:bg-red-950 dark:text-red-100',
	Warm: 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-100',
	Cold: 'bg-sky-100 text-sky-900 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-100',
};

@Component({
	selector: 'app-send-to-host',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [BadgeImports, CardImports, IconComponent],
	templateUrl: './send-to-host.html',
})
export class SendToHostComponent implements OnInit, OnDestroy {
	protected readonly engagements: Engagement[] = ['high', 'medium', 'low'];
	protected readonly fits: Fit[] = ['poor', 'partial', 'strong'];

	// Base cell classes; the per-cell rating tint is appended in the template.
	protected readonly cellBase =
		'ring-foreground/10 focus-visible:ring-primary flex flex-col items-center gap-1 rounded-md px-2 py-3 text-xs font-medium ring-1 transition focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50';

	protected readonly host = signal<HostProps>({});
	protected readonly connected = computed(() => Boolean(this.host().recordId));

	private destroyed = false;
	private unsubscribe?: () => void;

	ngOnInit(): void {
		getViewSDK().then((sdk) => {
			if (this.destroyed) return;
			const ui = sdk.getUiState?.();
			if (!ui) return;
			this.host.set(ui.state.props as HostProps);
			this.unsubscribe = ui.subscribe((next) => this.host.set(next.props as HostProps));
		});
	}

	ngOnDestroy(): void {
		this.destroyed = true;
		this.unsubscribe?.();
	}

	protected cell(engagement: Engagement, fit: Fit): Cell {
		return MATRIX[engagement][fit];
	}

	protected cellStyle(engagement: Engagement, fit: Fit): string {
		return RATING_STYLE[MATRIX[engagement][fit].rating];
	}

	protected async score(engagement: Engagement, fit: Fit): Promise<void> {
		if (!this.connected()) return;
		const { rating, type } = MATRIX[engagement][fit];
		const sdk = await getViewSDK();
		sdk.dispatchEvent?.(new CustomEvent('score', { detail: { rating, type }, bubbles: true }));
	}
}
