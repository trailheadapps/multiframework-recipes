import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardImports } from '../../components/ui/card/card';
import { IconComponent } from '../../components/ui/icon/icon';

// GitHub source for the guest recipes. The host LWCs live in the
// microfrontend-recipes package; this page lists the guests, so it points at
// the guest sources here.
const GUEST_SOURCE_BASE =
	'https://github.com/trailheadapps/multiframework-recipes/blob/main/force-app/main/angular-recipes/uiBundles/angularRecipes/src/app/recipes/embedding';

interface EmbeddingRecipe {
	name: string;
	route: string;
	source: string;
	description: string;
}

@Component({
	selector: 'app-embedding',
	changeDetection: ChangeDetectionStrategy.OnPush,
	imports: [RouterLink, CardImports, IconComponent],
	templateUrl: './embedding.html',
})
export class EmbeddingComponent {
	protected readonly recipes: EmbeddingRecipe[] = [
		{
			name: 'Basic Render',
			route: '/embedding/basic-render',
			source: `${GUEST_SOURCE_BASE}/basic-render/basic-render.ts`,
			description:
				'The minimum viable guest. Reads Account fields the host pushes over the SDK ui-state channel and renders them as a card.',
		},
		{
			name: 'Send to Host',
			route: '/embedding/send-to-host',
			source: `${GUEST_SOURCE_BASE}/send-to-host/send-to-host.ts`,
			description:
				'A scoring matrix; clicking a cell dispatches a score event the host writes back to the record.',
		},
		{
			name: 'Read Host Data',
			route: '/embedding/read-host-data',
			source: `${GUEST_SOURCE_BASE}/read-host-data/read-host-data.ts`,
			description:
				'Subscribes to live host updates — each change the host pushes re-renders the guest.',
		},
		{
			name: 'Unsaved Changes',
			route: '/embedding/unsaved-changes',
			source: `${GUEST_SOURCE_BASE}/unsaved-changes/unsaved-changes.ts`,
			description:
				'An editable form that marks dirty state, so the record page shows a Save/Discard bar and warns before navigating away.',
		},
		{
			name: 'Theme Tokens',
			route: '/embedding/theme-tokens',
			source: `${GUEST_SOURCE_BASE}/theme-tokens/theme-tokens.ts`,
			description:
				'The host sends a theme name; the guest maps it to CSS variables its components read.',
		},
		{
			name: 'Auto Resize',
			route: '/embedding/auto-resize',
			source: `${GUEST_SOURCE_BASE}/auto-resize/auto-resize.ts`,
			description:
				"Add or remove items and the embedded iframe's height follows the guest's content automatically.",
		},
		{
			name: 'Receive Event',
			route: '/embedding/receive-event',
			source: `${GUEST_SOURCE_BASE}/receive-event/receive-event.ts`,
			description:
				'The host pushes an event down to the guest (a live stock quote) — the mirror of Send to Host.',
		},
	];
}
