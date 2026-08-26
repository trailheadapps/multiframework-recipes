import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/styles/utils';

@Directive({
	selector: '[hlmCardAction]',
	host: { 'data-slot': 'card-action' },
})
export class HlmCardAction {
	constructor() {
		classes(() => 'col-end-[-1] row-span-2 row-start-1 self-start justify-self-end');
	}
}
