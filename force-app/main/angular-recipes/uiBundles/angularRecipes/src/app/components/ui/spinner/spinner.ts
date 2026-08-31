import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HlmSpinnerImports } from '@spartan-ng/styles/spinner';
import { classes } from '@spartan-ng/styles/utils';

@Component({
	selector: 'app-spinner',
	imports: [HlmSpinnerImports],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		role: 'status',
		'[attr.aria-label]': 'ariaLabel()',
	},
	template: `<hlm-spinner />`,
})
export class SpinnerComponent {
	public readonly ariaLabel = input<string>('Loading', { alias: 'aria-label' });

	constructor() {
		classes(() => 'text-[length:--spacing(4)]');
	}
}

export const SpinnerImports = [SpinnerComponent] as const;
