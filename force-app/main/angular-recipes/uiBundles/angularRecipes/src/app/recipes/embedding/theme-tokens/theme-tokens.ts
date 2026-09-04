/**
 * Theme Tokens
 *
 * The host sends a theme name (`light`, `dark`, or `salesforce`). The guest
 * decides what each name looks like. The root wrapper's class controls a set of
 * CSS variables; the spartan-ng primitives (Card, Badge…) read those variables
 * through their existing utility classes (bg-card, text-foreground, …), so no
 * component code has to know about the theme.
 *
 * Where the CSS lives:
 *   - `light` — implicit default from the app's :root variables (styles.css).
 *   - `dark`  — the app's global `.dark {}` block overrides those variables.
 *   - `salesforce` — an SLDS-flavored palette in theme-tokens-salesforce.css,
 *     scoped to this component and applied via the `.salesforce` wrapper class.
 *
 * @see BasicRenderComponent — the same Account card shape without theming
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

type Theme = 'light' | 'dark' | 'salesforce';

interface Payload {
	theme?: Theme;
	recordId?: string;
	name?: string | null;
	industry?: string | null;
	type?: string | null;
	website?: string | null;
}

@Component({
	selector: 'app-theme-tokens',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [BadgeImports, CardImports, IconComponent],
	templateUrl: './theme-tokens.html',
	styleUrl: './theme-tokens-salesforce.css',
})
export class ThemeTokensComponent implements OnInit, OnDestroy {
	protected readonly payload = signal<Payload>({});
	protected readonly theme = computed<Theme>(() => this.payload().theme ?? 'light');
	protected readonly connected = computed(() => Boolean(this.payload().recordId));

	private destroyed = false;
	private unsubscribe?: () => void;

	ngOnInit(): void {
		getViewSDK().then((sdk) => {
			if (this.destroyed) return;
			const ui = sdk.getUiState?.();
			if (!ui) return;
			this.payload.set(ui.state.props as Payload);
			this.unsubscribe = ui.subscribe((next) => this.payload.set(next.props as Payload));
		});
	}

	ngOnDestroy(): void {
		this.destroyed = true;
		this.unsubscribe?.();
	}

	protected normalizeUrl(url: string): string {
		return /^https?:\/\//i.test(url) ? url : `https://${url}`;
	}
}
