import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons, provideNgIconsConfig } from '@ng-icons/core';
import { lucideLoader2 } from '@ng-icons/lucide';
import { classes } from '@spartan-ng/styles/utils';

@Component({
	selector: 'hlm-spinner',
	imports: [NgIcon],
	providers: [provideIcons({ lucideLoader2 }), provideNgIconsConfig({ size: '1em' })],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		'data-slot': 'spinner',
	},
	template: ` <ng-icon [name]="icon()" /> `,
})
export class HlmSpinner {
	/**
	 * The name of the icon to be used as the spinner.
	 * Use provideIcons({ ... }) to register custom icons.
	 */
	public readonly icon = input<string>('lucideLoader2');

	constructor() {
		classes(() => 'inline-flex motion-safe:animate-spin');
	}
}
