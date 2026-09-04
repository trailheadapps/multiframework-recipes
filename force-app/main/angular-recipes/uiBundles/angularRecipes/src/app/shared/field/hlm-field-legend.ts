import { Directive, input } from '@angular/core';
import { classes } from '@spartan-ng/styles/utils';

@Directive({
	selector: 'legend[hlmFieldLegend]',
	host: {
		'data-slot': 'field-legend',
		'[attr.data-variant]': 'variant()',
	},
})
export class HlmFieldLegend {
	public readonly variant = input<'label' | 'legend'>('legend');

	constructor() {
		classes(
			() => 'mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base',
		);
	}
}
