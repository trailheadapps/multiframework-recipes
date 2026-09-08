import { Directive } from '@angular/core';
import { BrnSelectLabel } from '@spartan-ng/brain/select';
import { classes } from '@spartan-ng/styles/utils';

@Directive({
	selector: '[hlmSelectLabel],hlm-select-label',
	hostDirectives: [{ directive: BrnSelectLabel, inputs: ['id'] }],
	host: { 'data-slot': 'select-label' },
})
export class HlmSelectLabel {
	constructor() {
		classes(() => 'text-muted-foreground px-1.5 py-1 text-xs flex');
	}
}
