import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Stat Card
 *
 * A single dashboard metric: a large count with a label and a colored left
 * accent border. Shared by the recipes that render dashboard-style tallies so
 * each recipe stays focused on its data, not on repeated card markup.
 */
@Component({
	selector: 'app-stat-card',
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: { class: 'block' },
	templateUrl: './stat-card.html',
})
export class StatCardComponent {
	readonly label = input.required<string>();
	readonly count = input.required<number>();
	// A Tailwind left-border color class, e.g. 'border-l-primary' or 'border-l-rose-400'.
	readonly accent = input<string>('border-l-primary');
}
